// Tiny phosphor "›" chevron on dark paper — matches the Terminal theme used
// in src/views/Layout.tsx. Served at /favicon.ico (and used as a data URI in
// the page <head>) so neither the browser nor a direct probe ever 404s.
export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="oklch(16% 0.012 240)"/><path d="M12 10 L20 16 L12 22" stroke="oklch(82% 0.18 145)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

export const FAVICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(
  FAVICON_SVG,
)}`;
