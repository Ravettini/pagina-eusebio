# ✅ Solución Error 500 en /api/validate (Netlify)

## 🔍 Problema identificado

El error 500 en `/api/validate` ocurría porque **Netlify no soporta el módulo `dns/promises` de Node.js** en sus funciones serverless.

## 🛠️ Cambios realizados

### 1. **components/ui/input.tsx**
- Corregido error de TypeScript (interfaz vacía → type alias)
- **Estado**: ✅ Resuelto

### 2. **lib/mx-validator.ts**
- Cambiado a importación dinámica de `dns/promises`
- Agregado manejo de errores para ambientes sin soporte DNS
- **Estado**: ✅ Resuelto

### 3. **components/validation-params.tsx**
- Ocultadas opciones de "Verificar registro MX" y "Antigüedad" del frontend
- Removido código no utilizado
- **Estado**: ✅ Resuelto

### 4. **DEPLOY_NETLIFY.md**
- Actualizada documentación sobre variables de entorno
- Agregada nota importante sobre `ENABLE_MX_CHECK`
- **Estado**: ✅ Actualizado

## 📋 Pasos para desplegar en Netlify

### 1️⃣ Configurar Variables de Entorno en Netlify

Ve a tu panel de Netlify y configura las siguientes variables:

**Site Settings → Environment variables → Add a variable**

```
ENABLE_MX_CHECK=false
MAX_FILE_SIZE=10485760
```

**⚠️ IMPORTANTE**: `ENABLE_MX_CHECK` **DEBE** estar en `false` en Netlify.

### 2️⃣ Commitear y pushear los cambios

```bash
git add .
git commit -m "Fix: Solucionar error 500 en /api/validate para Netlify"
git push
```

### 3️⃣ Deploy en Netlify

El deploy debería ejecutarse automáticamente. Si no:
- Ve a tu sitio en Netlify
- Click en "Trigger deploy" → "Deploy site"

### 4️⃣ Verificar que funcione

Después del deploy:
1. Sube un archivo CSV/XLSX con emails
2. Verifica que la validación funcione correctamente
3. El error 500 debería estar resuelto

## 🧪 ¿Por qué falló antes?

```javascript
// ❌ ANTES (no funciona en Netlify)
import { resolveMx } from "dns/promises";

// ✅ AHORA (funciona en Netlify)
const dns = await import("dns/promises");
// + manejo de errores cuando el módulo no está disponible
```

## 📊 Funcionalidades disponibles en Netlify

✅ Validación de formato de email  
✅ Normalización de emails  
✅ Detección de typos en dominios  
✅ Filtrado de correos de rol  
✅ Filtrado por TLDs (geografía)  
✅ Deduplicación  
✅ Exportación a XLSX/CSV  
❌ Verificación de registros MX (oculta, no disponible en Netlify)  
❌ Verificación de antigüedad (oculta, no implementada)

## 🔧 Si aún tienes problemas

1. **Limpiar cache de Netlify**:
   - Site settings → Build & deploy
   - Click en "Clear cache and retry deploy"

2. **Verificar logs de deploy**:
   - Deploys → Click en el deploy más reciente
   - Revisar "Function logs"

3. **Verificar variables de entorno**:
   - Site settings → Environment variables
   - Confirmar que `ENABLE_MX_CHECK=false`

## 💡 Desarrollo local

En desarrollo local puedes usar `ENABLE_MX_CHECK=true` si lo deseas:

```bash
# Crear archivo .env en la raíz del proyecto
ENABLE_MX_CHECK=true
MAX_FILE_SIZE=10485760
```

---

**Actualizado**: Octubre 2025  
**GO Observatorio y Datos** - GCBA

