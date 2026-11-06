import { Big_Shoulders, Bricolage_Grotesque, Figtree } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

export const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

/** Event face — used only on Geaux Give Week surfaces. Not preloaded on every page. */
export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
