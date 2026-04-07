# Skill: Generación de infrastructure.mdc

> **Propósito:** Template para generar el archivo `infrastructure.mdc` de cada proyecto. Documenta todos los recursos AWS, bases de datos, servicios externos y configuración de infraestructura específica del proyecto.

---

## Instrucciones para el Agente

Cuando se genere un `infrastructure.mdc` para un proyecto:

1. **Analizar la infraestructura existente** del proyecto (Procfile, .platform/, deploy.yml, .env.example, package.json)
2. **Consultar AWS** si hay acceso: listar EB environments, Amplify apps, S3 buckets, CloudFront distributions, secrets
3. **Personalizar** el template con los datos reales del proyecto (IDs, nombres, regiones, dominios)
4. **Verificar** que todos los recursos listados existan realmente
5. El archivo se coloca en la **raíz del repositorio del proyecto** (no en `-more/`)

---

## Plantilla

```markdown
---
description: Infraestructura AWS compartida y arquitectura general
globs: "*/"
alwaysApply: true
---

# Infraestructura — {{PROYECTO}}

## Arquitectura general

{{DIAGRAMA_ARQUITECTURA}}

## AWS — Recursos de este proyecto

### Frontend: AWS Amplify
- App ID: {{AMPLIFY_APP_ID}}
- Región: {{AMPLIFY_REGION}}
- Branch producción: {{AMPLIFY_BRANCH_PROD}} (auto-deploy)
- Branch dev: {{AMPLIFY_BRANCH_DEV}} (auto-deploy)
- Custom domain: configurado con Route 53
- Build: {{AMPLIFY_BUILD_COMMAND}}
- Cache headers: {{AMPLIFY_CACHE_HEADERS}}

### Backend: Elastic Beanstalk
- Región: {{EB_REGION}}
- Application: {{EB_APP_NAME}}
- Env prod: {{EB_ENV_PROD}}
- Env dev: {{EB_ENV_DEV}}
- Plataforma: {{EB_PLATFORM}}
- Instancias: {{EB_INSTANCES}} ({{EB_DEPLOY_NOTE}})

### S3
- Bucket: {{S3_BUCKET}} — {{S3_PURPOSE}}

### CloudFront
- Distribution: {{CF_DOMAIN}}
- Para: {{CF_PURPOSE}}

### Route 53
- Hosted Zone ID: {{R53_ZONE_ID}}
- Registros relevantes: {{R53_RECORDS}}

### Secrets Manager
- {{SECRETS_PROD}} — env vars de producción
- {{SECRETS_DEV}} — env vars de desarrollo
- Contenido: {{SECRETS_CONTENT_SUMMARY}}

---

## Bases de Datos

### MongoDB Atlas
- Cluster: {{MONGO_CLUSTER}}
- Database: {{MONGO_DB_NAME}}
- Notas: {{MONGO_NOTES}}

### SQL Server (si aplica)
- Host: {{SQL_HOST}}
- Database: {{SQL_DB_NAME}}
- Conexión vía: {{SQL_CONNECTION_METHOD}}

---

## Servicios Externos

### Auth
- Proveedor: {{AUTH_PROVIDER}}
- Configuración backend: {{AUTH_BACKEND_CONFIG}}
- Configuración frontend: {{AUTH_FRONTEND_CONFIG}}
- Tokens: {{AUTH_TOKEN_STORAGE}}

### Push Notifications (si aplica)
- Proveedor: {{PUSH_PROVIDER}}
- Proyecto: {{PUSH_PROJECT_ID}}
- SDK backend: {{PUSH_BACKEND_SDK}}
- SDK frontend: {{PUSH_FRONTEND_SDK}}

---

## DNS (informativo)
- {{DOMAIN_FRONTEND}} → {{DOMAIN_FRONTEND_TARGET}}
- {{DOMAIN_API}} → {{DOMAIN_API_TARGET}}

---

## ⚠️ Notas Importantes

{{NOTAS_IMPORTANTES}}
```

---

## Ejemplo Real: NOR-PAN Tienda Virtual

Este es un ejemplo completo de `infrastructure.mdc` para referencia del agente:

```markdown
---
description: Infraestructura AWS compartida y arquitectura general
globs: "*/"
alwaysApply: true
---

# Infraestructura — NOR-PAN Tienda Virtual

## Arquitectura general

Cliente (PWA) → AWS Amplify (us-west-2) → Frontend React
                     ↓
              AWS EB (us-east-1) → Backend Express
                     ↓
         SQL Server (Sequelize) + MongoDB Atlas (Mongoose)


## AWS — Recursos de este proyecto

### Frontend: AWS Amplify
- App ID: d27r5nh03e85qt
- Región: us-west-2
- Branch producción: main (auto-deploy)
- Branch dev: development (auto-deploy)
- Custom domain: configurado con Route 53
- Build: CI=true yarn build (warnings = errors)
- Cache headers: /static/** = 1 year, index.html = no-cache

### Backend: Elastic Beanstalk
- Región: us-east-1
- Application: Nor-Pan
- Env prod: Nor-Pan-prod
- Env dev: Nor-Pan-dev
- Plataforma: Node.js 18
- Instancias: 1 (sin rolling update = downtime durante deploy)

### S3
- Bucket: norpan-images — imágenes de productos

### CloudFront
- Distribution: d3s5k20gkchlse.cloudfront.net
- Para serving de assets estáticos

### Route 53
- Hosted Zone ID: Z08016492VEAESWZQ00V9
- A ALIAS record para naked domain → Amplify

### Secrets Manager
- Nor-Pan/Prod — env vars de producción
- Nor-Pan/Dev — env vars de desarrollo
- Firebase credentials, DB strings, Auth0, SendGrid, etc.

## MongoDB Atlas — COMPARTIDA (⚠️ CUIDADO)
- Cluster: nor-pan.vbhohtu.mongodb.net
- Database: Production
- Development y producción usan la MISMA base de datos
- Esto es un problema conocido. No insertar datos de prueba sin limpiar.
- Colecciones push: pushsubscriptions, pushnotificationlogs, pushnotificationevents

## Firebase
- Proyecto: nor-pan-tienda-virtual
- Compartido entre dev y prod
- FCM para push notifications
- Firebase Admin SDK en backend (credenciales en Secrets Manager)
- Firebase client SDK en frontend (config en env vars de Amplify)

## Auth
- Backend usa Auth0 + express-oauth2-jwt-bearer
- Frontend guarda tokens en localStorage: access_token, id_token, refresh_token, user_id
- Los tokens van en header Authorization: Bearer <token>
- Refresh automático en frontend

## DNS (informativo)
- tiendanorpan.com → Amplify (frontend)
- api.tiendanorpan.com → EB (backend)
```

---

## Variables a Reemplazar

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{PROYECTO}}` | Nombre del proyecto | NOR-PAN Tienda Virtual |
| `{{DIAGRAMA_ARQUITECTURA}}` | Diagrama ASCII de la arquitectura | Cliente → Amplify → EB → DBs |
| `{{AMPLIFY_APP_ID}}` | ID de la app en Amplify | d27r5nh03e85qt |
| `{{AMPLIFY_REGION}}` | Región de Amplify | us-west-2 |
| `{{EB_APP_NAME}}` | Nombre de la aplicación EB | Nor-Pan |
| `{{EB_ENV_PROD}}` | Environment de producción | Nor-Pan-prod |
| `{{EB_ENV_DEV}}` | Environment de desarrollo | Nor-Pan-dev |
| `{{S3_BUCKET}}` | Nombre del bucket S3 | norpan-images |
| `{{CF_DOMAIN}}` | Dominio de CloudFront | d3s5k20gkchlse.cloudfront.net |
| `{{R53_ZONE_ID}}` | ID de la Hosted Zone | Z08016492VEAESWZQ00V9 |
| `{{SECRETS_PROD}}` | Nombre del secret de prod | Nor-Pan/Prod |
| `{{SECRETS_DEV}}` | Nombre del secret de dev | Nor-Pan/Dev |
| `{{MONGO_CLUSTER}}` | Host del cluster MongoDB | nor-pan.vbhohtu.mongodb.net |
| `{{AUTH_PROVIDER}}` | Proveedor de autenticación | Auth0 |
| `{{PUSH_PROVIDER}}` | Proveedor de push notifications | Firebase FCM |
| `{{DOMAIN_FRONTEND}}` | Dominio del frontend | tiendanorpan.com |
| `{{DOMAIN_API}}` | Dominio del API | api.tiendanorpan.com |

---

## Notas para el Agente

- **infrastructure.mdc va en la raíz del repo**, no en `-more/`
- **Cada proyecto tiene su propio infrastructure.mdc** con datos reales
- **Nunca copiar IDs/ARNs de un proyecto a otro** — cada proyecto tiene sus propios recursos
- **Si no tenés acceso a AWS**, pedirle al usuario los datos de cada servicio
- **Secciones opcionales**: Si el proyecto no usa S3, CloudFront, Firebase, etc., omitir esas secciones
- **El formato `.mdc`** permite frontmatter con `description`, `globs`, y `alwaysApply` para que herramientas de agentes lo carguen automáticamente

---

## Checklist de Calidad

Antes de marcar como completo:

- [ ] Todos los IDs y nombres de recursos son reales (no placeholders)
- [ ] Las regiones son correctas para cada servicio
- [ ] Los branches de deploy coinciden con la configuración real
- [ ] Los secrets listados existen en Secrets Manager
- [ ] Las notas importantes reflejan riesgos reales (ej: DB compartida dev/prod)
- [ ] No hay secciones de servicios que el proyecto no usa

---

*Skill para Replicant-2049 — INCBA*
