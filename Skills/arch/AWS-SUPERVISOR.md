---
description: Reglas de seguridad para operaciones en AWS — aplica a cualquier proyecto que use esta cuenta
globs: "*/"
alwaysApply: true
---

# ⛔ Reglas de seguridad AWS — OBLIGATORIAS

Esta cuenta AWS es compartida entre múltiples aplicaciones en producción.
Un error en un recurso puede afectar a TODAS las apps. Estas reglas son innegociables.

## 1. NUNCA crear recursos sin autorización EXPLÍCITA del usuario

- Antes de crear cualquier recurso (bucket S3, distribución CloudFront, environment EB, instancia RDS, cola SQS, función Lambda, etc.), pedir permiso al usuario describiendo:
  - *Qué* se va a crear
  - *En qué región/AZ*
  - *Por qué* es necesario
  - *Costo estimado* si aplica
- Solo proceder si el usuario aprueba explícitamente.
- Si el recurso requiere una AZ, crearlo en *us-east-1b* salvo que haya justificación técnica para otra.

## 2. NUNCA tocar Route 53

- Route 53 gestiona los dominios DNS de producción de todas las apps de la cuenta.
- Un cambio erróneo puede dejar uno o varios sitios inaccesibles.
- *PROHIBIDO* ejecutar comandos de AWS CLI, SDK, CDK, Terraform o consola que creen, modifiquen o eliminen registros DNS.
- Si se necesita un cambio DNS: redactar instrucciones exactas (tipo de registro, nombre, valor, TTL) para que el administrador humano las aplique manualmente.

## 3. NUNCA modificar distribuciones CloudFront sin autorización

- Las distribuciones CloudFront existentes sirven contenido a usuarios reales en producción.
- *PROHIBIDO* modificar behaviors, origins, cache policies, error pages, SSL certificates, WAF associations o ejecutar invalidaciones.
- Si un cambio es necesario: describir la modificación propuesta con detalle y esperar aprobación explícita antes de ejecutar.

## 4. Listar antes de actuar

- Antes de cualquier operación en un servicio AWS, *listar los recursos existentes* de ese servicio para confirmar el estado actual.
- *NO* modificar ni eliminar recursos que no sean el objetivo directo de la tarea en curso.
- Si hay recursos de otras aplicaciones en el mismo servicio, no tocarlos bajo ninguna circunstancia.
- Ante la duda, preguntar al usuario antes de proceder.

## 5. Región por defecto: us-east-1 (AZ: us-east-1b)

- Todo recurso nuevo (si se autoriza) debe crearse en *us-east-1, AZ **us-east-1b**, salvo que:
  - El servicio requiera una región específica (ej: Amplify puede estar en otra región).
  - Haya una justificación técnica documentada (latencia, compliance, etc.).
- *NUNCA* crear recursos en regiones distintas sin justificación y aprobación del usuario.

## 6. NUNCA modificar configuración de servicios de hosting/deploy sin autorización

- Esto incluye: Amplify, Elastic Beanstalk, ECS, Lambda, o cualquier servicio que sirva la aplicación.
- No cambiar build settings, branch configurations, environment variables, custom domains, scaling policies ni health checks sin aprobación.
- Los auto-deploys configurados están funcionando en producción. No desactivarlos ni modificarlos.

## 7. NUNCA modificar ni eliminar secrets o parámetros sin autorización

- Secrets Manager y SSM Parameter Store contienen credenciales críticas (DBs, APIs externas, tokens de servicios).
- *Leer* secrets para diagnóstico está permitido.
- *Modificar, rotar o eliminar* secrets requiere autorización explícita del usuario.
- Verificar que los secrets pertenecen a ESTA aplicación antes de leerlos.

## 8. NUNCA modificar IAM, security groups ni networking

- IAM roles, policies, users y security groups controlan permisos y acceso de red de TODOS los servicios de la cuenta.
- Un cambio en IAM o security groups puede afectar aplicaciones que no son las que se están trabajando.
- Cualquier modificación requiere: autorización explícita + justificación detallada + verificación de impacto en otros recursos.
- *PROHIBIDO* crear IAM users o access keys.

