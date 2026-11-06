import Image from "next/image";
import { UserRound } from "lucide-react";
import { site } from "@/config/site";

/**
 * Editable founder profile. Reads `site.founder`. While `published` is false it renders an honest
 * placeholder; nothing about the founder is invented. To publish, fill name/bio, add a photo under
 * /public/team/ and set `photo: "/team/<file>.jpg"`, then set `published: true`.
 */
export function FounderProfile() {
  const f = site.founder;
  if (!f.published || !f.name) {
    return (
      <div className="flex flex-col gap-6 rounded-md border border-dashed border-hairline-strong bg-paper p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="grid size-28 shrink-0 place-items-center rounded-full bg-sand">
          <UserRound aria-hidden className="size-12 text-ink-muted" strokeWidth={1.25} />
        </div>
        <div>
          <p className="text-label text-ink-muted">{f.role}</p>
          <p className="text-h3 mt-1 text-navy">Founder profile coming soon</p>
          <p className="mt-2 text-ink-muted">
            {site.name} was founded by a student at {f.school}. A profile will be added here once it&apos;s been written and approved.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 rounded-md border border-hairline bg-paper p-6 sm:flex-row sm:items-start sm:p-8">
      {f.photo ? (
        <Image src={f.photo} alt={`Portrait of ${f.name}`} width={112} height={112} className="size-28 shrink-0 rounded-full object-cover" />
      ) : null}
      <div>
        <p className="text-label text-ink-muted">
          {f.role} · {f.school}
        </p>
        <p className="text-h3 mt-1 text-navy">{f.name}</p>
        <p className="mt-3 measure text-ink-muted">{f.bio}</p>
      </div>
    </div>
  );
}
