# REPLICANT 2049

> Sistema de documentación inteligente para proyectos INCBA. Analiza código fuente, genera documentos con GitHub Models (SRS, PLAN, README, etc.) y exporta a PDF, DOCX y MP4.

---

## ✅ Funcionalidades Implementadas

### 📁 Comandos CLI

| Comando | Descripción | Estado |
|---------|-------------|--------|
| `replicant init` | Scaffolding de documentación para nuevos proyectos | ✅ Completo |
| `replicant sync` | Verificación de estado y progreso de documentación | ✅ Completo |
| `replicant generate` | Generación automática de documentos con GitHub Models | ✅ Completo |
| `replicant export` | Exportar Markdown a PDF, DOCX, HTML, MP4 | ✅ Completo |
| `replicant audit` | Auditoría de estándares del proyecto (21 checks) | ✅ Completo |

### 🤖 Generación con IA (GitHub Models)
- ✅ Análisis automático de backend y frontend (controllers, models, componentes)
- ✅ Generación de documentos finales basados en código real
- ✅ Soporte batch: múltiples proyectos en una ejecución
- ✅ $0 costo adicional (incluido en suscripción GitHub Copilot)
- ✅ Modelo configurable vía `--model` (OpenAI GPT-4.1-mini default)

### 📄 Exportación PDF (`--pdf`)
- ✅ Markdown → PDF con Playwright headless Chromium
- ✅ Portada profesional (2 modos: shadcn-dark card, imagen background)
- ✅ Imágenes embebidas como base64
- ✅ Índice auto-generado desde H2/H3
- ✅ Temas intercambiables (`shadcn-dark`, `presupuesto-norpan`)
- ✅ Headers/footers con número de página
- ✅ Formato A4 / Letter configurable

### 🌐 Exportación HTML (`--html`)
- ✅ Markdown → HTML fragment para embedding in-app
- ✅ Imágenes como rutas relativas (no base64, con lazy loading)
- ✅ Generación de TOC JSON (scroll-spy ready)
- ✅ Metadata JSON (título, versión, fecha, contadores)
- ✅ Copia automática de imágenes al directorio destino

### 📝 Exportación DOCX (`--docx`)
- ✅ Markdown → DOCX con headings, párrafos, tablas, listas, código
- ✅ Table of Contents auto-generada
- ✅ Estilos de texto (bold, italic, code inline)

### 🎥 Exportación Video (`--video`)
- ✅ Markdown → slides HTML renderizados con Playwright
- ✅ Slides estáticos convertidos a clips MP4 vía FFmpeg
- ✅ Concatenación de clips en video final
- ✅ Cursor visual overlay para grabaciones

### 📸 Pipeline de Capturas
- ✅ Integración con script de capturas (Playwright)
- ✅ Validación de app corriendo antes de capturar
- ✅ Flag `--skip-capture` para usar imágenes existentes
- ✅ Configuración via `capture.script` en tutorial.config.js

### 📋 Auditoría de Estándares (`audit`)
- ✅ 21 estándares obligatorios en 4 categorías (DOC, UX, FEAT, QA)
- ✅ Auto-detección de estructura proyecto (backend/frontend/more)
- ✅ Reporte con colores y progress bar (✅/⚠️/❌)
- ✅ Modo `--json` para uso programático
- ✅ Modo `--verbose` para detalles de estándares que pasan
- ✅ Exit code 1 en failures (compatible CI)

### 📁 Skills Templates
- ✅ SRS (IEEE 830), PLAN, CLAUDE, README, LOVABLE-PROMPT, ERASER-DSL
- ✅ TUTORIAL_GUIDE con guía de estructura
- ✅ STANDARDS.md con 21 estándares verificables

---

## 🚧 Funcionalidades Pendientes

| Prioridad | Feature | Detalle |
|-----------|---------|---------|
| **P1** | DOCX — Imágenes embebidas | Las imágenes del Markdown se ignoran silenciosamente en el DOCX. Falta implementar `ImageRun` del paquete `docx`. |
| **P2** | DOCX — Portada generada | La portada es una página en blanco (`new Paragraph({ children: [] })`). No renderiza título, logo, subtítulo ni clasificación del config. |
| **P3** | Video — Transiciones | Los clips se concatenan con hard-cut (`-c copy`). Faltan filtros FFmpeg `xfade` para crossfade y fade-black. |
| **P4** | Video — Música de fondo | `config.video.backgroundMusic` se resuelve en el CLI pero nunca se usa en export-video.mjs. Falta `-i` + filtro de audio overlay. |
| **P5** | Video — Animaciones de slides | Los slides se capturan como screenshots estáticos. Falta renderizado por fases (text reveal, opacity transitions). |
| **P6** | sync `--update-progress` | El flag se parsea pero no tiene lógica. Debería reescribir las tablas de progreso en CLAUDE.md automáticamente. |
| **P7** | Modelos Anthropic directo | Solo funciona vía GitHub Models API proxy. No hay soporte para `ANTHROPIC_API_KEY` directo. El default real es `openai/gpt-4.1-mini`, no Sonnet 4 como dice la ayuda. |
| **P8** | Eliminar dep `fluent-ffmpeg` | Está en `dependencies` pero nunca se importa. export-video.mjs usa `child_process.spawn` + `ffmpeg-static` directamente. |

