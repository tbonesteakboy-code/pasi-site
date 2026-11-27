// Shared links. APPLY_URL overrides where the founding-firm form posts (QA points a local build at a local DossierIQ).
export default {
  "url": "https://pasi.llc",
  "appUrl": "https://dossieriq.pasi.llc",
  "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLScQgvU_FI8chjS2B5O1jQoMPn9GwePsCGUZbIiqTRKdFlA0vA/viewform",
  "email": "info@pasi.llc",
  "privacyUrl": "https://secure.pasi.llc/privacy",
  "year": 2026,
  "applyUrl": process.env.APPLY_URL || "https://dossieriq.pasi.llc/api/public/founding-firm"
};
