import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container-narrow section-padding !py-12 md:!py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-black text-accent-foreground text-lg">
              HB
            </div>
            <span className="font-display font-bold text-lg">Val d'Yerres HB</span>
          </div>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Plus qu'un club, une famille. Rejoignez-nous et vivez la passion du handball.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-accent">
            Navigation
          </h4>
          <ul className="space-y-2">
            {[
              { to: "/club", label: "Le Club" },
              { to: "/collectifs", label: "Nos Collectifs" },
              { to: "/inscriptions", label: "Inscriptions" },
              { to: "/boutique", label: "Boutique" },
              { to: "/partenaires", label: "Partenaires" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-accent">
            Contact
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-primary-foreground/60">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>Gymnase Municipal<br />Val d'Yerres</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <Phone size={16} className="shrink-0" />
              <a href="tel:+33123456789" className="hover:text-accent transition-colors">Président : 01 23 45 67 89</a>
            </li>
            <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <Mail size={16} className="shrink-0" />
              <a href="mailto:contact@vyhb.fr" className="hover:text-accent transition-colors">
                contact@vyhb.fr
              </a>
            </li>
          </ul>
        </div>

        {/* Horaires */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4 text-accent">
            Horaires du secrétariat
          </h4>
          <ul className="space-y-1 text-sm text-primary-foreground/60">
            <li>Mardi : 18h – 20h</li>
            <li>Jeudi : 18h – 20h</li>
            <li>Samedi : 10h – 12h</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Val d'Yerres Handball Club. Tous droits réservés.
        </p>
        <Link
          to="/mentions-legales"
          className="text-xs text-primary-foreground/40 hover:text-accent transition-colors"
        >
          Mentions légales
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
