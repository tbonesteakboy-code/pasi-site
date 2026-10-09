# pasi-site

Static landing page for pasi.llc (PASI and its flagship product, DossierIQ). Plain HTML and CSS, served by
GitHub Pages. No analytics, cookies, forms or third-party requests (fonts are self-hosted).

- `index.html`, `assets/`: the site.
- `tools/`: build helpers, not deployed. `npm run images` converts the source images (kept outside the repo) to
  responsive WebP/AVIF with metadata stripped; `npm run og` builds the link-preview image.

Served at https://pasi.llc (custom domain via the `CNAME` file; HTTPS enforced in Pages settings).
