# Guía de contribución

## Desarrollo

### Requisitos previos

- Node.js 18+ 
- npm o yarn

### Setup inicial

```bash
# Clonar repositorio
git clone [URL_REPO]
cd validador-emails-gcba

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm start
```

### Estructura del proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── guia/              # Página de guía
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── header.tsx        # Header institucional
│   ├── footer.tsx        # Footer institucional
│   ├── file-upload.tsx   # Carga de archivos
│   ├── data-table.tsx    # Tabla de resultados
│   └── validation-params.tsx # Parámetros de validación
├── lib/                   # Utilidades y lógica
│   ├── __tests__/        # Tests unitarios
│   ├── email-validator.ts # Validación de emails
│   ├── mx-validator.ts   # Validación MX
│   └── utils.ts          # Utilidades generales
└── public/               # Archivos estáticos
```

## Estándares de código

### TypeScript

- Usar tipos explícitos cuando sea necesario
- Evitar `any`, preferir `unknown`
- Interfaces para objetos públicos

### React

- Componentes funcionales con hooks
- Props con TypeScript interfaces
- Usar "use client" solo cuando sea necesario

### Estilos

- Tailwind CSS para estilos
- Seguir paleta de colores GCBA
- Usar variables CSS para colores de marca

### Tests

- Tests unitarios para lógica crítica
- Nombrar archivos `*.test.ts` o `*.test.tsx`
- Cobertura mínima del 80% en funciones de validación

## Manual de marca GCBA

### Colores

Respetar siempre la paleta oficial:

```css
--gcba-yellow: #FFCC00  /* Amarillo institucional */
--gcba-cyan: #8DE2D6    /* Cyan */
--gcba-blue: #153244    /* Azul institucional */
--gcba-gray: #3C3C3B    /* Gris */
--gcba-offwhite: #FCFCFC /* Off-white */
```

### Tipografía

- **Fuente**: Archivo (Regular 400, Medium 500, Bold 700)
- No usar otras fuentes sin autorización

### Componentes

- **Botones CTA**: Amarillo con texto azul, `rounded-lg`
- **Cards**: Bordes suaves, `rounded-xl`
- **Contraste**: Cumplir WCAG AA mínimo

## Flujo de trabajo

1. Crear branch desde `main`: `feature/nombre-feature`
2. Hacer commits descriptivos en español
3. Ejecutar tests: `npm test`
4. Ejecutar linter: `npm run lint`
5. Formatear código: `npm run format`
6. Crear Pull Request con descripción detallada

## Commits

Usar mensajes descriptivos en español:

```
feat: agregar validación de caracteres especiales
fix: corregir typo en dominio outlook
docs: actualizar README con nuevas reglas
test: agregar tests para normalización Unicode
style: ajustar espaciado en header
refactor: simplificar lógica de deduplicación
```

## Revisión de código

Todos los PRs requieren:

- ✅ Tests pasando
- ✅ Sin errores de linter
- ✅ Código formateado
- ✅ Documentación actualizada
- ✅ Cumplimiento del manual de marca

## Contacto

Para dudas o consultas, contactá al equipo de **GO Observatorio y Datos** del GCBA.


