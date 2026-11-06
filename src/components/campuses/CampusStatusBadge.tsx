import { Badge } from "@/components/ui/primitives";
import type { CampusStatus } from "@/lib/types";

export const campusStatusLabel: Record<CampusStatus, string> = {
  participating: "Participating Campus",
  launching: "Campus Launching Soon",
  not_yet: "Not Yet Participating",
};

export function CampusStatusBadge({ status }: { status: CampusStatus }) {
  const tone = status === "participating" ? "forest" : status === "launching" ? "gold" : "hollow";
  return <Badge tone={tone}>{campusStatusLabel[status]}</Badge>;
}
