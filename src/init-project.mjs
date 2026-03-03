#!/usr/bin/env node
/**
 * ============================================================
 *  init-project.mjs — Replicant-2049
 *  Scaffold a new project with documentation structure
 * ============================================================
 *
 *  Usage:
 *    npx replicant init [--project NAME] [--client FOLDER]
 *
 *  Creates:
 *    - {PROJECT}-more/ folder with documentation templates
 *    - project.config.js with pre-filled values
 *    - CLAUDE.md as the hub
 * ============================================================
 */

import { resolve, dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILLS_DIR = resolve(__dirname, '..', 'Skills');

// ─── ANSI Colors ───────────────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// ─── Parse CLI args ────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let projectName = null;
  let projectFullName = null;
  let clientFolder = null;
  let clientFullName = null;
  let description = null;
  let pmName = null;
  let devName = null;
  let targetDir = process.cwd();
  let nonInteractive = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) {
      projectName = args[i + 1];
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      projectFullName = args[i + 1];
      i++;
    } else if (args[i] === '--client' && args[i + 1]) {
      clientFolder = args[i + 1];
      i++;
    } else if (args[i] === '--client-name' && args[i + 1]) {
      clientFullName = args[i + 1];
      i++;
    } else if (args[i] === '--description' && args[i + 1]) {
      description = args[i + 1];
      i++;
    } else if (args[i] === '--pm' && args[i + 1]) {
      pmName = args[i + 1];
      i++;
    } else if (args[i] === '--dev' && args[i + 1]) {
      devName = args[i + 1];
      i++;
    } else if (args[i] === '--target' && args[i + 1]) {
      targetDir = resolve(args[i + 1]);
      i++;
    } else if (args[i] === '-y' || args[i] === '--yes') {
      nonInteractive = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return { 
    projectName, projectFullName, clientFolder, clientFullName, 
    description, pmName, devName, targetDir, nonInteractive 
  };
}

function printHelp() {
  console.log(`
${colors.bright}Replicant-2049 — Project Initializer${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx replicant init [options]

${colors.cyan}Options:${colors.reset}
  --project NAME      Project code (e.g., TC, APP-PAGOS)
  --name FULLNAME     Project full name
  --client FOLDER     Client folder name (e.g., NOR-PAN, INCBA)
  --client-name NAME  Client full name
  --description DESC  Short description
  --pm NAME           Project Manager name
  --dev NAME          Developer name
  --target DIR        Target directory (default: current dir)
  -y, --yes           Non-interactive mode (use defaults)
  --help, -h          Show this help

${colors.cyan}Examples:${colors.reset}
  npx replicant init --project TC --client NOR-PAN
  npx replicant init --project TC --client NOR-PAN -y
  npx replicant init  # Interactive mode
`);
}

// ─── Interactive prompts ───────────────────────────────────────
async function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const defaultHint = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${colors.cyan}?${colors.reset} ${question}${defaultHint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function gatherProjectInfo(args) {
  log.title('🚀 Replicant-2049 — Project Initializer');

  // Use CLI args or defaults if non-interactive mode
  const useDefaults = args.nonInteractive;
  
  const projectCode = args.projectName || (useDefaults ? 'PROYECTO' : await prompt('Project code', 'PROYECTO'));
  const projectFullName = args.projectFullName || (useDefaults ? `Sistema de ${projectCode}` : await prompt('Project full name', `Sistema de ${projectCode}`));
  const clientFolder = args.clientFolder || (useDefaults ? 'CLIENTE' : await prompt('Client folder', 'CLIENTE'));
  const clientFullName = args.clientFullName || (useDefaults ? `${clientFolder} S.R.L.` : await prompt('Client full name', `${clientFolder} S.R.L.`));
  const description = args.description || (useDefaults ? 'Sistema de gestión' : await prompt('Short description', 'Sistema de gestión'));
  const pmName = args.pmName || (useDefaults ? 'Felipe Rebolledo' : await prompt('Project Manager', 'Felipe Rebolledo'));
  const devName = args.devName || (useDefaults ? 'Camilo Acencio' : await prompt('Developer', 'Camilo Acencio'));

  return {
    project: {
      code: projectCode.toUpperCase(),
      name: projectFullName,
      description,
    },
    client: {
      folder: clientFolder.toUpperCase(),
      name: clientFullName,
    },
    team: {
      pm: pmName,
      developer: devName,
    },
  };
}

// ─── File creation ─────────────────────────────────────────────
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log.success(`Created directory: ${dirPath}`);
  }
}

function replaceVariables(content, info) {
  const replacements = {
    '{{PROYECTO}}': info.project.code,
    '{{NOMBRE_COMPLETO}}': info.project.name,
    '{{DESCRIPCION_CORTA}}': info.project.description,
    '{{CLIENTE}}': info.client.name,
    '{{PM}}': info.team.pm,
    '{{DEV}}': info.team.developer,
    '{{AUTOR}}': 'INCBA',
    '{{FECHA}}': new Date().toISOString().split('T')[0],
    '{{YEAR}}': new Date().getFullYear().toString(),
    '{{VERSION}}': '1.0.0',
  };

  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  return result;
}

