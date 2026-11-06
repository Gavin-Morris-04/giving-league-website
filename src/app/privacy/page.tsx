import type { Metadata } from "next";
import { LegalPage, Review } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 6, 2026">
      <p>
        This policy explains what information {site.name} (&ldquo;we&rdquo;, a working name for an emerging student-led initiative based in{" "}
        {site.founded.city}, {site.founded.state}) collects through this website and how it is used.
      </p>

      <h2>Information you give us</h2>
      <p>We collect information only when you choose to submit a form:</p>
      <ul>
        <li>
          <strong>Contact form:</strong> your name, email, topic and message.
        </li>
        <li>
          <strong>Campus representative and Geaux Give Week interest:</strong> your name, email, campus, role or organization, interest
          and an optional message.
        </li>
        <li>
          <strong>Submit an opportunity:</strong> organization details, a contact name and email, and the opportunity details you provide.
        </li>
        <li>
          <strong>Partnership inquiry:</strong> your name, email, organization, optional website, and message.
        </li>
        <li>
          <strong>Updates signup:</strong> your email and, optionally, your campus.
        </li>
      </ul>
      <p>
        When a form is submitted we also record the page it came from, the time, and your browser&apos;s user-agent string to help prevent
        abuse. We do not collect payment information — this website does not accept donations.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To reply to you and follow up on the request you made.</li>
        <li>To review and verify volunteer listings before they are published.</li>
        <li>To send announcements you signed up for. Every email will include a way to unsubscribe.</li>
      </ul>
      <p>We do not sell or rent personal information, and we do not use it for advertising.</p>

      <h2>Where it&apos;s stored</h2>
      <p>
        When submissions are enabled, form data is stored in a database hosted by our infrastructure provider (Supabase) and the site is
        hosted by Vercel. Access is limited to authorized members of our team. <Review />
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        This site does not set advertising or tracking cookies and does not currently use third-party analytics. If that changes, this policy
        will be updated first. <Review />
      </p>

      <h2>Links to other sites</h2>
      <p>
        Volunteer listings link to other organizations&apos; websites, where you register directly with them. Their privacy policies apply
        to any information you give them.
      </p>

      <h2>Students under 18</h2>
      <p>
        This site is intended for college students and adults. We do not knowingly collect information from children under 13. <Review />
      </p>

      <h2>Retention and your choices</h2>
      <p>
        We keep submissions only as long as needed for the purpose you submitted them for. You can ask us to access, correct or delete your
        information using the contact form. <Review />
      </p>

      <h2>Changes</h2>
      <p>We&apos;ll post any changes on this page and update the date above.</p>
    </LegalPage>
  );
}
