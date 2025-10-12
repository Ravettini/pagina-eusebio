"use client";

import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b bg-gcba-offwhite">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.jfif"
              alt="Logo GO Observatorio y Datos"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gcba-blue">Validador de Emails</h1>
            <p className="text-sm text-gcba-gray">GO Observatorio y Datos</p>
          </div>
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gcba-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcba-blue focus-visible:ring-offset-2"
          >
            Validar Emails
          </Link>
          <Link
            href="/guia"
            className="text-sm font-medium text-gcba-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcba-blue focus-visible:ring-offset-2"
          >
            Guía
          </Link>
        </nav>
      </div>
    </header>
  );
}


