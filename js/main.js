// Renders Publications (auto-synced from ORCID via GitHub Action) and
// Projects (manually maintained) from local JSON files.
// Both files live in /data and are same-origin, so this works on GitHub Pages
// with no API keys or CORS issues.

document.getElementById("year").textContent = new Date().getFullYear();

function fmtDate(pub) {
  const parts = [pub.year, pub.month].filter(Boolean);
  return parts.join("-");
}

async function loadPublications() {
  const list = document.getElementById("pub-list");
  try {
    const res = await fetch("data/publications.json", { cache: "no-store" });
    const pubs = await res.json();
    if (!Array.isArray(pubs) || pubs.length === 0) {
      list.innerHTML = "<li class='pub-loading'>No publications found yet.</li>";
      return;
    }
    // newest first
    pubs.sort((a, b) => (b.year || 0) - (a.year || 0));
    const recent = pubs.slice(0, 8);
    list.innerHTML = recent
      .map(
        (p) => `
      <li>
        <div class="pub-title">${p.title}</div>
        <div class="pub-meta">${[p.journal, p.year].filter(Boolean).join(" · ")}</div>
        ${p.doi ? `<a class="pub-doi" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI: ${p.doi} ↗</a>` : ""}
      </li>`
      )
      .join("");
  } catch (e) {
    list.innerHTML = "<li class='pub-loading'>Publications will appear here once the ORCID sync runs. See README.md.</li>";
  }
}

async function loadProjects() {
  const el = document.getElementById("project-list");
  try {
    const res = await fetch("data/projects.json", { cache: "no-store" });
    const projects = await res.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      el.innerHTML = "<p class='pub-loading'>No projects listed yet.</p>";
      return;
    }
    el.innerHTML = projects
      .map(
        (p) => `
      <div class="project-card">
        <div class="proj-title">${p.title}</div>
        <div class="proj-meta">${[p.funder, p.period].filter(Boolean).join(" · ")}</div>
        <p class="proj-desc">${p.description || ""}</p>
      </div>`
      )
      .join("");
  } catch (e) {
    el.innerHTML = "<p class='pub-loading'>Project data could not be loaded.</p>";
  }
}

loadPublications();
loadProjects();
