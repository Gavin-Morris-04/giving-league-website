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
          <strong>Contact form:</strong> your name, email, subject, optional organization and message.
        </li>
        <li>
          <strong>School representative and Geaux Give Week interest (adults only):</strong> your name, email, connection to the school,
          school, role or organization, interest and an optional message.
        </li>
        <li>
          <strong>Submit a charity event:</strong> organization details, a contact name and email, and the event details you provide.
        </li>
        <li>
          <strong>Submit an opportunity:</strong> organization details, a contact name and email, and the opportunity details you provide.
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
        This site does not set advertising or tracking cookies and does not use third-party analytics. On the Donations page we count clicks on
        outbound charity links as anonymous daily totals per charity — no cookies, IP addresses, device details or identifiers are stored, and
        nothing is counted if your browser sends Do Not Track or Global Privacy Control. These counts are internal statistics, never donations.
        <Review />
      </p>

      <h2>Links to other sites</h2>
      <p>
        Volunteer listings link to other organizations&apos; websites, where you register directly with them. Their privacy policies apply
        to any information you give them.
      </p>

      <h2>High school students and minors</h2>
      <p>
        High school students can use every directory without an account. We don&apos;t publish students&apos; names, photos or contact details,
        we don&apos;t offer messaging between students and other users, and school-involvement forms are meant for adults (teachers, staff,
        advisors, parents or guardians). If a student under 18 uses the contact or updates form, we collect only what that form asks for and use
        it only to reply. We do not knowingly collect information from children under 13; if you believe a child under 13 has sent us information,
        contact us and we&apos;ll delete it. Before any youth registration feature is added, we will review COPPA, state student-privacy rules
        and safeguarding requirements. <Review />
      </p>

      <h2>Retention and your choices</h2>
      <p>
        We keep submissions only as long as needed for the purpose you submitted them for. You can ask us to access, correct or delete your
        information using the contact form or by emailing{" "}
        <a className="link" href={`mailto:${site.contact.email}`}>
          {site.contact.email}
        </a>
        . <Review />
      </p>

      <h2>Changes</h2>
      <p>We&apos;ll post any changes on this page and update the date above.</p>
    </LegalPage>
  );
}
