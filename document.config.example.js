/**
 * document.config.example.js — Configuration for professional documents
 *
 * Use this template for presupuestos, SRS, proposals, and other formal docs.
 * Uses the presupuesto-norpan theme with image cover + Poppins titles.
 *
 * Run with: npx replicant-pdf --config ./document.config.js
 */

export default {
  // ─── Input / Output ───────────────────────────────────────────
  /** Path to the Markdown source file (relative to this config file) */
  input: './SRS.md',

  /** Path for the generated PDF (relative to this config file) */
  output: './SRS-MI-PROYECTO.pdf',

  /** Directory containing images referenced in Markdown (optional) */
  imagesDir: './SS',

  // ─── Cover ────────────────────────────────────────────────────
  cover: {
    /**
     * Background image for the cover page (full-bleed).
     * This replaces the card-based cover with an image + overlay layout.
     * The image covers the top ~60% of the page, with a white overlay
     * at the bottom containing titles and metadata.
     */
    backgroundImage: './SS/cover-norpan.jpg',

    /**
     * Title: displayed on the LEFT side in Poppins 28px Bold.
     * Use \n for line breaks.
     */
    title: 'Presupuesto –\nAplicación para la\nGestión de Pagos',

    /**
     * Subtitle: displayed on the RIGHT side in Poppins Light 18px.
     * Use \n for line breaks.
     */
    subtitle: 'APP PAGOS\nPENDIENTES',

    /** Version tag shown in cover metadata */
    version: '1.0 · Febrero 2026',

    /** Classification label */
    classification: 'Uso interno',

    /** Small text below metadata */
    footer: 'NOR-PAN S.R.L.',

    /** Additional meta rows (key → value) */
    meta: {
      'Autor': 'Camilo Acencio',
      'Empresa': 'NOR-PAN S.R.L.',
    },
  },

  // ─── Header / Footer ─────────────────────────────────────────
  /** Text shown in top-right of every page (small, gray) */
  header: 'NOR-PAN S.R.L. · Presupuesto',

  // ─── Theme ────────────────────────────────────────────────────
  /**
   * Theme for document styling.
   * - 'shadcn-dark': Dark cover + clean body (for tutorials)
   * - 'presupuesto-norpan': Image cover + Cambria/Calibri body (for docs)
   * - Or path to custom .mjs / .css file
   */
  theme: 'presupuesto-norpan',

  // ─── TOC ──────────────────────────────────────────────────────
  /** Title for the table of contents page */
  tocTitle: 'Índice de Contenidos',

  // ─── Page format ──────────────────────────────────────────────
  /** Paper size: 'A4', 'Letter', etc. */
  format: 'Letter',

  /** Page margins in mm (1 inch = 25.4mm) */
  margins: {
    top: 25.4,
    right: 25.4,
    bottom: 25.4,
    left: 25.4,
  },

  /** HTML lang attribute */
  lang: 'es',
};
