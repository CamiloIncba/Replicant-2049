/**
 * presupuesto-norpan — Professional document theme with image cover
 *
 * Replicates the NOR-PAN PPTX template "B&W Minimalist Drama":
 *   - Cover: Background image top ~54%, white area bottom ~46%
 *   - Title (left): Poppins Bold 28pt, #000000
 *   - Subtitle (right): Poppins Light 18pt, #000000
 *   - Body: Cambria 11pt (from Word doc) + Calibri headings
 *   - Tables: Light blue headers (#d4e8ef) with gray borders (#cbcccb)
 *   - Theme colors: dk1=#000000, dk2=#0E2841, accent1=#D0C262, accent6=#263343
 *
 * Supports `cover.backgroundImage` for full-page cover backgrounds.
 */

const CSS = `
/* ── Google Fonts: Poppins (Bold 600 + Light 300) ── */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

/* ── Reset & base ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

@page {
  size: Letter;
}

body {
  font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #000000;
  background: #fff;
}

/* ══════════════════════════════════════════════════════
   COVER — Image top (53.8%) + White bottom (46.2%)
   Mirrors PPTX "Content with Picture 12" layout:
     Picture: x=0, y=0, w=13.33in, h=4.04in  (53.8% of 7.50in)
     Title:   x=0.89in, y=4.70in, w=5.78in, h=1.52in  (Poppins Bold 28pt)
     Subtitle: x=6.67in, y=4.70in, w=6.18in, h=1.52in (Poppins Light 18pt)
   ══════════════════════════════════════════════════════ */
/* Cover fills the entire first page, no margins */
.cover {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  page-break-after: always;
  overflow: hidden;
  background: #ffffff;
  margin: 0;
  padding: 0;
}

/*
 * Background image — panoramic strip across top ~33% of page.
 * Full width, cropped via object-fit to show center band.
 */
.cover-bg {
  display: block;
  width: 100%;
  height: 33%;
  object-fit: cover;
  object-position: center center;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding: 0;
  flex-shrink: 0;
}

/*
 * White area below image — 67% of page.
 * Titles centered vertically within this zone.
 */
.cover-overlay {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 14mm;
}

/* Title row: left + right side by side, vertically centered */
.cover-titles {
  display: flex;
  align-items: flex-start;
  gap: 10%;
  width: 100%;
}

/*
 * Left title: Poppins BOLD 22pt
 * PPTX: placeholder Title 9 at x=0.89", w=5.78" (43.4% of 13.33")
 * font-weight 700 = Bold
 */
.cover-title-left {
  font-family: 'Poppins', 'Calibri', 'Segoe UI', sans-serif;
  font-size: 22pt;
  font-weight: 700;
  color: #000000;
  line-height: 1.25;
  flex: 0 0 40%;
}

/*
 * Right subtitle: Poppins Light 13pt
 * PPTX: placeholder Subtitle 11 at x=6.67", w=6.18" (46.4% of 13.33")
 */
.cover-title-right {
  font-family: 'Poppins', 'Calibri', 'Segoe UI', sans-serif;
  font-size: 13pt;
  font-weight: 300;
  color: #000000;
  line-height: 1.8;
  text-align: left;
  flex: 0 0 46%;
}

/* Hide unused cover elements */
.cover-divider, .cover-meta, .cover-footer,
.cover-card, .cover-logo, .cover-desc { display: none; }

/* ══════════════════════════════════════════════════════
   TABLE OF CONTENTS
   ══════════════════════════════════════════════════════ */
.toc {
  page-break-after: always;
}

.toc h2 {
  font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
  font-size: 18pt;
  font-weight: 700;
  color: #0E2841;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #0E2841;
}

.toc-list {
  list-style: none;
  padding: 0;
}

.toc-list li {
  padding: 5px 0;
  border-bottom: 1px solid #e8e8e8;
  font-size: 11pt;
}

.toc-list li a {
  color: #333;
  text-decoration: none;
}

.toc-list li a:hover {
  color: #467886;
}

.toc-list .toc-h2 {
  font-family: 'Calibri', 'Segoe UI', sans-serif;
  font-weight: 700;
  padding-left: 0;
  font-size: 11.5pt;
  color: #0E2841;
}

.toc-list .toc-h3 {
  font-weight: 400;
  padding-left: 24px;
  color: #555;
  font-size: 10.5pt;
}

/* ══════════════════════════════════════════════════════
   HEADINGS — Calibri Bold (from Word doc analysis)
   H2 = section heading (13pt #1f4e78)
   H3 = subsection (11pt #4472c4)
   ══════════════════════════════════════════════════════ */
h1 {
  font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
  font-size: 22pt;
  font-weight: 700;
  color: #0E2841;
  margin: 24px 0 8px 0;
  letter-spacing: -0.3px;
  page-break-after: avoid;
}

h2 {
  font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
  font-size: 13pt;
  font-weight: 700;
  color: #1f4e78;
  margin: 22px 0 8px 0;
  padding-bottom: 0;
  border-bottom: none;
  page-break-after: avoid;
}

h3 {
  font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
  font-size: 11pt;
  font-weight: 700;
  color: #4472c4;
  margin: 16px 0 6px 0;
  page-break-after: avoid;
}

h4 {
  font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
  font-size: 11pt;
  font-weight: 700;
  color: #333;
  margin: 12px 0 4px 0;
  page-break-after: avoid;
}

/* ── Paragraphs ── */
p { margin: 5px 0; orphans: 3; widows: 3; }

/* ── Lists ── */
ul, ol { margin: 4px 0 4px 20px; }
li { margin: 2px 0; }
li strong { font-family: 'Cambria', 'Georgia', serif; color: #000; }

/* ── Links ── */
a { color: #467886; text-decoration: none; }

/* ── Code ── */
code {
  background: #f4f4f4;
  color: #c7254e;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
}

pre {
  background: #f8f8f8;
  color: #333;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 9.5pt;
  line-height: 1.5;
  page-break-inside: avoid;
}

pre code { background: none; color: inherit; padding: 0; border-radius: 0; font-size: inherit; }

/* ══════════════════════════════════════════════════════
   TABLES — NOR-PAN Word doc style
   Header: #d4e8ef  |  Borders: #cbcccb
   ══════════════════════════════════════════════════════ */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 10.5pt;
  page-break-inside: avoid;
  border: 1px solid #cbcccb;
}

thead th {
  background: #d4e8ef;
  color: #000;
  font-family: 'Cambria', 'Georgia', serif;
  font-weight: 700;
  text-align: left;
  padding: 8px 12px;
  font-size: 11pt;
  border: 1px solid #cbcccb;
}

tbody td {
  padding: 7px 12px;
  border: 1px solid #cbcccb;
}

tbody tr:nth-child(even) {
  background: #f9fbfc;
}

/* ── Images (exclude cover background) ── */
img:not(.cover-bg) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 10px auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* ── Blockquotes ── */
blockquote {
  border-left: 4px solid #4472c4;
  background: #f0f4fa;
  padding: 8px 14px;
  margin: 8px 0;
  border-radius: 0 4px 4px 0;
  color: #1f4e78;
}

blockquote p { margin: 2px 0; }

/* ── Horizontal rule ── */
hr { border: none; height: 1px; background: #cbcccb; margin: 16px 0; }

/* ── Print optimization ── */
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover-bg { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover-overlay { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  pre { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  blockquote { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  tbody tr:nth-child(even) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export default CSS;
