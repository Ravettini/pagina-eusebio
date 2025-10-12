# Validador de Emails - GO Observatorio y Datos

Web app institucional para validar y normalizar listas de correos electrónicos según mejores prácticas de entregabilidad, alineada con el manual de marca del Gobierno de la Ciudad de Buenos Aires.

**Desarrollado por la GO Observatorio y Datos del GCBA.**

## 🎯 Características

- **Carga de archivos**: Acepta Excel (.xlsx) y CSV
- **Normalización**: Limpieza y estandarización de emails
- **Validación robusta**: Múltiples reglas basadas en recomendaciones Doppler
  - Formato RFC básico
  - Mínimo 4 caracteres antes de @
  - Detección de typos comunes (gmial, hotmal, etc.)
  - Rechazo de emails solo numéricos
  - Filtro de correos de rol/genéricos
  - Filtro geográfico por TLD (opcional)
  - Verificación MX (opcional)
- **Exportación**: Descarga de resultados en XLSX/CSV
- **Deduplicación**: Eliminación automática de duplicados
- **UI institucional**: Diseño alineado al manual de marca GCBA

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Componentes**: shadcn/ui + Radix UI
- **Procesamiento**: SheetJS (xlsx) para lectura/escritura de archivos
- **Validación**: Zod + reglas custom
- **Tests**: Vitest + Testing Library
- **Iconos**: Lucide React

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

## ⚙️ Configuración

Editar `.env.local`:

```env
# Habilitar verificación MX (requiere servidor Node.js)
ENABLE_MX_CHECK=false

# Límite de tamaño de archivo (en bytes)
MAX_FILE_SIZE=10485760
```

## 🎨 Diseño y Marca

La aplicación sigue estrictamente el manual de marca GCBA:

### Paleta de colores

```css
--gcba-yellow: #FFCC00
--gcba-cyan: #8DE2D6
--gcba-blue: #153244
--gcba-gray: #3C3C3B
--gcba-offwhite: #FCFCFC
```

### Tipografía

- **Fuente principal**: Archivo (Regular, Medium, Bold)
- **Fallback**: system-ui, -apple-system, sans-serif

### Componentes clave

- Botones CTA: amarillo con texto azul, esquinas redondeadas
- Cards: bordes suaves, radios generosos
- Chips de resumen: Válidos (azul/cyan), Inválidos (azul/amarillo)
- Header: fondo off-white con logo en azul
- Footer: azul con texto cyan/amarillo

## 📋 Uso

1. **Carga tu archivo**: Arrastrá un Excel o CSV con una columna de emails
2. **Configurá parámetros**: Ajustá las reglas de validación según tu caso de uso
3. **Procesar**: Hacé clic en "Procesar lista"
4. **Revisar resultados**: Explorá las tablas de emails válidos e inválidos
5. **Exportar**: Descargá los resultados en XLSX o CSV

## 🧪 Tests

```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Tests en modo watch
npm test -- --watch
```

## 📖 Reglas de Validación

### Formato básico
Verifica que el email cumpla con RFC simplificado `usuario@dominio.tld`

### Mínimo 4 caracteres antes de @
Emails muy cortos suelen ser inválidos o de prueba

### No sólo números
Rechaza `123456@gmail.com` (común en cuentas falsas)

### Detección de typos
Identifica errores comunes: `@gmial`, `@hotmal`, `.con`, `.comm`

### Correos de rol
Por defecto rechaza: `info@`, `ventas@`, `contacto@`, `administracion@`, etc.

### Filtro geográfico
Opcional: permite solo TLDs relevantes (.ar, .com, .net, etc.)

### Verificación MX
Opcional: verifica que el dominio tenga servidor de correo configurado

### Lista blanca
Dominios institucionales siempre válidos: `@buenosaires.gob.ar`

## 🔒 Seguridad

- Límite de tamaño de archivo: 10MB por defecto
- Validación de MIME type y extensión
- No se persisten datos en el servidor
- Procesamiento en memoria
- Sanitización de inputs

## 📚 Recursos

- [Manual de marca GCBA](https://www.buenosaires.gob.ar/guiademarca)
- [Recomendaciones Doppler](https://www.fromdoppler.com/es/recursos)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 Licencia

© 2025 Gobierno de la Ciudad de Buenos Aires. Todos los derechos reservados.

## 🤝 Contribuir

Para consultas o sugerencias, contactá al equipo de **GO Observatorio y Datos** del GCBA.


