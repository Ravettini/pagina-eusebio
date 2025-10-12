# 🚀 Inicio Rápido - Validador de Emails GCBA

## ⚡ En 3 pasos

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Iniciar servidor
```bash
npm start
```

### 3️⃣ Abrir navegador
```
http://localhost:3000
```

---

## 📁 Archivos de prueba

Hay un archivo de ejemplo en `public/ejemplo-emails.csv` que podés usar para probar la aplicación.

---

## 🎯 Flujo básico

1. **Cargar** archivo Excel o CSV con emails
2. **Configurar** parámetros de validación (opcional)
3. **Procesar** la lista
4. **Revisar** resultados (válidos/inválidos)
5. **Exportar** en XLSX o CSV

---

## 📚 Documentación completa

- **README.md** - Información general del proyecto
- **MANUAL_USO.md** - Guía detallada de uso
- **CONTRIBUTING.md** - Guía para contribuir
- **DEPLOYMENT.md** - Instrucciones de deploy

---

## 🎨 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **SheetJS** - Procesamiento Excel/CSV
- **Vitest** - Testing

---

## ⚙️ Comandos útiles

```bash
# Desarrollo
npm start              # Iniciar servidor de desarrollo
npm run build          # Build para producción

# Tests
npm test               # Ejecutar tests
npm run test:ui        # Tests con interfaz visual

# Calidad de código
npm run lint           # Ejecutar linter
npm run format         # Formatear código
```

---

## 🎨 Colores GCBA

```css
Amarillo:  #FFCC00
Cyan:      #8DE2D6
Azul:      #153244
Gris:      #3C3C3B
Off-white: #FCFCFC
```

---

## 🆘 ¿Problemas?

### El servidor no inicia
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
# Limpiar cache de Next.js
rm -rf .next
npm start
```

### Tests fallan
```bash
# Verificar que todas las dependencias estén instaladas
npm install
npm test
```

---

## 📞 Contacto

GO Observatorio y Datos - GCBA

---

**¡Listo para validar emails! 🎉**

