import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Mail } from "lucide-react";

export default function GuiaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gcba-blue">Guía de mejores prácticas</h1>
            <p className="mt-2 text-lg text-gcba-gray">
              Cómo mantener listas de correo sanas y mejorar la entregabilidad
            </p>
            <p className="mt-1 text-sm text-gcba-cyan">
              GO Observatorio y Datos
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-gcba-blue" />
                <CardTitle>¿Por qué validar emails?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-gcba-gray">
              <p>
                Una lista de correos electrónicos limpia y validada es fundamental para mantener
                una buena reputación de remitente y asegurar que tus mensajes lleguen a los
                destinatarios correctos. Los emails inválidos pueden causar:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Altas tasas de rebote (bounce rate)</li>
                <li>Daño a tu reputación como remitente</li>
                <li>Bloqueo por proveedores de email</li>
                <li>Pérdida de recursos en envíos fallidos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-gcba-cyan" />
                <CardTitle>Reglas de validación aplicadas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  1. Formato básico RFC
                </h3>
                <p className="text-sm text-gcba-gray">
                  Verifica que el email cumpla con el formato estándar usuario@dominio.tld
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  2. Mínimo 4 caracteres antes de @
                </h3>
                <p className="text-sm text-gcba-gray">
                  Los emails con menos de 4 caracteres en la parte local suelen ser inválidos o
                  de prueba. Ejemplo rechazado: <code className="rounded bg-muted px-1">abc@gmail.com</code>
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  3. No sólo números
                </h3>
                <p className="text-sm text-gcba-gray">
                  Los emails con sólo números antes del @ (como 123456@gmail.com) suelen ser
                  cuentas falsas o temporales con baja interacción.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  4. Detección de typos comunes
                </h3>
                <p className="text-sm text-gcba-gray">
                  Identificamos errores frecuentes como @gmial, @gmal, @hotmal, @.con que
                  resultan en envíos fallidos.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  5. Correos de rol (genéricos)
                </h3>
                <p className="text-sm text-gcba-gray">
                  Por defecto, rechazamos emails genéricos como info@, ventas@, contacto@ porque
                  suelen tener baja interacción y pueden afectar negativamente las métricas de
                  campaña. Podés habilitarlos si tu caso de uso lo requiere.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  6. Filtro geográfico (opcional)
                </h3>
                <p className="text-sm text-gcba-gray">
                  Si tus campañas están dirigidas a Argentina y la región, podés filtrar TLDs
                  fuera del target para mejorar la relevancia (.ar, .com, .net, etc.).
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gcba-blue">
                  7. Verificación MX (opcional)
                </h3>
                <p className="text-sm text-gcba-gray">
                  Verifica que el dominio tenga registros MX configurados, lo que indica que puede
                  recibir correos. Esta validación requiere configuración del servidor.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-gcba-yellow" />
                <CardTitle>Recomendaciones Doppler</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-gcba-gray">
              <p>
                Estas reglas están basadas en las mejores prácticas recomendadas por Doppler y
                otros proveedores de email marketing:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Mantené tu lista actualizada:</strong> Revisá y limpiá tu base de datos
                  regularmente.
                </li>
                <li>
                  <strong>Evitá comprar listas:</strong> Los emails adquiridos suelen tener baja
                  calidad y alta tasa de rechazo.
                </li>
                <li>
                  <strong>Implementá doble opt-in:</strong> Confirma que los suscriptores
                  realmente quieren recibir tus emails.
                </li>
                <li>
                  <strong>Segmentá tu audiencia:</strong> Enviá contenido relevante a grupos
                  específicos.
                </li>
                <li>
                  <strong>Monitoreá métricas:</strong> Analizá tasas de apertura, clics y rebotes
                  para identificar problemas.
                </li>
                <li>
                  <strong>Respetá las bajas:</strong> Eliminá inmediatamente a quienes se
                  desuscriban.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gcba-cyan bg-gcba-cyan/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-gcba-blue" />
                <div>
                  <h3 className="mb-2 font-semibold text-gcba-blue">
                    ¿Necesitás ayuda adicional?
                  </h3>
                  <p className="text-sm text-gcba-gray">
                    Para consultas sobre el uso de esta herramienta o mejores prácticas de email
                    marketing en el ámbito gubernamental, contactá al equipo de GO Observatorio y Datos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}


