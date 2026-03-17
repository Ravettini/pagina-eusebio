export function Footer() {
  return (
    <footer className="border-t border-[#434655]/40 bg-[#131313] py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-lg font-semibold text-white">V-Mail Validator</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <a
            href="#"
            className="transition-colors hover:text-[#7bd0ff]"
          >
            Support
          </a>
          <a
            href="#"
            className="transition-colors hover:text-[#7bd0ff]"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="transition-colors hover:text-[#7bd0ff]"
          >
            Terms of Service
          </a>
        </div>
        <p className="text-[11px] text-white/80">
          © {new Date().getFullYear()} V-Mail Validator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


