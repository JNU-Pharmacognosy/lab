// Fetches the public work list for an ORCID iD and writes it to data/publications.json
// Uses ORCID's public API (no auth/API key needed): https://pub.orcid.org/v3.0/{orcid}/works
//
// Run manually:   ORCID_ID=0000-0000-0000-0000 node scripts/fetch_orcid.mjs
// Run in CI:       see .github/workflows/sync-publications.yml

import { writeFile } from "node:fs/promises";

const ORCID_ID = process.env.ORCID_ID;

if (!ORCID_ID) {
  console.error("ERROR: set the ORCID_ID environment variable, e.g. 0000-0000-0000-0000");
  process.exit(1);
}

const API_URL = `https://pub.orcid.org/v3.0/${ORCID_ID}/works`;

function pickBestSummary(group) {
  // Each "group" can list the same work as reported by multiple sources
  // (e.g. Crossref, the researcher, the journal). Prefer the one with the
  // most complete metadata (has a journal title and a DOI).
  const summaries = group["work-summary"] || [];
  return (
    summaries.find(
      (s) => s["journal-title"]?.value && (s["external-ids"]?.["external-id"] || []).length
    ) || summaries[0]
  );
}

function extractDoi(summary) {
  const ids = summary?.["external-ids"]?.["external-id"] || [];
  const doi = ids.find((i) => i["external-id-type"] === "doi");
  return doi ? doi["external-id-value"] : null;
}

async function main() {
  console.log(`Fetching ORCID works for ${ORCID_ID} ...`);
  const res = await fetch(API_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`ORCID API request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const groups = data.group || [];

  const publications = groups
    .map((g) => pickBestSummary(g))
    .filter(Boolean)
    .map((s) => ({
      title: s.title?.title?.value || "(untitled)",
      journal: s["journal-title"]?.value || null,
      year: s["publication-date"]?.year?.value
        ? Number(s["publication-date"].year.value)
        : null,
      doi: extractDoi(s),
    }))
    // drop anything with no title at all
    .filter((p) => p.title !== "(untitled)")
    // newest first
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  await writeFile(
    new URL("../data/publications.json", import.meta.url),
    JSON.stringify(publications, null, 2) + "\n"
  );
  console.log(`Wrote ${publications.length} publications to data/publications.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
