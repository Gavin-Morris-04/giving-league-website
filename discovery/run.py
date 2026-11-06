"""
The Cause Krewe — daily discovery job (review-gated, $0, Python standard library only).

What it does, once a day in GitHub Actions:
  1. Re-checks every verified listing's official pages (respecting robots.txt, one polite request at a time):
     broken links, and text suggesting a cancellation, closure or expiry.
  2. Reads explicitly stated age requirements from those pages and flags any that differ from what we publish.
  3. Reads the organizations' own public feeds (iCal / RSS) for NEW opportunities and events, associates each with
     a city using the shared location config, extracts age rules only when explicitly stated, and queues everything
     for review. Nothing is assumed: an item with no stated age rule is marked "needs review", never "minors OK".
  4. Writes src/data/discovery/report.json + discovery/REPORT.md. The workflow opens a pull request; nothing changes
     on the website until a person reviews and merges it.

Run locally:  node --experimental-strip-types scripts/export-snapshot.ts && python3 -m discovery.run
"""

from __future__ import annotations

import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "discovery" / ".cache" / "snapshot.json"
SOURCES = ROOT / "discovery" / "sources.json"
REVIEWED = ROOT / "discovery" / "reviewed.json"
PREVIOUS = ROOT / "discovery" / ".cache" / "previous-report.json"
REPORT_JSON = ROOT / "src" / "data" / "discovery" / "report.json"
REPORT_MD = ROOT / "discovery" / "REPORT.md"

USER_AGENT = "CauseKreweDiscovery/1.0 (+https://github.com/Gavin-Morris-04/giving-league-website)"
TIMEOUT = 25
PER_HOST_DELAY = 2.0  # seconds between requests to the same host
MAX_BYTES = 2_000_000

CANCEL_RE = re.compile(
    r"\b(cancel(?:l)?ed|postponed|no longer (?:accepting|available|taking)|registration (?:is )?(?:now )?closed|"
    r"(?:this|the) event has (?:ended|passed)|program (?:has been )?(?:discontinued|paused)|applications are (?:now )?closed)\b",
    re.I,
)
AGE_PATTERNS = [
    re.compile(r"(?:minimum age|must be(?: at least)?|at least|ages?|volunteers? (?:must|need to) be)\D{0,15}?(\d{1,2})\s*(?:\+|or older|and (?:up|older)|years?(?: old| of age)?)", re.I),
    re.compile(r"\b(\d{1,2})\s*(?:\+|and up|or older)\b", re.I),
    re.compile(r"\b(\d{1,2})\s*years? (?:old|of age) (?:or|and) (?:older|up)\b", re.I),
]
ADULT_ONLY_RE = re.compile(r"\b(18\s*\+|18 (?:years? )?(?:or|and) (?:older|up)|adults? only|must be 18)\b", re.I)
GUARDIAN_RE = re.compile(r"\b(parent|guardian)[^.]{0,80}\b(sign|consent|waiver|permission|accompan)", re.I)

_last_hit: dict[str, float] = {}
_robots: dict[str, "urllib.robotparser.RobotFileParser | None | bool"] = {}