## 📦 Instalación

```bash
# Global
npm install -g replicant-2049

# O como dev dependency
npm install -D replicant-2049

# Instalar navegadores de Playwright (primera vez)
npx playwright install chromium
```

## 🚀 Uso Rápido

### Inicializar nuevo proyecto

```bash
# Interactivo
npx replicant init

# Con parámetros
npx replicant init --project TC --client NOR-PAN
```

Esto crea:
```
TC-more/
├── CLAUDE.md           ← Hub central de contexto
├── SRS.md              ← Especificación de requisitos
├── PLAN.md             ← Plan de trabajo
├── LOVABLE-PROMPT.md   ← Prompts para mockups
├── ERASER-DSL.md       ← DSL para diagramas
├── TUTORIAL.md         ← Tutorial de usuario
├── SS/                 ← Screenshots
└── diagrams/           ← Diagramas exportados

project.config.js       ← Configuración del proyecto
```

### Verificar documentación

```bash
# Verificar estado
npx replicant sync

# Solo check (sin modificar)
npx replicant sync --check
```

### Generar documentos con IA (GitHub Models)

Requiere `GITHUB_TOKEN` (Personal Access Token):

```bash
# Crear token en: https://github.com/settings/tokens
# Windows PowerShell:
$env:GITHUB_TOKEN = "ghp_..."
# Linux/Mac:
export GITHUB_TOKEN="ghp_..."
```

```bash
# Un proyecto específico
npx replicant generate --project APP-PAGOS-PENDIENTES

# Todos los proyectos de una carpeta
npx replicant generate --all --dir "C:\Proyectos\NOR-PAN"

# Solo ciertos documentos
npx replicant generate --project TC --docs SRS,PLAN

# Dry-run (analiza sin llamar a la API)
npx replicant generate --project TC --dry-run

# Usar Opus 4 (máxima calidad)
npx replicant generate --project TC --model claude-opus-4-20250514

# Usar GPT-4o
npx replicant generate --project TC --model gpt-4o

# Sobreescribir documentos existentes
npx replicant generate --project TC --force
```

Output al finalizar:
```
═══════════════════════════════════════════════════════════
 REPLICANT 2049 — Generación Completada
═══════════════════════════════════════════════════════════

 Proyectos procesados: 2
 ├── APP-PAGOS-PENDIENTES      ✓ 6 documentos
 └── TC                        ✓ 6 documentos

 Documentos generados: 12 total

═══════════════════════════════════════════════════════════
 CONSUMO
═══════════════════════════════════════════════════════════
 Input tokens:    104,280
 Output tokens:    21,460
 Modelo:          Claude Sonnet 4
 Tiempo:          85.3s
 Costo:           $0.00 (incluido en suscripción GitHub Copilot)
═══════════════════════════════════════════════════════════
```

#### Modelos disponibles

| Modelo | Proveedor | Uso recomendado |
|--------|-----------|-----------------|
| `claude-sonnet-4-20250514` | Anthropic | **Default** — Mejor calidad/velocidad |
| `claude-opus-4-20250514` | Anthropic | Máxima calidad |
| `claude-3-5-sonnet-20241022` | Anthropic | Alternativa estable |
| `gpt-4o` | OpenAI | Alternativa GPT |

### Exportar documentos

```bash
# PDF (default)
npx replicant export --config ./tutorial.config.js

# DOCX
npx replicant export --config ./tutorial.config.js --docx

# Video MP4
npx replicant export --config ./tutorial.config.js --video

# Todos los formatos
npx replicant export --pdf --docx --video
```

## 📁 Estructura de Proyecto INCBA

```
C:/Proyectos/
└── CLIENTE/                    # Carpeta del cliente
    └── PROYECTO/               # Nombre del proyecto
        ├── PROYECTO-backend/   # Backend (NestJS/Express)
        ├── PROYECTO-frontend/  # Frontend (React + Vite)
        ├── PROYECTO-more/      # Documentación ← Replicant
        │   ├── CLAUDE.md
        │   ├── SRS.md
        │   ├── PLAN.md
        │   ├── TUTORIAL.md
        │   └── SS/
        └── project.config.js   # Config de Replicant
```