## 9. Proteger el entorno de producción

- *Siempre* verificar si se está apuntando a dev o prod antes de ejecutar cualquier operación.
- Preferir hacer cambios en el entorno de desarrollo primero, validar, y luego aplicar en producción con autorización.
- Si el servicio tiene una sola instancia (sin redundancia), cualquier deploy puede causar downtime. Advertir al usuario.
- *NUNCA* ejecutar operaciones destructivas (delete, terminate, purge) en producción sin autorización explícita y doble confirmación.

## 10. NUNCA eliminar recursos sin autorización y verificación de dependencias

- Antes de eliminar cualquier recurso, verificar que no tenga dependencias de otros servicios o aplicaciones.
- Listar qué otros recursos lo referencian (ej: un bucket referenciado por CloudFront, un security group usado por EB).
- Describir el impacto de la eliminación al usuario y esperar aprobación.
- Preferir deshabilitar/detener antes de eliminar cuando sea posible.

## 11. Documentar toda operación que modifique infraestructura

- Después de cualquier operación que modifique un recurso AWS, reportar al usuario:
  - *Qué* se modificó (servicio, recurso, ID)
  - *En qué región*
  - *Qué cambió* exactamente (antes → después)
  - *Resultado* (éxito/error)
- Si algo falla, reportar el error completo y NO intentar "arreglar" con operaciones adicionales sin consultar.

## 12. Scope: solo trabajar en los recursos de ESTE proyecto

- La cuenta AWS contiene recursos de múltiples aplicaciones.
- Solo operar sobre recursos que pertenezcan al proyecto actual (identificados en el archivo infrastructure.mdc del repo).
- Si durante un listado aparecen recursos de otras aplicaciones, *ignorarlos completamente*.
- Si no está claro si un recurso pertenece a este proyecto, preguntar al usuario antes de tocarlo.

---

## Tablas Anti-Racionalización

| Excusa | Realidad |
|--------|----------|
| "Es solo un recurso pequeño" | En una cuenta multi-empresa, cada recurso afecta facturación y governance de todas las apps |
| "Lo voy a borrar después" | En AWS, borrar puede ser irreversible o dejar artefactos huérfanos |
| "Es la misma config que dev" | Producción tiene diferentes dominios, secrets, y scale — verificar cada valor |
| "Ya sé que no existe" | SIEMPRE hacer inventory primero, nunca asumir |
| "No necesito autorización para un listado" | Los listados (GET/describe/list) SÍ son libres. La regla es para CREAR/MODIFICAR/ELIMINAR |
| "Es un cambio menor en CloudFront" | CloudFront tiene propagación global. Un error afecta a todos los usuarios inmediatamente |
| "Solo necesito leer este secret" | Verificar que el secret pertenece a ESTE proyecto antes de leerlo |
| "Puedo arreglar este error rápido" | NO intentar arreglar sin consultar. Reportar y esperar instrucciones |
| "El security group no se usa" | Un SG puede estar referenciado por recursos de OTRAS apps. Verificar siempre |

---

## Red Flags — STOP

- A punto de ejecutar `aws route53` → STOP. Dejar instrucciones.
- A punto de crear un recurso sin haber preguntado → STOP. Pedir autorización.
- A punto de modificar CloudFront → STOP. Describir cambio y esperar aprobación.
- A punto de ejecutar `delete`, `terminate`, `purge` → STOP. Doble confirmación.
- A punto de tocar IAM, security groups o networking → STOP. Justificación + autorización.
- A punto de modificar secrets → STOP. Verificar ownership + autorización.
- A punto de cambiar config de hosting/deploy → STOP. Los auto-deploys están en producción.
- No hiciste inventory del servicio → STOP. Listar primero.
- El recurso podría ser de otra app → STOP. Preguntar al usuario.

---

*Estándar INCBA — AWS Supervisor para agentes. Basado en Superpowers methodology.*
