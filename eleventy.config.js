// pasi.llc: Eleventy builds src/ into _site/, which a GitHub Action publishes to GitHub Pages. Static HTML and CSS only.
export default function (config) {
  config.addPassthroughCopy({ 'src/assets': 'assets' });
  for (const file of ['CNAME', 'favicon.svg', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml']) config.addPassthroughCopy(`src/${file}`);
  // A strip of 60 look-back months: on file, missing or to review, from a compact pattern ("o" on file, "m" missing, "r" review).
  config.addFilter('months', (pattern) => [...pattern].map((c) => ({ o: '', m: 'm', r: 'r' })[c] ?? ''));
  return { dir: { input: 'src', includes: '_includes', data: '_data', output: '_site' }, templateFormats: ['njk', 'md'], htmlTemplateEngine: 'njk', markdownTemplateEngine: 'njk' };
}