## 📋 Skills Templates

Los templates en `Skills/` guían la generación de documentos:

| Template | Propósito |
|----------|-----------|
| `SRS_TEMPLATE.md` | Especificación de requisitos (IEEE 830) |
| `PLAN_TEMPLATE.md` | Plan de trabajo con sprints |
| `CLAUDE_TEMPLATE.md` | Hub central de contexto y logs |
| `LOVABLE_PROMPT_TEMPLATE.md` | Prompts para mockups en lovable.dev |
| `ERASER_DSL_TEMPLATE.md` | DSL para diagramas en eraser.io |
| `README_TEMPLATE.md` | README técnico para repos |

## ⚙️ Project Config

El archivo `project.config.js` centraliza la configuración del proyecto:

```javascript
export default {
  project: {
    code: 'TC',
    name: 'Sistema de Cambio de Divisas',
  },
  client: {
    name: 'NOR-PAN S.R.L.',
    folder: 'NOR-PAN',
  },
  team: {
    pm: 'Felipe Rebolledo',
    developer: 'Camilo Acencio',
  },
  progress: {
    requirements: [
      { code: 'RF-001', name: 'Autenticación', progress: 100 },
      { code: 'RF-002', name: 'CRUD Clientes', progress: 80 },
    ],
  },
};
```

Ver `project.config.example.js` para todas las opciones disponibles.

## 📄 Export Config (tutorial.config.js)

Para exportar documentos a PDF/DOCX/Video:

```javascript
export default {
  input: './TUTORIAL.md',
  output: './TUTORIAL.pdf',
  imagesDir: './SS',
  
  cover: {
    logo: './SS/logo.png',
    title: 'Tutorial de Uso',
    subtitle: 'Guía completa',
    version: '1.0',
    footer: 'Mi Empresa',
  },
  
  header: 'Mi Empresa · Mi Sistema',
  theme: 'shadcn-dark',
  
  video: {
    output: './TUTORIAL.mp4',
    fps: 30,
    slideDuration: 6,
    transition: 'crossfade',
  },
};
```

### Opciones principales

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `input` | `string` | Ruta al Markdown |
| `output` | `string` | Ruta del archivo generado |
| `imagesDir` | `string` | Carpeta de screenshots |
| `theme` | `string` | `shadcn-dark` o `presupuesto-norpan` |
| `format` | `string` | `A4` o `Letter` |

## 🎨 Temas

### Built-in: `shadcn-dark`

- Portada: fondo zinc-950, card con bordes zinc-800
- Cuerpo: fondo blanco, tipografía slate
- Código: fondo dark con fuente monospace
- Tablas: headers oscuros, filas alternadas

### Built-in: `presupuesto-norpan`

- Portada: imagen de fondo full-bleed + overlay blanco con títulos Poppins
- Cuerpo: Cambria 11pt (serif) para texto, Calibri Bold para headings
- Formato: US Letter con márgenes de 1 pulgada
- Ideal para: presupuestos, SRS, propuestas, documentos formales

### Tema personalizado

```javascript
// mi-tema.mjs
const CSS = `
  body { font-family: Georgia, serif; }
  .cover { background: #1a1a2e; }
`;
export default CSS;
```

## 📖 Uso como Módulo

```javascript
import { exportTutorialToPDF } from 'replicant-2049';
import { exportTutorialToVideo } from 'replicant-2049/video';
import { exportToDocx } from 'replicant-2049/docx';

await exportTutorialToPDF(config);
await exportTutorialToVideo(config);
await exportToDocx(config);
```

## 🔄 Progress Tracking

El comando `sync` lee `CLAUDE.md` y detecta el progreso de los RFs:

```bash
npx replicant sync
```

Output:
```
📊 Documentation Status Report

Documents:
  ✅ CLAUDE.md            Complete
  ✅ SRS.md               Complete
  ⚠️ PLAN.md              Template
  ⬜ TUTORIAL.md          Not created

RF Progress:
  RF-001 Autenticación      ██████████ 100%
  RF-002 CRUD Clientes      ████████░░  80%
  RF-003 Dashboard          ░░░░░░░░░░   0%

  Overall: ████████░░ 60%
```

Cuando todos los RFs llegan al 100%, se muestra:
```
🎉 ALL RFs COMPLETE! Ready for release.
```

## 📘 Documentation Guide

Ver [Skills/TUTORIAL_GUIDE.md](Skills/TUTORIAL_GUIDE.md) para la guía completa de cómo estructurar tutoriales.

## 📄 Licencia

MIT © [CamiloIncba](https://github.com/CamiloIncba)