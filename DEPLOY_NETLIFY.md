# 🚀 Deploy en Netlify - Validador de Emails GCBA

## ✅ Problema resuelto

Se corrigió el error de build en Netlify excluyendo los archivos de test del proceso de compilación.

## 📋 Cambios realizados:

1. **tsconfig.json actualizado**:
   - Excluidos `vitest.config.ts` y `vitest.setup.ts`
   - Excluidos todos los archivos `**/*.test.ts` y `**/*.test.tsx`

2. **netlify.toml creado**:
   - Configuración de build correcta
   - Plugin de Next.js configurado

## 🔄 Pasos para deployar:

### 1. Commitear los cambios
```bash
git add .
git commit -m "Fix: Excluir archivos de test del build de Netlify"
git push
```

### 2. En Netlify
- El deploy debería ejecutarse automáticamente
- O hacé click en "Trigger deploy" → "Deploy site"

## ⚙️ Configuración de Netlify (verificar):

### Build settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### Environment variables (IMPORTANTE):
```
ENABLE_MX_CHECK=false
MAX_FILE_SIZE=10485760
```

**NOTA IMPORTANTE**: La verificación MX (`ENABLE_MX_CHECK`) **debe estar en `false`** en Netlify porque las funciones serverless de Netlify no soportan el módulo `dns` de Node.js. Si está habilitada, recibirás errores 500 en `/api/validate`.

### Plugins:
- ✅ `@netlify/plugin-nextjs` (ya configurado en netlify.toml)

## ✅ El build debería funcionar ahora

Los archivos de Vitest ya no causarán conflictos de tipos durante el build de producción.

## 🧪 Tests en local (siguen funcionando):

```bash
npm test
```

Los tests locales funcionan perfectamente porque usan los archivos excluidos del build de producción.

## 📊 Verificación post-deploy:

1. ✅ La app carga correctamente
2. ✅ Los logos se ven bien
3. ✅ La validación de emails funciona
4. ✅ La exportación XLSX/CSV funciona
5. ✅ Las imágenes están optimizadas

## 🔧 Si aún hay problemas:

### Limpiar cache de Netlify:
1. Ir a Site settings
2. Build & deploy → Environment
3. Click en "Clear cache and retry deploy"

### Verificar variables de entorno:
Las variables opcionales pueden configurarse en:
Site settings → Environment variables

---

**Actualizado**: Octubre 2025  
**GO Observatorio y Datos** - GCBA

