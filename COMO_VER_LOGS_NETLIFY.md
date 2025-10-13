# 🔍 Cómo ver los logs de error en Netlify

## Paso 1: Acceder al panel de Netlify

1. Ve a: https://app.netlify.com
2. Inicia sesión con tu cuenta
3. Selecciona tu sitio: **transcendent-cendol-b58847** (o el que corresponda)

## Paso 2: Ver los logs de funciones

### Opción A: Logs en tiempo real

1. En el menú lateral, haz click en **"Functions"**
2. Deberías ver una función llamada **`validate`** o **`___netlify-handler`**
3. Haz click en esa función
4. Ve a la pestaña **"Logs"** o **"Function log"**
5. Sube un archivo CSV/XLSX en tu aplicación para provocar el error
6. **Los logs aparecerán aquí en tiempo real**

Busca líneas que digan:
```
[VALIDATE] Inicio de validación
[VALIDATE ERROR] Error completo: ...
```

### Opción B: Logs del deploy

1. En el menú lateral, haz click en **"Deploys"**
2. Haz click en el deploy más reciente (el primero de la lista)
3. Desplázate hacia abajo hasta **"Function logs"**
4. Aquí verás los logs de todas las funciones

## Paso 3: Qué buscar en los logs

Los logs deberían mostrar algo como:

```
[VALIDATE] Inicio de validación
[VALIDATE] FormData recibido
[VALIDATE] Archivo: ejemplo.csv Tamaño: 1234
[VALIDATE ERROR] Error completo: [el error aquí]
[VALIDATE ERROR] Stack: [el stack trace aquí]
[VALIDATE ERROR] Mensaje: [mensaje del error]
```

## Paso 4: Compartir los logs

Copia todo el texto de los logs y compártelo para poder identificar el problema exacto.

---

## 🔧 Solución alternativa: Netlify CLI

Si no puedes acceder a los logs en el panel web, puedes instalar Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
netlify link
netlify functions:logs validate
```

---

**Actualizado**: Octubre 2025

