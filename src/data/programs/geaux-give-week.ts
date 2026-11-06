import type { FundraisingCampaign } from "@/lib/types";

/**
 * The 2027 campaign record. Every value stays null until an official campaign is live and totals are
 * verified by the beneficiary's own fundraising platform. The leaderboard renders a preview while null.
 */
export const campaign2027: FundraisingCampaign = {
  year: 2027,
  status: "planning",
  beneficiary: null,
  startDate: null,
  endDate: null,
  totals: null,
  topOrganizations: null,
};

export const ggwFaqs: { q: string; a: string }[] = [
  {
    q: "Is Geaux Give Week happening yet?",
    a: "Not yet. It's in development, with the first challenge tentatively planned for Spring 2027. Dates depend on university participation and on approval from the beneficiary charity. We'll announce confirmed details here first.",
  },
  {
    q: "Which charity will it support?",
    a: "No beneficiary has been confirmed. We're considering established charities such as St. Jude Children's Research Hospital and Make-A-Wish, and nothing will be announced until a charity has formally approved the campaign.",
  },
  {
    q: "Does the money go through your organization?",
    a: "No. Donations will go directly to the approved charity through its own authorized donation platform. This website will never collect donations for the challenge.",
  },
  {
    q: "Are donations tax-deductible?",
    a: "Our organization is not a 501(c)(3), so nothing given to us is tax-deductible. Gifts made directly to an approved beneficiary charity may be deductible under that charity's own status — donors should check the charity's receipt and consult a tax advisor.",
  },
  {
    q: "Which universities are participating?",
    a: "None yet. We're beginning conversations with campus leaders across Louisiana. If you'd like your school to take part, use the interest form below.",
  },
  {
    q: "Can student organizations and Greek chapters form teams?",
    a: "That's the plan. Students and organizations — including fraternities, sororities, service groups and clubs — would fundraise as teams representing their university. Detailed rules will be published before any campaign begins.",
  },
  {
    q: "How will rankings stay fair?",
    a: "Only totals verified by the beneficiary's platform will appear on the leaderboard. We expect to rank both total funds raised and funds raised per enrolled student, so smaller campuses can compete with larger ones.",
  },
  {
    q: "How can a business get involved?",
    a: "Businesses can tell us they're interested in sponsoring events, providing resources, or supporting an approved matching initiative. Any matching gift would be made directly to the beneficiary charity under terms agreed in writing.",
  },
];
