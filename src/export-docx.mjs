/**
 * ============================================================
 *  export-docx.mjs — Markdown → DOCX engine
 *  Replicant-2049
 * ============================================================
 *
 *  Generates a .docx with:
 *    - Blank first page (for cover to be added manually in Word/PPTX)
 *    - Auto-generated Table of Contents
 *    - Styled headings, body text, tables, lists, code blocks
 *
 *  Uses the `docx` npm package (v9+).
 * ============================================================
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, PageBreak, ShadingType,
  TableOfContents,
  convertMillimetersToTwip, convertInchesToTwip,
  Header, Footer, PageNumber,
} from 'docx';
import { readFileSync, existsSync, writeFileSync, statSync } from 'fs';
import { dirname } from 'path';
import { marked } from 'marked';

// ─── Theme constants ───────────────────────────────────────────
const C = {
  h1: '0E2841', h2: '1f4e78', h3: '4472c4', h4: '333333',
  body: '000000', link: '467886',
  thBg: 'd4e8ef', border: 'cbcccb',
  code: 'c7254e', codeBg: 'f4f4f4',
};
const F = { h: 'Calibri', b: 'Cambria', c: 'Consolas' };

// ─── Helpers ───────────────────────────────────────────────────
function strip(t) {
  return (t || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '');
}

/** Parse inline markdown to TextRun[] */
function inlineRuns(text, font = F.b, sz = 11, color = C.body) {
  const runs = [];
  if (!text) return [new TextRun({ text: ' ', font, size: sz * 2, color })];

  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[([^\]]+)\]\(([^)]+)\))|([^*`\[]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[2]) {
      runs.push(new TextRun({ text: m[2], bold: true, font, size: sz * 2, color }));
    } else if (m[4]) {
      runs.push(new TextRun({ text: m[4], italics: true, font, size: sz * 2, color }));
    } else if (m[6]) {
      runs.push(new TextRun({ text: m[6], font: F.c, size: 10 * 2, color: C.code }));
    } else if (m[8]) {
      runs.push(new TextRun({ text: m[8], font, size: sz * 2, color: C.link }));
    } else if (m[10]) {
      runs.push(new TextRun({ text: m[10], font, size: sz * 2, color }));
    }
  }
  if (!runs.length) {
    runs.push(new TextRun({ text, font, size: sz * 2, color }));
  }
  return runs;
}

// ─── Convert MD tokens → Paragraph[] ──────────────────────────
function convertTokens(tokens) {
  const els = [];
  let skipFirstH1 = true;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === 'heading') {
      if (t.depth === 1 && skipFirstH1) { skipFirstH1 = false; continue; }
      // Skip inline TOC heading + following list
      if (t.depth === 2 && /[ÍI]ndice/i.test(t.text)) {
        while (i + 1 < tokens.length && tokens[i + 1].type === 'list') i++;
        continue;
      }

      const plain = strip(t.text);
      const cfg = {
        1: { hl: HeadingLevel.HEADING_1, sz: 22, c: C.h1 },
        2: { hl: HeadingLevel.HEADING_2, sz: 13, c: C.h2 },
        3: { hl: HeadingLevel.HEADING_3, sz: 11, c: C.h3 },
        4: { hl: HeadingLevel.HEADING_4, sz: 11, c: C.h4 },
      }[t.depth] || { hl: HeadingLevel.HEADING_4, sz: 11, c: C.h4 };

      els.push(new Paragraph({
        heading: cfg.hl,
        spacing: { before: 200, after: 80 },
        keepNext: true,
        keepLines: true,
        children: [new TextRun({ text: plain, bold: true, font: F.h, size: cfg.sz * 2, color: cfg.c })],
      }));
    }

    else if (t.type === 'paragraph') {
      els.push(new Paragraph({
        spacing: { before: 50, after: 50 },
        widowControl: true,
        children: inlineRuns(t.text),
      }));
    }

    else if (t.type === 'blockquote' && t.tokens) {
      for (const sub of t.tokens) {
        if (sub.type === 'paragraph') {
          els.push(new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: convertMillimetersToTwip(8) },
            widowControl: true,
            children: inlineRuns(sub.text, F.b, 11, C.h2),
          }));
        }
      }
    }

    else if (t.type === 'list') {
      for (const item of (t.items || [])) {
        const lines = (item.text || '').split('\n').filter(l => l.trim());
        for (const line of lines) {
          els.push(new Paragraph({
            spacing: { before: 20, after: 20 },
            bullet: { level: 0 },
            widowControl: true,
            children: inlineRuns(line),
          }));
        }
      }
    }

    else if (t.type === 'table') {
      const hdr = t.header || [];
      const rows = t.rows || [];
      const tblBorder = { style: BorderStyle.SINGLE, size: 1, color: C.border };
      const borders = {
        top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder,
        insideHorizontal: tblBorder, insideVertical: tblBorder,
      };

      const tableRows = [];
      if (hdr.length) {
        tableRows.push(new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: hdr.map(cell => new TableCell({
            shading: { type: ShadingType.CLEAR, fill: C.thBg },
            children: [new Paragraph({
              children: [new TextRun({
                text: strip(cell.text || String(cell)),
                bold: true, font: F.b, size: 11 * 2, color: C.body,
              })],
            })],
          })),
        }));
      }
      for (const row of rows) {
        tableRows.push(new TableRow({
          cantSplit: true,
          children: row.map(cell => new TableCell({
            children: [new Paragraph({
              children: inlineRuns(cell.text || String(cell)),
            })],
          })),
        }));
      }
      if (tableRows.length) {
        els.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
          borders,
        }));
      }
    }

    else if (t.type === 'code') {
      const codeLines = (t.text || '').split('\n');
      for (let ci = 0; ci < codeLines.length; ci++) {
        els.push(new Paragraph({
          spacing: { before: 0, after: 0 },
          keepLines: true,
          keepNext: ci < codeLines.length - 1,  // bind to next line except last
          children: [new TextRun({
            text: codeLines[ci] || ' ',
            font: F.c, size: 19, color: '333333',
          })],
        }));
      }
    }

    else if (t.type === 'hr') {
      els.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: C.border } },
        children: [],
      }));
    }

    else if (t.type === 'space' || t.type === 'html') {
      // skip
    }

    else if (t.text) {
      els.push(new Paragraph({ children: inlineRuns(t.text) }));
    }
  }

  return els;
}

// ─── Build Document ────────────────────────────────────────────
function buildDocx(config, mdContent) {
  const tokens = marked.lexer(mdContent);
  const content = convertTokens(tokens);

  const m = config.margins || { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 };
  const pageProps = {
    page: {
      size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) },
      margin: {
        top: convertMillimetersToTwip(m.top),
        right: convertMillimetersToTwip(m.right || m.left),
        bottom: convertMillimetersToTwip(m.bottom),
        left: convertMillimetersToTwip(m.left),
      },
    },
  };

  return new Document({
    features: { updateFields: true },
    sections: [
      // ── Section 1: Blank cover page ──
      {
        properties: pageProps,
        children: [new Paragraph({ children: [] })],
      },
      // ── Section 2: TOC + content ──
      {
        properties: pageProps,
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: config.header || '',
                font: F.h, size: 16, color: 'cbd5e1',
              })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ children: [PageNumber.CURRENT], font: F.h, size: 18, color: '94a3b8' }),
                new TextRun({ text: ' / ', font: F.h, size: 18, color: '94a3b8' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F.h, size: 18, color: '94a3b8' }),
              ],
            })],
          }),
        },
        children: [
          // TOC title
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({
              text: config.tocTitle || 'Índice de Contenidos',
              bold: true, font: F.h, size: 36, color: C.h1,
            })],
          }),
          // TOC field
          new TableOfContents('Índice', {
            hyperlink: true,
            headingStyleRange: '1-3',
          }),
          // Page break
          new Paragraph({ children: [new PageBreak()] }),
          // Content
          ...content,
        ],
      },
    ],
  });
}

// ─── Export ─────────────────────────────────────────────────────
export async function exportToDocx(config) {
  console.log('\n========================================');
  console.log('  Exportando Documento a DOCX');
  console.log('========================================');

  if (!existsSync(config.input)) {
    console.error('  ❌ Markdown not found: ' + config.input);
    return null;
  }

  console.log('  Origen:  ' + config.input);
  console.log('  Destino: ' + config.output);

  const mdContent = readFileSync(config.input, 'utf8');
  console.log('  Markdown: ' + mdContent.split('\n').length + ' líneas');

  console.log('  Generando DOCX...');
  const doc = buildDocx(config, mdContent);
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(config.output, buffer);

  const stats = statSync(config.output);
  const sizeKB = (stats.size / 1024).toFixed(0);
  console.log('  ✅ DOCX generado: ' + sizeKB + ' KB');
  console.log('  📄 ' + config.output);
  console.log('========================================\n');

  return config.output;
}
