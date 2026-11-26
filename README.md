# pasi-site

pasi.llc, the site for PASI and its product DossierIQ. A static site built with Eleventy and published to GitHub Pages
by a GitHub Action (`.github/workflows/pages.yml`). No analytics, cookies or third-party requests: fonts are self-hosted,
and the product views are drawn in HTML and CSS with fictional data, with no screenshots of real matters.

- `src/`: the site. `_includes/base.njk` is the shared layout, `_data/site.json` holds the shared links, and
  `assets/` holds the CSS, Instrument Sans, the brand marks and the link-preview image.
- `npm run build` writes `_site/`; `npm run serve` previews at http://localhost:8099.
- `tools/` holds build helpers that aren't deployed. `npm run og` rebuilds `src/assets/img/og.png`.

Rules: no founder name, photo or initials; commits authored as PASI; every claim true today (anything else labelled
"roadmap"); screenshots only from the fictional PASI Demo Firm, with metadata stripped.

Served at https://pasi.llc (custom domain via `src/CNAME`; HTTPS enforced in the Pages settings).
