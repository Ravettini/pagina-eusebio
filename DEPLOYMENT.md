# Guía de Deployment - Validador de Emails GCBA

## 🚀 Opciones de Deploy

### Vercel (Recomendado)

Vercel es la plataforma nativa para Next.js y ofrece deploy gratuito:

1. **Crear cuenta en Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configurar variables de entorno** en Vercel Dashboard:
   - `ENABLE_MX_CHECK=false`
   - `MAX_FILE_SIZE=10485760`

4. **Deploy a producción**
   ```bash
   vercel --prod
   ```

**URL ejemplo**: `https://validador-emails-gcba.vercel.app`

### Netlify

1. **Instalar Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### Servidor Propio (Node.js)

#### Requisitos
- Node.js 18+
- PM2 (para gestión de procesos)

#### Setup

1. **En el servidor, clonar el repo**
   ```bash
   git clone [URL_REPO]
   cd validador-emails-gcba
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con valores de producción
   ```

4. **Build para producción**
   ```bash
   npm run build
   ```

5. **Instalar PM2**
   ```bash
   npm install -g pm2
   ```

6. **Iniciar con PM2**
   ```bash
   pm2 start npm --name "validador-emails" -- start
   pm2 save
   pm2 startup
   ```

7. **Configurar Nginx como reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name validador.buenosaires.gob.ar;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Configurar SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d validador.buenosaires.gob.ar
   ```

### Docker

1. **Crear Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Crear docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     validador:
       build: .
       ports:
         - "3000:3000"
       environment:
         - ENABLE_MX_CHECK=false
         - MAX_FILE_SIZE=10485760
       restart: unless-stopped
   ```

3. **Build y ejecutar**
   ```bash
   docker-compose up -d
   ```

## 🔐 Seguridad en Producción

### Variables de entorno

**No commitear** archivos `.env.local` al repositorio.

Variables críticas:
```env
# Opcional: validación MX
ENABLE_MX_CHECK=false

# Límite de tamaño de archivo
MAX_FILE_SIZE=10485760

# Next.js
NODE_ENV=production
```

### Headers de seguridad

Agregar en `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Rate Limiting

Para proteger contra abuso, considerar implementar rate limiting:

```bash
npm install express-rate-limit
```

### HTTPS

**Obligatorio en producción**. Usar:
- Let's Encrypt (gratuito)
- Certificado institucional del GCBA
- Cloudflare (si se usa como proxy)

## 📊 Monitoreo

### Logs con PM2

```bash
# Ver logs en tiempo real
pm2 logs validador-emails

# Ver logs históricos
pm2 logs validador-emails --lines 1000

# Monitoreo de recursos
pm2 monit
```

### Métricas

Considerar integrar:
- **Sentry** para errores
- **Google Analytics** para uso
- **Prometheus** + **Grafana** para métricas del servidor

### Health Check

Crear endpoint en `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
```

## 🔄 CI/CD

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🗂️ Backup

### Base de datos

No se requiere backup de base de datos ya que no se persisten datos.

### Código fuente

- Usar Git con repositorio remoto
- Tags para versiones estables
- Branch `main` protegido

### Configuración

- Backup de variables de entorno
- Backup de configuración de servidor
- Documentar cambios en DNS/certificados

## 📈 Escalabilidad

### Optimizaciones

1. **Cache de assets**
   - Next.js incluye optimización automática
   - Configurar CDN para assets estáticos

2. **Procesamiento asíncrono**
   - Para listas muy grandes, considerar implementar cola
   - Redis + Bull para jobs

3. **Load balancing**
   - Si el tráfico crece, usar múltiples instancias
   - Nginx o cloud load balancer

4. **Serverless**
   - Vercel/Netlify escalan automáticamente
   - No requiere configuración adicional

## ✅ Checklist Pre-Deploy

- [ ] Tests pasan: `npm test`
- [ ] Build exitoso: `npm run build`
- [ ] Variables de entorno configuradas
- [ ] HTTPS configurado
- [ ] Headers de seguridad aplicados
- [ ] Dominio DNS configurado
- [ ] Monitoreo configurado
- [ ] Backup plan establecido
- [ ] Documentación actualizada
- [ ] Equipo notificado

## 🆘 Rollback

### Vercel
```bash
vercel rollback [deployment-url]
```

### PM2
```bash
pm2 delete validador-emails
git checkout [version-anterior]
npm install
npm run build
pm2 start npm --name "validador-emails" -- start
```

### Docker
```bash
docker-compose down
git checkout [version-anterior]
docker-compose up -d --build
```

---

**Contacto**: GO Observatorio y Datos - GCBA

