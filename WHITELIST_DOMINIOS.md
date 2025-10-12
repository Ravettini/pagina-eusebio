# 📋 Lista de Dominios Whitelist - GO Observatorio y Datos

## 🎯 Dominios Siempre Válidos

Los siguientes dominios están en la **lista blanca** y **siempre serán considerados válidos**, independientemente de otras reglas de validación:

### 🏛️ Institucionales
- `@buenosaires.gob.ar` - Dominios oficiales del GCBA

### 📧 Proveedores de Email Principales
- `@gmail.com` - Google Gmail
- `@yahoo.com` - Yahoo Mail
- `@yahoo.com.ar` - Yahoo Argentina
- `@outlook.com` - Microsoft Outlook
- `@hotmail.com` - Microsoft Hotmail
- `@live.com` - Microsoft Live

## 💡 ¿Por qué estos dominios?

### 1. **Alta entregabilidad**
Estos proveedores tienen excelente reputación y tasas de entrega muy altas.

### 2. **Uso masivo**
Son los proveedores más utilizados en Argentina y Latinoamérica.

### 3. **Confiabilidad**
Tienen infraestructura robusta y filtros anti-spam bien configurados.

### 4. **Accesibilidad**
Los usuarios pueden acceder fácilmente a estos servicios.

## 🔄 Comportamiento del Whitelist

### ✅ Lo que SÍ pasa el whitelist:
- `info@gmail.com` → ✅ Válido (aunque sea de rol)
- `abc@yahoo.com` → ✅ Válido (aunque tenga menos de 4 caracteres)
- `contacto@outlook.com` → ✅ Válido (aunque sea genérico)
- `usuario@buenosaires.gob.ar` → ✅ Válido (dominio institucional)

### ❌ Lo que NO pasa el whitelist:
- `usuario@empresa.com` → ❌ Aplica todas las reglas normales
- `test@dominio.com.ar` → ❌ Aplica todas las reglas normales

## ⚙️ Configuración Técnica

El whitelist está definido en `lib/email-validator.ts`:

```typescript
const WHITELISTED_DOMAINS = [
  "buenosaires.gob.ar",
  "gmail.com",
  "yahoo.com", 
  "yahoo.com.ar",
  "outlook.com",
  "hotmail.com",
  "live.com",
];
```

## 🎛️ Personalización

Si necesitás agregar o quitar dominios del whitelist:

1. **Editar** `lib/email-validator.ts`
2. **Modificar** la constante `WHITELISTED_DOMAINS`
3. **Actualizar** los tests en `lib/__tests__/email-validator.test.ts`
4. **Rebuild** la aplicación

## 📊 Impacto en la Validación

### Antes del Whitelist:
- Emails de rol: ❌ Rechazados
- Emails cortos: ❌ Rechazados
- Emails genéricos: ❌ Rechazados

### Con Whitelist:
- Emails de rol en dominios whitelist: ✅ Aceptados
- Emails cortos en dominios whitelist: ✅ Aceptados
- Emails genéricos en dominios whitelist: ✅ Aceptados

## 🔍 Casos de Uso

### Caso 1: Newsletter General
- **Recomendación**: Mantener whitelist activo
- **Razón**: Maximizar entregabilidad en dominios populares

### Caso 2: Comunicación B2B
- **Recomendación**: Revisar whitelist
- **Razón**: Muchos emails corporativos no están en la lista

### Caso 3: Campaña Institucional
- **Recomendación**: Mantener whitelist activo
- **Razón**: Buenos Aires.gob.ar siempre debe ser válido

## 📈 Métricas Esperadas

Con el whitelist activo, esperamos:
- **Aumento del 15-20%** en emails válidos
- **Mejor entregabilidad** en dominios populares
- **Menos falsos positivos** en validación

## 🧪 Testing

Para probar el whitelist:

1. **Usar el archivo de ejemplo**: `public/ejemplo-emails.csv`
2. **Observar que emails con dominios whitelist** aparecen como válidos
3. **Verificar que otros dominios** siguen las reglas normales

## 📞 Contacto

Para consultas sobre el whitelist o sugerir nuevos dominios:
- **Equipo**: GO Observatorio y Datos
- **Email**: [contacto del equipo]
- **Documentación**: Ver `MANUAL_USO.md`

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0