function createDocFromTemplate(templateName, outputPath, info) {
  const templatePath = join(SKILLS_DIR, `${templateName}_TEMPLATE.md`);
  
  if (!existsSync(templatePath)) {
    log.warn(`Template not found: ${templatePath}`);
    return false;
  }

  // Read the template and normalize line endings
  let templateContent = readFileSync(templatePath, 'utf8');
  templateContent = templateContent.replace(/\r\n/g, '\n');
  
  // Find the start of the template block (```markdown after ## Plantilla)
  const startMarker = '## Plantilla';
  const startIndex = templateContent.indexOf(startMarker);
  
  if (startIndex === -1) {
    log.warn(`Could not find "## Plantilla" in: ${templateName}`);
    return false;
  }
  
  // Find ```markdown after the plantilla header
  const mdBlockStart = templateContent.indexOf('```markdown\n', startIndex);
  if (mdBlockStart === -1) {
    log.warn(`Could not find markdown block in: ${templateName}`);
    return false;
  }
  
  const contentStart = mdBlockStart + '```markdown\n'.length;
  
  // Find the end of the template block - look for ``` at start of line 
  // followed by section markers (---\n\n## or just ---\n\n*)
  const afterContent = templateContent.slice(contentStart);
  const endMatch = afterContent.match(/\n```\n\n---/);
  
  if (!endMatch) {
    log.warn(`Could not find end of template in: ${templateName}`);
    return false;
  }
  
  const templateMarkdown = afterContent.slice(0, endMatch.index);
  
  if (templateMarkdown) {
    const docContent = replaceVariables(templateMarkdown, info);
    writeFileSync(outputPath, docContent, 'utf8');
    log.success(`Created: ${outputPath}`);
    return true;
  } else {
    log.warn(`Could not extract template from: ${templateName}`);
    return false;
  }
}

function createProjectConfig(targetDir, info) {
  const examplePath = resolve(__dirname, '..', 'project.config.example.js');
  const outputPath = join(targetDir, 'project.config.js');

  if (existsSync(examplePath)) {
    let content = readFileSync(examplePath, 'utf8');
    content = content
      .replace(/code: 'PROYECTO'/g, `code: '${info.project.code}'`)
      .replace(/name: 'Sistema de Gestión de Ejemplo'/g, `name: '${info.project.name}'`)
      .replace(/description: 'Sistema web para gestionar X procesos del cliente Y'/g, `description: '${info.project.description}'`)
      .replace(/name: 'Cliente S.R.L.'/g, `name: '${info.client.name}'`)
      .replace(/folder: 'CLIENTE'/g, `folder: '${info.client.folder}'`)
      .replace(/pm: 'Felipe Rebolledo'/g, `pm: '${info.team.pm}'`)
      .replace(/developer: 'Camilo Acencio'/g, `developer: '${info.team.developer}'`);
    
    writeFileSync(outputPath, content, 'utf8');
    log.success(`Created: ${outputPath}`);
  } else {
    log.warn('project.config.example.js not found');
  }
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  
  // Gather project info (interactive if not provided)
  const info = await gatherProjectInfo(args);
  
  const targetDir = args.targetDir;
  const projectCode = info.project.code;
  const moreDir = join(targetDir, `${projectCode}-more`);
  const ssDir = join(moreDir, 'SS');
  const diagramsDir = join(moreDir, 'diagrams');

  log.title('📁 Creating project structure...');

  // Create directories
  ensureDir(moreDir);
  ensureDir(ssDir);
  ensureDir(diagramsDir);

  // Create documents from templates
  log.title('📝 Generating documentation...');

  createDocFromTemplate('CLAUDE', join(moreDir, 'CLAUDE.md'), info);
  createDocFromTemplate('SRS', join(moreDir, 'SRS.md'), info);
  createDocFromTemplate('PLAN', join(moreDir, 'PLAN.md'), info);
  createDocFromTemplate('LOVABLE_PROMPT', join(moreDir, 'LOVABLE-PROMPT.md'), info);
  createDocFromTemplate('ERASER_DSL', join(moreDir, 'ERASER-DSL.md'), info);

  // Create config file in target directory
  createProjectConfig(targetDir, info);

  // Create empty TUTORIAL.md (to be filled later)
  const tutorialPath = join(moreDir, 'TUTORIAL.md');
  if (!existsSync(tutorialPath)) {
    writeFileSync(tutorialPath, `# ${info.project.name} — Tutorial de Usuario

> Este documento se generará durante el desarrollo del proyecto.

## Contenido

*Pendiente de documentación.*

---

*INCBA — ${new Date().getFullYear()}*
`, 'utf8');
    log.success(`Created: ${tutorialPath}`);
  }

  // Summary
  log.title('✅ Project initialized successfully!');
  console.log(`
${colors.cyan}Created structure:${colors.reset}
  ${projectCode}-more/
  ├── CLAUDE.md        ${colors.green}← Hub central${colors.reset}
  ├── SRS.md           ${colors.yellow}← Completar requisitos${colors.reset}
  ├── PLAN.md          ${colors.yellow}← Completar plan${colors.reset}
  ├── LOVABLE-PROMPT.md
  ├── ERASER-DSL.md
  ├── TUTORIAL.md
  ├── SS/              ${colors.cyan}← Screenshots aquí${colors.reset}
  └── diagrams/        ${colors.cyan}← Diagramas PNG aquí${colors.reset}
  
  project.config.js    ${colors.green}← Configuración del proyecto${colors.reset}

${colors.cyan}Next steps:${colors.reset}
  1. Review and complete ${colors.bright}SRS.md${colors.reset} with your requirements
  2. Review and complete ${colors.bright}PLAN.md${colors.reset} with your timeline
  3. Use ${colors.bright}CLAUDE.md${colors.reset} as context hub during development
  4. Run ${colors.bright}npx replicant sync${colors.reset} to track progress
`);
}

main().catch(console.error);
