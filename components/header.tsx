"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#434655]/40 bg-[#353534]/80 backdrop-blur-xl shadow-[0px_24px_48px_rgba(0,0,0,0.5)] transition-[height,background,transform,padding] duration-300">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8 transition-[height,padding] duration-300 ${
          isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        }`}
      >
        <Link
          href="/"
          className={`font-black tracking-tight text-white transition-[font-size] duration-300 ${
            isScrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"
          }`}
        >
          V-Mail
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
          <button
            type="button"
            className="border-b-2 border-[#b4c5ff] pb-1 text-[#b4c5ff]"
            onClick={() => {
              const el = document.getElementById("validator-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Features
          </button>
          <button
            type="button"
            className="transition-colors hover:text-white"
            onClick={() => {
              const el = document.getElementById("validator-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Cómo funciona
          </button>
        </div>
      </nav>
    </header>
  );
}

