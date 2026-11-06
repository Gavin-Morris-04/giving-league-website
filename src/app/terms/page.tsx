import type { Metadata } from "next";
import { LegalPage, Review } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms & Limitations", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Limitations" updated="November 6, 2026">
      <p>By using this website you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>

      <h2>Who we are</h2>
      <p>
        {site.name} is a working name for {site.legalStatus.charAt(0).toLowerCase() + site.legalStatus.slice(1)} <Review />
      </p>

      <h2>The volunteer directory</h2>
      <ul>
        <li>
          Listings describe opportunities run by independent organizations. We are not the organizer, employer or supervisor of any listed
          opportunity, and listing an organization does not mean it partners with or endorses us.
        </li>
        <li>
          We verify listings against each organization&apos;s official website on the date shown, but details change. Always confirm
          requirements, safety rules, age limits and schedules directly with the organization.
        </li>
        <li>
          Registration, waivers and any agreements are between you and the organization. Their terms apply to your participation.
        </li>
        <li>We are not responsible for the content, availability or practices of external websites. <Review /></li>
      </ul>

      <h2>Charity events</h2>
      <p>
        Charity events are organized by independent organizations. Dates are shown only when confirmed on the organizer&apos;s official site; age,
        supervision and fee rules are the organizer&apos;s. Confirm details with the organizer before attending. <Review />
      </p>

      <h2>Geaux Give Week</h2>
      <p>
        Geaux Give Week is coming soon and is exclusively for Louisiana colleges and universities; high schools don&apos;t participate. No dates,
        participating universities or beneficiary charity have been confirmed. When a campaign runs, donations will be made directly to the
        approved charity through its own platform under that charity&apos;s terms. <Review />
      </p>

      <h2>Donations and charity links</h2>
      <p>
        This website does not accept, hold or process donations. Donation and corporate-giving links go to independent charities&apos; own
        websites, and those charities&apos; terms apply. Listed charities are suggested resources, not partners. Information about business giving
        and tax benefits is general information, not tax or legal advice. <Review />
      </p>

      <h2>No tax advice</h2>
      <p>
        {site.name} is not a 501(c)(3) organization. Nothing on this site is tax, legal or financial advice. Payments or sponsorships provided
        to us are not tax-deductible. <Review />
      </p>

      <h2>Submissions</h2>
      <p>
        If you submit a volunteer opportunity, you confirm you&apos;re authorized to share it and that it&apos;s accurate. We may edit
        listings for length and clarity, and we may decline or remove any listing.
      </p>

      <h2>Acceptable use</h2>
      <p>Don&apos;t misuse the site — for example by submitting spam, false information, or attempting to disrupt or access it without permission.</p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent permitted by law, we are not liable for any loss
        or injury arising from use of the site or participation in any listed opportunity. <Review />
      </p>

      <h2>Photography</h2>
      <p>
        Photographs are licensed stock images used for illustration. They do not depict our members, events or partners. See Photo Credits.
      </p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms and will post changes here. These terms are governed by the laws of the State of Louisiana. <Review />
      </p>
    </LegalPage>
  );
}
