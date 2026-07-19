import type { ReactElement } from "react";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

export function Footer(): ReactElement {
  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Karnataka Hikes"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <span className="font-bold text-white text-lg">
                  Karnataka Hikes
                </span>
                <p className="text-stone-500 text-xs">Treks & Adventures</p>
              </div>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">
              Curated treks and outdoor adventures across India. From beginners
              to experienced trekkers, we have something for everyone.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <nav aria-label="Footer navigation" className="space-y-2">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm hover:text-emerald-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <p>info@karnatakahikes.com</p>
              <p>+91 98765 43210</p>
              <p>Bengaluru, Karnataka</p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-6 text-center text-sm text-stone-600">
          &copy; {new Date().getFullYear()} Karnataka Hikes. All rights
          reserved.
        </div>
        <Link 
        className="border-t border-stone-800 mt-12 pt-6 text-center text-sm text-stone-600" 
        href="https://www.rockpaperpanda.com/">
          <p>Developed by RockPaperPanda</p>
        </Link>
      </div>
    </footer>
  );
}
