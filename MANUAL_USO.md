# Manual de Uso - Validador de Emails GCBA

## 🚀 Inicio rápido

### 1. Preparar tu archivo

Asegurate de que tu archivo Excel o CSV tenga una columna de emails con alguno de estos nombres:
- `email`
- `mail` 
- `correo`
- `e-mail`
- `correo electronico`

**Ejemplo de formato:**

```csv
email,nombre,empresa
juan.perez@example.com,Juan Pérez,Empresa A
maria.lopez@gmail.com,María López,Empresa B
contacto@empresa.com,Contacto,Empresa C
```

### 2. Cargar el archivo

1. Abrí la aplicación en tu navegador (por defecto en `http://localhost:3000`)
2. Arrastrá tu archivo Excel (.xlsx) o CSV a la zona de carga, o hacé clic en "Seleccionar archivo"
3. El tamaño máximo permitido es **10MB**

### 3. Configurar parámetros (opcional)

Antes de procesar, podés ajustar las reglas de validación:

#### 🔘 Permitir correos de rol
- **Desactivado (recomendado)**: Rechaza emails genéricos como info@, ventas@, contacto@
- **Activado**: Permite estos emails en la lista válida
- **Cuándo activar**: Si necesitás contactar áreas específicas de empresas

#### 🔘 Filtrar TLDs fuera del target
- **Desactivado**: Permite todos los dominios de nivel superior (TLDs)
- **Activado**: Solo permite TLDs relevantes (.ar, .com, .net, .org, .edu, etc.)
- **Cuándo activar**: Campañas focalizadas en Argentina y región

#### 🔘 Verificar registro MX
- **Requiere configuración del servidor** (por defecto deshabilitado)
- Verifica que el dominio tenga servidor de correo configurado
- Útil para mayor precisión pero puede demorar el procesamiento

#### 🔘 Considerar antigüedad
- **Próximamente**: Marcará emails con más de 12 meses (informativo)

### 4. Procesar la lista

1. Hacé clic en el botón **"Procesar lista"**
2. Esperá mientras se normaliza y valida cada email
3. El proceso es instantáneo para listas pequeñas (< 1000 emails)
4. Listas grandes pueden tomar algunos segundos

### 5. Revisar resultados

Verás un **resumen** con:
- ✅ **Cantidad de emails válidos** (chip azul/cyan)
- ❌ **Cantidad de emails inválidos** (chip azul/amarillo)
- 📊 **Total procesado** y duplicados eliminados

#### Pestaña "Válidos"
- Listado de emails que pasaron todas las validaciones
- Podés buscar, copiar al portapapeles o exportar
- Estos emails son seguros para usar en campañas

#### Pestaña "Inválidos"
- Listado con el **motivo** de rechazo de cada email
- Motivos comunes:
  - `Formato inválido`
  - `Menos de 4 caracteres antes de @`
  - `Sólo números antes de @`
  - `Dominio con typo detectado`
  - `Correo de rol (genérico)`
  - `TLD fuera del target geográfico`
  - `Sin registro MX`

### 6. Exportar resultados

Tenés varias opciones de exportación:

#### Descargar todo (XLSX)
- Un archivo Excel con **dos hojas**:
  - `VALIDOS`: Lista de emails válidos
  - `INVALIDOS`: Lista con columna de motivo
- **Recomendado** para análisis completo

#### Descargar por separado
- **CSV** o **XLSX** de válidos o inválidos individualmente
- Útil si solo necesitás una lista

#### Nombres de archivos
Los archivos se descargan con fecha automática:
- `validos_YYYYMMDD.xlsx`
- `invalidos_YYYYMMDD.xlsx`
- `resultado_validacion_YYYYMMDD.xlsx`

## 📝 Ejemplos de uso

### Caso 1: Newsletter semanal
```
Parámetros sugeridos:
☐ Permitir correos de rol
☑ Filtrar TLDs fuera del target
☐ Verificar registro MX
```

### Caso 2: Contacto B2B con empresas
```
Parámetros sugeridos:
☑ Permitir correos de rol (para contacto@, ventas@)
☐ Filtrar TLDs fuera del target
☑ Verificar registro MX (si está habilitado)
```

### Caso 3: Campaña institucional interna
```
Parámetros sugeridos:
☑ Permitir correos de rol
☐ Filtrar TLDs fuera del target
☐ Verificar registro MX
```

## 🔍 Entendiendo los motivos de rechazo

### Formato inválido
Email no cumple con el formato básico `usuario@dominio.tld`
**Ejemplo**: `usuario@`, `@dominio.com`, `usuario.com`

### Menos de 4 caracteres antes de @
La parte local del email es demasiado corta
**Ejemplo**: `abc@gmail.com` (rechazado), `abcd@gmail.com` (válido)

### Sólo números antes de @
Email compuesto solo por números (común en cuentas falsas)
**Ejemplo**: `123456@gmail.com`

### Dominio con typo detectado
Error tipográfico común en dominio popular
**Ejemplo**: `usuario@gmial.com`, `usuario@hotmal.com`

### TLD inválido
Dominio con extensión incorrecta
**Ejemplo**: `usuario@example.con`, `usuario@example.comm`

### Correo de rol (genérico)
Email no personal que va a buzón compartido
**Ejemplo**: `info@`, `ventas@`, `contacto@`, `administracion@`

### TLD fuera del target geográfico
Dominio de país no relevante para la campaña
**Ejemplo**: `usuario@example.ru` (cuando el target es Argentina)

### Sin registro MX
El dominio no tiene servidor de correo configurado
**Ejemplo**: Dominio inexistente o mal configurado

## ⚠️ Buenas prácticas

### ✅ Hacer
- Validar listas periódicamente (cada 3-6 meses)
- Revisar manualmente casos dudosos
- Segmentar por tipo de resultado
- Documentar decisiones sobre parámetros
- Hacer backup de listas originales

### ❌ Evitar
- Ignorar todos los inválidos sin revisar
- Procesar listas de origen desconocido
- Enviar a emails sin validar
- Modificar manualmente archivos exportados sin registro

## 🆘 Problemas comunes

### "No se encontró ninguna columna de emails"
**Solución**: Renombrá tu columna a `email`, `mail` o `correo`

### "El archivo excede el tamaño máximo"
**Solución**: Dividí tu lista en archivos más pequeños (máx 10MB)

### "Error procesando el archivo"
**Solución**: Verificá que el formato sea .xlsx o .csv válido

### Muchos emails válidos aparecen como inválidos
**Solución**: Revisá los parámetros, especialmente "Permitir correos de rol"

## 📊 Interpretando resultados

### Tasa de válidos > 80%
✅ Lista saludable, buena fuente de datos

### Tasa de válidos 50-80%
⚠️ Lista necesita limpieza, revisar inválidos

### Tasa de válidos < 50%
❌ Lista de baja calidad, considerar nueva fuente

## 📞 Soporte

Para consultas sobre el uso de esta herramienta:
- Contactar al equipo de **GO Observatorio y Datos** del GCBA
- Revisar la [Guía de mejores prácticas](/guia) en la aplicación

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0

