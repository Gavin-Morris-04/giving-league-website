"""Run: python3 -m unittest discovery.test_extraction"""
import unittest

from discovery.run import associate_city, extract_age_rules, high_school_suggestion, parse_ical

SNAPSHOT = {"serviceAreas": [
    {"cityKey": "baton-rouge", "name": "Baton Rouge", "surrounding": ["Denham Springs", "Zachary"]},
    {"cityKey": "new-orleans", "name": "New Orleans", "surrounding": ["Metairie", "Kenner"]},
]}


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

    def test_ical_parsing_and_cancellation(self):
        cal = "BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Marsh Planting\nDTSTART:20270312T080000\nDTEND:20270312T120000\nURL:https://example.org/e/1\nSTATUS:CANCELLED\nEND:VEVENT\nEND:VCALENDAR"
        [ev] = parse_ical(cal)
        self.assertEqual((ev["title"], ev["start"], ev["status"]), ("Marsh Planting", "2027-03-12", "CANCELLED"))


if __name__ == "__main__":
    unittest.main()
