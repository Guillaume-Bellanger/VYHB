import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";

const coordonnees = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "06 75 26 43 58",
    sub: "Président du club",
    href: "tel:+33675264358",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/15",
  },
  {
    icon: Mail,
    label: "Email",
    value: "vyhandball@gmail.com",
    sub: "Réponse sous 48h",
    href: "mailto:vyhandball@gmail.com",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/15",
  },
  {
    icon: MapPin,
    label: "Gymnase",
    value: "Gymnase Municipal",
    sub: "Boussy-Saint-Antoine",
    href: null,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/15",
  },
];

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    window.location.href = `mailto:vyhandball@gmail.com?subject=Contact site - ${encodeURIComponent(name)}&body=${encodeURIComponent(`De: ${name} (${email})\n\n${message}`)}`;
    setSent(true);
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Contactez le Val d'Yerres Handball — Tél. 06 75 26 43 58 · vyhandball@gmail.com. Inscriptions, renseignements, partenariat. Réponse sous 48h."
        canonical="/contact"
        breadcrumb={[
          { name: "Accueil", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      {/* Page Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[400px] h-[400px] bg-blue-600/10 top-[-100px] right-[-80px]" style={{ animationDuration: "15s" }} />
        <div className="hero-orb w-[280px] h-[280px] bg-orange-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "19s", animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Nous <span className="gradient-text">Contacter</span>
            </h1>
            <p className="text-white/45 text-lg max-w-2xl leading-relaxed mx-auto">
              Une question ? N'hésitez pas à nous écrire ou à nous appeler.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container-narrow px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Coordonnées */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display font-black text-2xl text-white mb-8 text-center">Coordonnées</h2>
              <div className="space-y-4">
                {coordonnees.map((item, i) => {
                  const Icon = item.icon;
                  const content = (
                    <div
                      className={`glass-premium rounded-2xl p-5 flex items-start gap-4 border ${item.border} hover:border-opacity-40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] group cursor-pointer`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={20} className={item.accent} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-white/30 uppercase tracking-[0.18em] font-display font-semibold mb-0.5">{item.label}</p>
                        <p className={`font-display font-bold text-sm text-white group-hover:${item.accent} transition-colors`}>{item.value}</p>
                        <p className="text-xs text-white/35 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  );
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      {item.href ? (
                        <a href={item.href}>{content}</a>
                      ) : (
                        content
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="font-display font-black text-2xl text-white mb-8 text-center">Envoyer un message</h2>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-premium rounded-2xl p-12 flex flex-col items-center text-center border border-emerald-500/20"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="font-display font-black text-xl text-white mb-2">Message préparé !</h3>
                  <p className="text-white/45 text-sm leading-relaxed">
                    Votre client mail va s'ouvrir. Envoyez votre message depuis votre messagerie habituelle.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-display font-bold text-white/40 uppercase tracking-[0.16em] mb-2">
                      Nom complet
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-display font-bold text-white/40 uppercase tracking-[0.16em] mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="jean@email.com"
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-display font-bold text-white/40 uppercase tracking-[0.16em] mb-2">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <option value="inscription" style={{ background: "hsl(220 22% 10%)" }}>Inscription / Essai gratuit</option>
                      <option value="info" style={{ background: "hsl(220 22% 10%)" }}>Renseignements généraux</option>
                      <option value="partenariat" style={{ background: "hsl(220 22% 10%)" }}>Partenariat</option>
                      <option value="autre" style={{ background: "hsl(220 22% 10%)" }}>Autre</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs font-display font-bold text-white/40 uppercase tracking-[0.16em] mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="Votre message..."
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full justify-center gap-2"
                  >
                    <Send size={16} />
                    Envoyer le message
                  </button>
                  <p className="text-xs text-white/25 text-center">
                    Votre client mail s'ouvrira. Aucune donnée n'est stockée.
                  </p>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
