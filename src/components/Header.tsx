import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logoClub from "../assets/logo-vy-handball.jpeg";
import { useCartStore } from "../store/cartStore";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/evenements", label: "Événements" },
  { to: "/matchs", label: "Matchs" },
  { to: "/collectifs", label: "Collectifs" },
  { to: "/club", label: "Le Club" },
  { to: "/inscriptions", label: "Inscriptions" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { totalItems, toggleCart } = useCartStore();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/78 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-narrow flex items-center justify-between h-16 md:h-20 px-4 md:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 min-w-0 group" aria-label="Retour à l'accueil">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img src={logoClub} alt="Logo Val d'Yerres Handball" className="h-full w-full object-cover" width={40} height={40} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-black animate-glow-dot" />
          </div>
          <div className="min-w-0">
            <span className="block font-display text-sm font-extrabold uppercase tracking-[0.1em] leading-tight text-white">
              Val d'Yerres
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.22em] uppercase text-white">
              Handball
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => window.scrollTo({ top: 0 })}
              className={`relative px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                isActive(link.to)
                  ? "text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full"
                  style={{ background: "var(--gradient-accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + panier + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/inscriptions"
            className="hidden lg:flex btn-primary !py-2 !px-5 !text-xs"
          >
            S'inscrire
          </Link>

          {/* Icône panier */}
          <button
            onClick={toggleCart}
            className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
            aria-label="Ouvrir le panier"
          >
            <ShoppingCart size={20} />
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {totalItems()}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-white/[0.06] bg-black/92 backdrop-blur-2xl"
            aria-label="Navigation mobile"
          >
            <div className="px-4 py-5 flex flex-col gap-1.5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.18 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => {
                      setMenuOpen(false);
                      setTimeout(() => {
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
                      }, 50);
                    }}
                    className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive(link.to)
                        ? "bg-orange-500/12 text-orange-400 border border-orange-500/20"
                        : "text-white/65 hover:bg-white/[0.04] hover:text-white border border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <Link
                  to="/inscriptions"
                  onClick={() => {
                    setMenuOpen(false);
                    setTimeout(() => {
                      document.documentElement.scrollTop = 0;
                      document.body.scrollTop = 0;
                      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
                    }, 50);
                  }}
                  className="btn-primary w-full justify-center text-sm py-3"
                >
                  S'inscrire au club
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