# ── HTTP ──────────────────────────────────────────────────────────────────────
def _allowed(url: str) -> bool:
    parts = urllib.parse.urlsplit(url)
    base = f"{parts.scheme}://{parts.netloc}"
    if base not in _robots:
        # Fetch robots.txt with OUR user agent (urllib's default agent is often blocked, and RobotFileParser.read()
        # then treats 401/403 as "disallow everything"). Convention (as Google documents): 4xx = no rules; 5xx or
        # network failure = be conservative and skip the host this run.
        req = urllib.request.Request(base + "/robots.txt", headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                rp = urllib.robotparser.RobotFileParser()
                rp.parse(r.read(200_000).decode("utf-8", "replace").splitlines())
                _robots[base] = rp
        except urllib.error.HTTPError as e:
            _robots[base] = None if 400 <= e.code < 500 and e.code != 429 else False  # type: ignore[assignment]
        except Exception:
            _robots[base] = False  # type: ignore[assignment]
    rp = _robots[base]
    if rp is False:
        return False
    return True if rp is None else rp.can_fetch(USER_AGENT, url)


def fetch(url: str) -> dict:
    """Polite GET. Returns {status, code, text, final_url}. Never raises."""
    if not _allowed(url):
        return {"status": "robots_disallowed", "code": None, "text": "", "final_url": url}
    host = urllib.parse.urlsplit(url).netloc
    wait = PER_HOST_DELAY - (time.monotonic() - _last_hit.get(host, 0))
    if wait > 0:
        time.sleep(wait)
    _last_hit[host] = time.monotonic()
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xml,text/calendar,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            body = r.read(MAX_BYTES).decode(r.headers.get_content_charset() or "utf-8", "replace")
            return {"status": "ok", "code": r.status, "text": body, "final_url": r.geturl()}
    except urllib.error.HTTPError as e:
        # 401/403/429 usually mean bot protection, not a dead page — report as "blocked", never "broken".
        status = "blocked" if e.code in (401, 403, 429) else "broken" if e.code in (404, 410) else "error"
        return {"status": status, "code": e.code, "text": "", "final_url": url}
    except Exception as e:  # DNS failure, timeout, TLS…
        return {"status": "unreachable", "code": None, "text": "", "final_url": url, "error": type(e).__name__}


def page_text(markup: str) -> str:
    markup = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", markup)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"(?s)<[^>]+>", " ", markup))).strip()


# ── Extraction ────────────────────────────────────────────────────────────────
def extract_age_rules(text: str) -> dict:
    ages: set[int] = set()
    for pat in AGE_PATTERNS:
        for m in pat.finditer(text):
            n = int(m.group(1))
            if 5 <= n <= 21:
                ages.add(n)
    snippet = ""
    m = AGE_PATTERNS[0].search(text) or AGE_PATTERNS[1].search(text)
    if m:
        s = max(0, m.start() - 80)
        snippet = text[s : m.end() + 80].strip()
    return {
        "ages": sorted(ages),
        "minimum_age": min(ages) if ages else None,
        "adults_only": bool(ADULT_ONLY_RE.search(text)) and (not ages or min(ages) >= 18),
        "guardian_mentioned": bool(GUARDIAN_RE.search(text)),
        "snippet": snippet[:300],
    }


def high_school_suggestion(rules: dict) -> str:
    """Never assume minors are allowed. Only an explicit minimum of 17 or under (and no 18+ rule) suggests eligibility."""
    if rules["adults_only"] or (rules["minimum_age"] is not None and rules["minimum_age"] >= 18):
        return "not_eligible"
    if rules["minimum_age"] is not None:
        return "eligible_if_confirmed"
    return "needs_review"


# Place names that are also everyday words, surnames, street names or cities in other states ("Central City" is a
# New Orleans neighborhood; "Independence Day"; "Lafayette Square"; "Monroe Street"). They only count when written
# as a Louisiana place ("Central, LA", "City of Central"), or when nothing better matches in a statewide feed.
AMBIGUOUS_PLACES = {
    "central", "independence", "albany", "springfield", "scott", "iowa", "walker", "baker", "calhoun", "arcadia",
    "sulphur", "zachary", "gonzales", "broussard", "bastrop", "lafayette", "monroe", "hammond", "kenner", "marrero",
}
_STREET_SUFFIX = r"(?:st\.?|street|ave\.?|avenue|blvd\.?|boulevard|rd\.?|road|dr\.?|drive|square|sq\.?|hall|park|elementary|middle|high|parish|city|cemetery|plaza|hwy|highway)\b"


def _place_strength(name: str, lowered: str, ambiguous_ok: bool) -> int:
    """3 = written as a Louisiana place; 2 = plain mention; 1 = plain mention of an ambiguous name; 0 = no match."""
    n = re.escape(name.lower())
    if re.search(rf"\b{n},?\s+(?:la\b\.?|louisiana\b)|\bcity of {n}\b|\b{n},?\s+la\s+7\d{{4}}", lowered):
        return 3
    plain = list(re.finditer(rf"\b{n}\b", lowered))
    if not plain:
        return 0
    if name.lower() not in AMBIGUOUS_PLACES:
        return 2
    # "Lafayette Square", "Monroe Street", "Central City" are places named after the word, not the town.
    as_town = [m for m in plain if not re.match(rf"\s+{_STREET_SUFFIX}", lowered[m.end():])]
    return 1 if as_town and ambiguous_ok else 0


def associate_city(text: str, default_city: str, snapshot: dict, location: str = "") -> tuple[str, str | None]:
    """Pick the service area an item belongs to. The feed's own location field wins; then the strongest mention in
    the text; ties go to the organization's home area. Anything uncertain falls back to that home area."""
    for blob, ambiguous_ok in ((location, True), (text, default_city == "statewide")):
        lowered = blob.lower()
        if not lowered.strip():
            continue
        best: list[tuple[int, str, str]] = []
        for area in snapshot["serviceAreas"]:
            for name in [area["name"], *area.get("surrounding", [])]:
                s = _place_strength(name, lowered, ambiguous_ok)
                if s:
                    best.append((s, area["cityKey"], name))
        if best:
            top = max(s for s, _, _ in best)
            winners = [(k, n) for s, k, n in best if s == top]
            home = [(k, n) for k, n in winners if k == default_city]
            return (home or winners)[0]
    return default_city, None


# ── Feeds ─────────────────────────────────────────────────────────────────────
def parse_ical(text: str) -> list[dict]:
    text = re.sub(r"\r?\n[ \t]", "", text)  # unfold lines
    items = []
    for block in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", text, re.S):
        def field(name: str) -> str:
            m = re.search(rf"^{name}(?:;[^:\n]*)?:(.*)$", block, re.M)
            return m.group(1).strip().replace("\\n", " ").replace("\\,", ",") if m else ""
        def date(name: str) -> str | None:
            v = field(name)
            return f"{v[0:4]}-{v[4:6]}-{v[6:8]}" if re.match(r"\d{8}", v) else None
        items.append({
            "title": field("SUMMARY"),
            "url": field("URL"),
            "description": field("DESCRIPTION"),
            "location": field("LOCATION"),
            "start": date("DTSTART"),
            "end": date("DTEND") or date("DTSTART"),
            "status": field("STATUS").upper(),
        })
    return items


def parse_rss(text: str) -> list[dict]:
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return []
    out = []
    for item in root.iter("item"):
        get = lambda tag: (item.findtext(tag) or "").strip()  # noqa: E731
        published = None
        try:
            published = email.utils.parsedate_to_datetime(get("pubDate")).date().isoformat() if get("pubDate") else None
        except (TypeError, ValueError):
            published = None
        out.append({
            "title": get("title"), "url": get("link"), "description": page_text(get("description")), "location": "",
            "start": None, "end": None, "status": "", "published": published,
        })
    return out


def keep_item(src: dict, it: dict, today: str) -> bool:
    """Source-level filters that keep news feeds from proposing press releases, recaps and old posts."""
    blob = " ".join([it["title"], it["description"], it["location"]])
    if src.get("only_if_matches") and not re.search(src["only_if_matches"], blob, re.I):
        return False
    if src.get("exclude_title_matches") and re.search(src["exclude_title_matches"], it["title"], re.I):
        return False
    if src.get("max_age_days") and it.get("published"):
        cutoff = (dt.date.fromisoformat(today) - dt.timedelta(days=int(src["max_age_days"]))).isoformat()
        if it["published"] < cutoff:
            return False
    if it["end"] and it["end"] < today:
        return False  # already over: never propose past dates
    return True


# ── Main ──────────────────────────────────────────────────────────────────────
def normalize_url(url: str) -> str:
    """Compare links regardless of http/https, www. and a trailing slash."""
    return re.sub(r"^https?://(www\.)?", "", url.strip()).rstrip("/").lower()


def louisiana_today() -> str:
    """Today's date in Louisiana (the runner's clock is UTC)."""
    try:
        from zoneinfo import ZoneInfo

        return dt.datetime.now(ZoneInfo("America/Chicago")).date().isoformat()
    except Exception:  # no tz database available: Central Standard Time is close enough for a date
        return (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=6)).date().isoformat()


