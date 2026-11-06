"""Run: python3 -m unittest discovery.test_extraction"""
import unittest

from discovery.run import associate_city, extract_age_rules, high_school_suggestion, is_reviewed, keep_item, normalize_url, parse_ical

SNAPSHOT = {"serviceAreas": [
    {"cityKey": "baton-rouge", "name": "Baton Rouge", "surrounding": ["Central", "Denham Springs", "Zachary"]},
    {"cityKey": "new-orleans", "name": "New Orleans", "surrounding": ["Metairie", "Kenner"]},
    {"cityKey": "lafayette", "name": "Lafayette", "surrounding": ["Scott", "Broussard"]},
    {"cityKey": "hammond", "name": "Hammond", "surrounding": ["Independence", "Ponchatoula"]},
]}
NEWS = {"only_if_matches": "volunteer|drive|event", "exclude_title_matches": r"\b(announc\w*|awards?|citations?|the role of)\b", "max_age_days": 60}


def item(title, description="", published=None, end=None):
    return {"title": title, "description": description, "location": "", "published": published, "end": end}


class ExtractionTests(unittest.TestCase):
    def test_explicit_minimum_age(self):
        r = extract_age_rules("Volunteers must be at least 16 years old to work on the build site.")
        self.assertEqual(r["minimum_age"], 16)
        self.assertEqual(high_school_suggestion(r), "eligible_if_confirmed")

    def test_plus_notation(self):
        self.assertEqual(extract_age_rules("Open to ages 14+ with a parent.")["minimum_age"], 14)

    def test_adults_only_is_never_suggested_for_high_school(self):
        r = extract_age_rules("Shelter volunteers must be 18 or older.")
        self.assertEqual(high_school_suggestion(r), "not_eligible")

    def test_no_stated_rule_needs_review_not_assumed(self):
        r = extract_age_rules("Join us Saturday to sort food at our warehouse!")
        self.assertIsNone(r["minimum_age"])
        self.assertEqual(high_school_suggestion(r), "needs_review")

    def test_guardian_language(self):
        self.assertTrue(extract_age_rules("A parent or guardian must sign the waiver.")["guardian_mentioned"])

    def test_city_association_uses_surrounding_communities(self):
        self.assertEqual(associate_city("Cleanup at Metairie park", "statewide", SNAPSHOT), ("new-orleans", "Metairie"))
        self.assertEqual(associate_city("Statewide drive", "statewide", SNAPSHOT), ("statewide", None))

    def test_everyday_words_are_not_towns(self):
        # Found in the first live report: "Central City" (New Orleans) and "independence" were filed elsewhere.
        self.assertEqual(associate_city("Recirculating Farms @ Jackson Ave. in Central City", "new-orleans", SNAPSHOT), ("new-orleans", None))
        self.assertEqual(associate_city("Teach skills for independence and confidence", "new-orleans", SNAPSHOT), ("new-orleans", None))
        self.assertEqual(associate_city("Tree planting, Central Time start", "new-orleans", SNAPSHOT), ("new-orleans", None))

    def test_ambiguous_towns_count_when_written_as_places(self):
        self.assertEqual(associate_city("Cleanup at the park in Central, LA", "new-orleans", SNAPSHOT), ("baton-rouge", "Central"))
        self.assertEqual(associate_city("City of Independence food drive", "statewide", SNAPSHOT), ("hammond", "Independence"))

    def test_street_names_are_not_cities(self):
        self.assertEqual(associate_city("Meet at Lafayette Square downtown", "new-orleans", SNAPSHOT), ("new-orleans", None))
        self.assertEqual(associate_city("Cleanup in Lafayette, Louisiana", "new-orleans", SNAPSHOT), ("lafayette", "Lafayette"))

    def test_home_area_wins_ties_and_location_field_wins(self):
        self.assertEqual(associate_city("Baton Rouge and New Orleans volunteers welcome", "new-orleans", SNAPSHOT), ("new-orleans", "New Orleans"))
        self.assertEqual(associate_city("Planting day", "new-orleans", SNAPSHOT, location="Denham Springs, LA 70726"), ("baton-rouge", "Denham Springs"))

    def test_news_filters_drop_press_releases_and_old_posts(self):
        today = "2026-11-06"
        self.assertTrue(keep_item(NEWS, item("Volunteer at our holiday food drive", published="2026-10-20"), today))
        self.assertFalse(keep_item(NEWS, item("Award recipients announced", "volunteer groups honored", "2026-11-01"), today))
        self.assertFalse(keep_item(NEWS, item("The Role of Local Partners", "volunteer drive", "2026-11-01"), today))
        self.assertFalse(keep_item(NEWS, item("Volunteer at our summer event", published="2026-06-01"), today))
        self.assertFalse(keep_item({}, item("Marsh planting", end="2026-11-01"), today))

    def test_reviewed_flags_stay_hidden_until_evidence_changes(self):
        reviewed = [
            {"listing": "event:x", "type": "possible_cancellation", "evidence_contains": "Nutria"},
            {"listing": "opportunity:y", "type": "age_rule_differs", "found_minimum_age": 16, "evidence_contains": "Construction Site"},
        ]
        self.assertTrue(is_reviewed(reviewed, "event:x", {"type": "possible_cancellation", "evidence": "CANCELED! Jean Lafitte Nutria Clean-Up"}))
        self.assertFalse(is_reviewed(reviewed, "event:x", {"type": "possible_cancellation", "evidence": "Love the Boot Week is cancelled"}))
        self.assertTrue(is_reviewed(reviewed, "opportunity:y", {"type": "age_rule_differs", "found_minimum_age": 16, "evidence": "at a Habitat Construction Site"}))
        self.assertFalse(is_reviewed(reviewed, "opportunity:y", {"type": "age_rule_differs", "found_minimum_age": 18, "evidence": "at a Habitat Construction Site"}))

    def test_url_normalization(self):
        self.assertEqual(normalize_url("http://www.Example.org/need/?id=1/"), normalize_url("https://example.org/need/?id=1"))

    def test_ical_parsing_and_cancellation(self):
        cal = "BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Marsh Planting\nDTSTART:20270312T080000\nDTEND:20270312T120000\nURL:https://example.org/e/1\nSTATUS:CANCELLED\nEND:VEVENT\nEND:VCALENDAR"
        [ev] = parse_ical(cal)
        self.assertEqual((ev["title"], ev["start"], ev["status"]), ("Marsh Planting", "2027-03-12", "CANCELLED"))


if __name__ == "__main__":
    unittest.main()
