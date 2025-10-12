import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-gcba-blue py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <Image
              src="/fondo.png"
              alt="Logo GO Observatorio y Datos"
              width={120}
              height={120}
              className="h-30 w-30 object-contain"
            />
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium">Gobierno de la Ciudad de Buenos Aires</p>
              <p className="text-sm text-gcba-cyan">
                Herramienta de validación de correos electrónicos<br/>
                Desarrollado por GO Observatorio y Datos
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <a
              href="https://www.buenosaires.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gcba-cyan hover:text-gcba-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcba-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-gcba-blue"
            >
              BA.gob.ar
            </a>
            <a
              href="https://www.buenosaires.gob.ar/jefedegobierno/legalytecnica/normativa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gcba-cyan hover:text-gcba-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcba-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-gcba-blue"
            >
              Normativa
            </a>
          </div>
        </div>
        <div className="mt-6 border-t border-gcba-cyan/20 pt-6 text-center">
          <p className="text-xs text-gcba-cyan/80">
            © {new Date().getFullYear()} Gobierno de la Ciudad de Buenos Aires. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}