def is_reviewed(reviewed: list[dict], listing: str, flag: dict) -> bool:
    """A flag a person already looked at and dismissed (discovery/reviewed.json). It comes back as soon as the
    evidence changes — e.g. a different cancellation notice, or a different age on the page."""
    for r in reviewed:
        if r.get("listing") != listing or r.get("type") != flag["type"]:
            continue
        if r.get("evidence_contains") and r["evidence_contains"].lower() not in flag.get("evidence", "").lower():
            continue
        if "found_minimum_age" in r and r["found_minimum_age"] != flag.get("found_minimum_age"):
            continue
        return True
    return False


def check_page(url: str, recorded_min_age: int | None, prev: dict | None, listing: str = "", reviewed: list[dict] | None = None) -> dict:
    reviewed = reviewed or []
    r = fetch(url)
    failures = (prev or {}).get("consecutive_failures", 0)
    failures = failures + 1 if r["status"] in ("broken", "unreachable") else 0
    result = {"url": url, "status": r["status"], "code": r["code"], "consecutive_failures": failures, "flags": [], "reviewed_flags": 0}

    def add(flag: dict) -> None:
        if is_reviewed(reviewed, listing, flag):
            result["reviewed_flags"] += 1
        else:
            result["flags"].append(flag)

    if r["status"] == "ok":
        text = page_text(r["text"])
        # Look at every cancellation-style notice, not just the first: an old, already-reviewed notice on the page
        # must not hide a new one further down.
        for m in list(CANCEL_RE.finditer(text))[:10]:
            flag = {"type": "possible_cancellation", "evidence": text[max(0, m.start() - 100) : m.end() + 100]}
            if not is_reviewed(reviewed, listing, flag):
                result["flags"].append(flag)
                break
            result["reviewed_flags"] += 1
        rules = extract_age_rules(text)
        if rules["minimum_age"] is not None and rules["minimum_age"] != recorded_min_age:
            add({"type": "age_rule_differs", "found_minimum_age": rules["minimum_age"], "recorded_minimum_age": recorded_min_age, "evidence": rules["snippet"]})
    if failures >= 2:
        result["flags"].append({"type": "broken_link", "evidence": f"{r['status']} ({r['code']}) on {failures} consecutive daily checks"})
    return result


