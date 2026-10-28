"use client";

import { HorizontalThemes } from "./horizontal";

/** Galeri horizontal; klik kartu melompat ke panggung tema dan memilihnya. */
export function GalleryBridge() {
  return <HorizontalThemes onPick={(id) => window.dispatchEvent(new CustomEvent("md:pick-theme", { detail: id }))} />;
}
