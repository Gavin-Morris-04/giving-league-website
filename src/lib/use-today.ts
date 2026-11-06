"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/config/site";

/**
 * Today's date (local, ISO yyyy-mm-dd) in the browser.
 *
 * The server render uses the directory's last verification date as a stable reference, so static HTML is
 * deterministic; the client then re-renders with the visitor's real date. Event states (upcoming / awaiting next
 * date / past) are therefore always computed against the real day, never a stale build date.
 */
const subscribe = () => () => {};
const getClient = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const getServer = () => site.directoryVerifiedOn;

export function useToday() {
  return useSyncExternalStore(subscribe, getClient, getServer);
}