def main() -> int:
    if not SNAPSHOT.exists():
        print("Missing snapshot. Run: node --experimental-strip-types scripts/export-snapshot.ts", file=sys.stderr)
        return 2
    snapshot = json.loads(SNAPSHOT.read_text())
    sources = json.loads(SOURCES.read_text())["feeds"]
    reviewed = json.loads(REVIEWED.read_text()).get("flags", []) if REVIEWED.exists() else []
    # Continuity: while a review PR is open, the workflow saves that branch's report here so link-failure counts keep
    # adding up day to day even before anyone merges.
    prev_path = PREVIOUS if PREVIOUS.exists() else REPORT_JSON
    previous = json.loads(prev_path.read_text()) if prev_path.exists() else {}
    prev_checks = previous.get("listings", {})
    today = louisiana_today()

    listings: dict[str, dict] = {}
    known_urls: set[str] = set()
    for o in snapshot["opportunities"]:
        key = f"opportunity:{o['slug']}"
        known_urls.update(normalize_url(u) for u in [o["signupUrl"], o["infoUrl"], *o.get("roleUrls", [])])
        res = check_page(o["signupUrl"], o["minimumAge"], prev_checks.get(key), key, reviewed)
        last_day = o.get("endDate") or o.get("startDate")
        if o.get("kind") == "event" and last_day and last_day < today:
            res["flags"].append({"type": "dated_listing_ended", "evidence": f"Last date was {last_day}. Remove this listing or update it with the organizer's new dates."})
        listings[key] = res
    for e in snapshot["events"]:
        key = f"event:{e['slug']}"
        known_urls.update(normalize_url(u) for u in [e["registrationUrl"], e["infoUrl"]])
        listings[key] = check_page(e["registrationUrl"], None, prev_checks.get(key), key, reviewed)

    candidates = []
    source_status = []
    for src in sources:
        r = fetch(src["url"])
        items = (parse_ical if src["type"] == "ical" else parse_rss)(r["text"]) if r["status"] == "ok" else []
        kept = 0
        for it in items:
            if not it["title"] or not it["url"] or normalize_url(it["url"]) in known_urls:
                continue
            if not keep_item(src, it, today):
                continue
            blob = " ".join([it["title"], it["description"]])
            city, matched = associate_city(blob, src["default_city"], snapshot, it["location"])
            blob = " ".join([blob, it["location"]])
            rules = extract_age_rules(blob)
            cand = {
                "id": hashlib.sha1(it["url"].encode()).hexdigest()[:12],
                "source": src["id"],
                "org_slug": src["org_slug"],
                "kind": src["kind"],
                "title": it["title"][:200],
                "url": it["url"],
                "start": it["start"],
                "end": it["end"],
                "city_key": city,
                "city_matched_on": matched,
                "age_rules": rules,
                "high_school": high_school_suggestion(rules),
                "cancelled": it["status"] == "CANCELLED",
                "review": "required",
            }
            candidates.append(cand)
            kept += 1
        source_status.append({"id": src["id"], "status": r["status"], "code": r["code"], "items_seen": len(items), "candidates": kept})

    candidates.sort(key=lambda c: (c["start"] or "9999", c["title"]))
    report = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "generatedOn": today,
        "listings": dict(sorted(listings.items())),
        "candidates": candidates,
        "sources": source_status,
    }

    # Only write (and therefore only open a PR) when findings actually changed.
    def signature(rep: dict) -> str:
        core = {
            "listings": {k: {"status": v["status"], "failures": v["consecutive_failures"], "flags": [f["type"] for f in v["flags"]]} for k, v in rep.get("listings", {}).items()},
            "candidates": [c["id"] for c in rep.get("candidates", [])],
        }
        return hashlib.sha1(json.dumps(core, sort_keys=True).encode()).hexdigest()

    if previous and signature(previous) == signature(report):
        print("No changes in findings; report left untouched.")
        return 0

    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    REPORT_MD.write_text(render_markdown(report))
    print(f"Report updated: {sum(bool(v['flags']) for v in listings.values())} flagged listings, {len(candidates)} candidates.")
    return 0


