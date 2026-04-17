import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logoClub from "../assets/logo-vy-handball.jpeg";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/club", label: "Le Club" },
  { to: "/collectifs", label: "Nos Collectifs" },
  { to: "/partenaires", label: "Partenaires" },
  { to: "/inscriptions", label: "Inscriptions" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 site-header-glass">
      <div className="container-narrow flex items-center justify-between h-16 md:h-20 px-4">
        <Link
          to="/"
          className="flex items-center gap-3 min-w-0"
          aria-label="Retour à l'accueil"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/30 shadow-md shrink-0">
            <img
              src={logoClub}
              alt="Logo Val d'Yerres Handball"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="hidden sm:block min-w-0">
            <span className="block font-display text-sm md:text-base font-extrabold uppercase tracking-[0.08em] text-white leading-tight truncate">
              Val d'Yerres
            </span>
            <span className="block text-[11px] md:text-xs font-medium text-white/65 tracking-[0.16em] uppercase truncate">
              Handball Club
            </span>
          </div>
        </Link>

        <nav
          className="hidden lg:flex items-center gap-0.5"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                isActive(link.to)
                  ? "text-white bg-white/6"
                  : "text-white/78 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute left-2.5 right-2.5 -bottom-[2px] h-[2px] rounded-full bg-orange-500" />
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/10 bg-black/85 backdrop-blur-xl"
            aria-label="Navigation mobile"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ${
                    isActive(link.to)
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                      : "text-white/80 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
