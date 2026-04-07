# Skill: Generación de AWS-SUPERVISOR.md

> **Propósito:** Guía para que Claude/Copilot genere el documento de reglas AWS específico del proyecto, adaptando las reglas genéricas al contexto real de infraestructura.

---

## Instrucciones para el Agente

Cuando se genere un AWS-SUPERVISOR.md para un proyecto:

1. **Copiar las 12 reglas** tal cual desde `Skills/arch/AWS-SUPERVISOR.md`
2. **No modificar las reglas** — son universales e innegociables
3. **Agregar contexto del proyecto** al final, referenciando su `infrastructure.mdc`
4. **Verificar** que no haya placeholders sin reemplazar

---

## Plantilla

```markdown
---
description: Reglas de seguridad para operaciones en AWS — aplica a {{PROYECTO}}
globs: "*/"
alwaysApply: true
---

# ⛔ Reglas de seguridad AWS — {{PROYECTO}}

> Estas reglas son OBLIGATORIAS para cualquier agente que trabaje en este proyecto.
> La cuenta AWS es compartida entre múltiples aplicaciones en producción.
> Un error en un recurso puede afectar a TODAS las apps.

## Reglas (12 innegociables)

Las 12 reglas de seguridad están definidas en el estándar INCBA:
Ver `Skills/arch/AWS-SUPERVISOR.md` para el detalle completo.

**Resumen:**

1. NUNCA crear recursos sin autorización EXPLÍCITA del usuario
2. NUNCA tocar Route 53
3. NUNCA modificar distribuciones CloudFront sin autorización
4. Listar antes de actuar
5. Región por defecto: us-east-1 (AZ: us-east-1b)
6. NUNCA modificar configuración de hosting/deploy sin autorización
7. NUNCA modificar ni eliminar secrets sin autorización
8. NUNCA modificar IAM, security groups ni networking
9. Proteger el entorno de producción
10. NUNCA eliminar recursos sin autorización y verificación de dependencias
11. Documentar toda operación que modifique infraestructura
12. Scope: solo trabajar en los recursos de ESTE proyecto

---

## Contexto de este Proyecto

- **Proyecto:** {{PROYECTO}}
- **Cliente:** {{CLIENTE}}
- **Infraestructura detallada:** Ver `infrastructure.mdc` en la raíz del repo

---

*Generado por Replicant-2049 — {{FECHA}}*
```

---

## Variables a Reemplazar

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{PROYECTO}}` | Nombre corto del proyecto | NOR-PAN Tienda Virtual |
| `{{CLIENTE}}` | Nombre del cliente | NOR-PAN S.R.L. |
| `{{FECHA}}` | Fecha de generación | 2026-04-07 |

---

## Relación con infrastructure.mdc

Este template genera las **reglas** (qué NO hacer). El archivo `infrastructure.mdc` contiene la **configuración** (qué recursos existen). Son complementarios:

- `AWS-SUPERVISOR.md` → Reglas universales + contexto del proyecto
- `infrastructure.mdc` → Inventario de recursos, IDs, regiones, servicios

El agente necesita AMBOS documentos para operar correctamente en AWS.

---

## Checklist de Calidad

Antes de marcar como completo:

- [ ] Las 12 reglas están referenciadas (no modificadas)
- [ ] Contexto del proyecto es correcto
- [ ] Se referencia `infrastructure.mdc` del repo
- [ ] No hay placeholders `{{...}}` sin reemplazar

---

*Skill para Replicant-2049 — INCBA*