def render_markdown(report: dict) -> str:
    lines = [
        "# Daily discovery report",
        "",
        f"Generated {report['generatedAt']}. **Review required — nothing here is published automatically.**",
        "",
        "## Listings that need attention",
        "",
    ]
    flagged = [(k, v) for k, v in report["listings"].items() if v["flags"]]
    if not flagged:
        lines.append("None.")
    for key, v in flagged:
        for f in v["flags"]:
            lines.append(f"- **{key}** — `{f['type']}`: {f.get('evidence', '')[:240]}  \n  {v['url']}")
    reviewed_count = sum(v.get("reviewed_flags", 0) for v in report["listings"].values())
    if reviewed_count:
        lines += ["", f"{reviewed_count} finding(s) you already reviewed and dismissed are hidden (see `discovery/reviewed.json`)."]
    hidden = [k for k, v in report["listings"].items() if any(f["type"] == "broken_link" for f in v["flags"])]
    if hidden:
        lines += ["", f"Merging this PR hides {len(hidden)} listing(s) with broken links until they're fixed: " + ", ".join(hidden)]
    lines += ["", "## New items found in organizations' public feeds", ""]
    if not report["candidates"]:
        lines.append("None.")
    for c in report["candidates"]:
        age = c["age_rules"]
        age_text = f"min age {age['minimum_age']}" if age["minimum_age"] is not None else "no age rule stated"
        lines.append(
            f"- [{c['title']}]({c['url']}) — {c['source']} · {c['city_key']}"
            f"{' · ' + c['start'] if c['start'] else ''} · {age_text} · high school: **{c['high_school']}**"
            f"{' · CANCELLED' if c['cancelled'] else ''}"
        )
    lines += [
        "",
        "## How to publish a new item",
        "",
        "Confirm it on the organization's official page, then add it to `src/data/verified/opportunities.ts` or",
        "`src/data/verified/charity-events.ts` with verified age rules. Unclear eligibility stays `unverified`.",
        "",
        "## Dismissing a finding",
        "",
        "If a flag above is a false alarm, add it to `discovery/reviewed.json` (listing, type, and a phrase from the",
        "evidence). It stays hidden until the page's wording changes.",
        "",
        "## Sources",
        "",
    ]
    for s in report["sources"]:
        lines.append(f"- {s['id']}: {s['status']} ({s['code']}), {s['items_seen']} items, {s['candidates']} new")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    sys.exit(main())
