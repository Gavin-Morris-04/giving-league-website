import type { StaticImageData } from "next/image";
import batonRougeBridge from "@/assets/photos/baton-rouge-bridge.jpg";
import batonRougeRiverfront from "@/assets/photos/baton-rouge-riverfront.jpg";
import beachCleanup from "@/assets/photos/beach-cleanup.jpg";
import cleanupClipboard from "@/assets/photos/cleanup-clipboard.jpg";
import cleanupGroup from "@/assets/photos/cleanup-group.jpg";
import cleanupPark from "@/assets/photos/cleanup-park.jpg";
import cleanupSmile from "@/assets/photos/cleanup-smile.jpg";
import communityGarden from "@/assets/photos/community-garden.jpg";
import cypressSwamp from "@/assets/photos/cypress-swamp.jpg";
import dockSunset from "@/assets/photos/dock-sunset.jpg";
import foodBankSorting from "@/assets/photos/food-bank-sorting.jpg";
import gardenHands from "@/assets/photos/garden-hands.jpg";
import heroLakeshoreCleanup from "@/assets/photos/hero-lakeshore-cleanup.jpg";
import liveOakBayou from "@/assets/photos/live-oak-bayou.jpg";
import newOrleansStreet from "@/assets/photos/new-orleans-street.jpg";
import newOrleansStreetcar from "@/assets/photos/new-orleans-streetcar.jpg";
import shelterDog from "@/assets/photos/shelter-dog.jpg";
import tutoringLibrary from "@/assets/photos/tutoring-library.jpg";

/**
 * Licensed photography. All images are from Unsplash under the Unsplash License (free for commercial use,
 * no permission needed; attribution provided anyway on /credits). They are illustrative stock photographs and
 * do NOT show this organization's members, events or partners.
 */
export type Photo = {
  src: StaticImageData;
  alt: string;
  photographer: string;
  profile: string;
  source: string;
};

const unsplash = (id: string) => `https://unsplash.com/photos/${id}`;
const profile = (handle: string) => `https://unsplash.com/@${handle}`;

export const photos = {
  heroLakeshoreCleanup: {
    src: heroLakeshoreCleanup,
    alt: "Young volunteers picking up litter along a sunny lakeshore",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("FJRYUL_YHXg"),
  },
  foodBankSorting: {
    src: foodBankSorting,
    alt: "Volunteers sorting canned food and produce donations at a long table",
    photographer: "Joel Muniz",
    profile: profile("jmuniz"),
    source: unsplash("3k3l2brxmwQ"),
  },
  cleanupGroup: {
    src: cleanupGroup,
    alt: "A group of young volunteers holding trash bags after a park cleanup",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("NGdaKKVt4w0"),
  },
  cleanupClipboard: {
    src: cleanupClipboard,
    alt: "A volunteer with a clipboard coordinating a cleanup in a wooded park",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("kylBMLIliWM"),
  },
  cleanupPark: {
    src: cleanupPark,
    alt: "Volunteers picking up litter in a park with blue trash bags",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("U20gjfPjtuI"),
  },
  cleanupSmile: {
    src: cleanupSmile,
    alt: "A smiling young volunteer during a park cleanup",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("VMCIvrcUCMk"),
  },
  beachCleanup: {
    src: beachCleanup,
    alt: "Volunteers carrying bags of litter along a shoreline",
    photographer: "Vitaly Gariev",
    profile: profile("silverkblack"),
    source: unsplash("ok8eq-pYzfc"),
  },
  gardenHands: {
    src: gardenHands,
    alt: "Gloved hands planting seedlings in dark soil",
    photographer: "Erwin Bosman",
    profile: profile("erwinbosman"),
    source: unsplash("6xMClJG5dW8"),
  },
  communityGarden: {
    src: communityGarden,
    alt: "People working together in a community garden beside greenhouses",
    photographer: "Haberdoedas",
    profile: profile("haberdoedas"),
    source: unsplash("UAVXHBmVDOQ"),
  },
  batonRougeRiverfront: {
    src: batonRougeRiverfront,
    alt: "Downtown Baton Rouge and the Louisiana State Capitol seen across the Mississippi riverfront",
    photographer: "Gower Brown",
    profile: profile("gbnl"),
    source: unsplash("tOPgTeZ53cM"),
  },
  batonRougeBridge: {
    src: batonRougeBridge,
    alt: "The Mississippi River bridge at Baton Rouge under a blue sky",
    photographer: "Gower Brown",
    profile: profile("gbnl"),
    source: unsplash("OM-dJOATdJs"),
  },
  cypressSwamp: {
    src: cypressSwamp,
    alt: "Cypress trees standing in still swamp water at golden hour",
    photographer: "Nicole Herrero",
    profile: profile("nicolesherrero"),
    source: unsplash("GIVNfPMfcjU"),
  },
  liveOakBayou: {
    src: liveOakBayou,
    alt: "Live oaks draped in Spanish moss beside a quiet bayou",
    photographer: "Kool C",
    profile: profile("koolcreation"),
    source: unsplash("BhC9d0J6x9A"),
  },
  dockSunset: {
    src: dockSunset,
    alt: "A dock on calm Louisiana water at sunset",
    photographer: "Kool C",
    profile: profile("koolcreation"),
    source: unsplash("b9Aa-NL7Vxs"),
  },
  newOrleansStreetcar: {
    src: newOrleansStreetcar,
    alt: "A red New Orleans streetcar on a palm-lined avenue",
    photographer: "Gower Brown",
    profile: profile("gbnl"),
    source: unsplash("L50dGUT_MGM"),
  },
  newOrleansStreet: {
    src: newOrleansStreet,
    alt: "Colorful historic buildings with balconies along a sunny New Orleans street",
    photographer: "Fujiphilm",
    profile: profile("fujiphilm"),
    source: unsplash("0offmlXUsOs"),
  },
  tutoringLibrary: {
    src: tutoringLibrary,
    alt: "A volunteer reading a book with a child in a library",
    photographer: "Adam Winger",
    profile: profile("awcreativeut"),
    source: unsplash("7fF0iei80AQ"),
  },
  shelterDog: {
    src: shelterDog,
    alt: "A hand reaching out to a puppy at an animal shelter",
    photographer: "Helena Lopes",
    profile: profile("helenalopesph"),
    source: unsplash("wJY-gPkU-DU"),
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
