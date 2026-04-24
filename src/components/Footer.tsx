import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import logoClub from "../assets/logo-vy-handball.jpeg";

const footerNav = [
  { to: "/club", label: "Le Club" },
  { to: "/collectifs", label: "Nos Collectifs" },
  { to: "/inscriptions", label: "Inscriptions" },
  { to: "/boutique", label: "Boutique" },
  { to: "/partenaires", label: "Partenaires" },
  { to: "/contact", label: "Contact" },
];

const Footer = () => (
  <footer className="relative overflow-hidden" style={{ background: "hsl(220 30% 4%)" }}>

    {/* Top accent line */}
    <div className="h-px w-full" style={{ background: "var(--gradient-accent)" }} />

    {/* Ambient orb */}
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-600/[0.045] blur-3xl pointer-events-none" />

    <div className="container-narrow px-4 md:px-6 pt-14 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

        {/* Brand */}
        <div className="lg:col-span-2 flex flex-col items-center text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shadow-lg transition-all duration-300 group-hover:border-orange-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] shrink-0">
              <img
                src={logoClub}
                alt="Logo Val d'Yerres Handball"
                className="w-full h-full object-cover"
                width={44}
                height={44}
              />
            </div>
            <div>
              <span className="block font-display font-black text-base text-white leading-tight">
                Val d'Yerres Handball
              </span>
            </div>
          </Link>

          <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
            Plus qu'un club, une famille. 245 licenciés, 10 équipes, 23 ans de passion dans la vallée de l'Yerres.
          </p>

          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border"
            style={{
              background: "hsl(18 100% 55% / 0.08)",
              borderColor: "hsl(18 100% 55% / 0.2)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[11px] font-display font-bold text-orange-400 uppercase tracking-wider">
              Saison 2026/2027 ouverte
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col items-center text-center">
          <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white/25 mb-5">
            Navigation
          </h4>
          <ul className="space-y-3">
            {footerNav.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/45 hover:text-orange-400 transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center text-center">
          <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white/25 mb-5">
            Contact
          </h4>
          <ul className="space-y-5">
            <li>
              <a
                href="tel:+33675264358"
                className="flex flex-col items-center gap-1.5 text-sm text-white/45 hover:text-orange-400 transition-colors duration-200 group cursor-pointer"
              >
                <Phone size={15} className="shrink-0" />
                <div>
                  <div className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-0.5">Président</div>
                  <span>06 75 26 43 58</span>
                </div>
              </a>
            </li>
            <li>
              <a
                href="mailto:vyhandball@gmail.com"
                className="flex flex-col items-center gap-1.5 text-sm text-white/45 hover:text-orange-400 transition-colors duration-200 group cursor-pointer"
              >
                <Mail size={15} className="shrink-0" />
                <div>
                  <div className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-0.5">Email</div>
                  <span>vyhandball@gmail.com</span>
                </div>
              </a>
            </li>
            <li className="flex flex-col items-center gap-1.5 text-sm text-white/35">
              <MapPin size={15} className="shrink-0" />
              <div>
                <div className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-0.5">Gymnase</div>
                <span>Gymnase Municipal<br />Boussy-Saint-Antoine</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-white/[0.06] flex flex-col items-center gap-4">
        <p className="text-xs text-white/20">
          © {new Date().getFullYear()} Val d'Yerres Handball. Tous droits réservés.
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/mentions-legales"
            className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200"
          >
            Mentions légales
          </Link>
          <a
            href="https://www.helloasso.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-orange-400 transition-colors duration-200 inline-flex items-center gap-1"
          >
            HelloAsso
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
