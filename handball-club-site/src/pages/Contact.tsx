import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl mb-4">
          Contact
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Une question ? N'hésitez pas à nous écrire ou à passer nous voir.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-black text-2xl text-foreground mb-6">Coordonnées</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="text-accent shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-medium text-foreground">Adresse</p>
                  <p className="text-sm text-muted-foreground">Gymnase Municipal<br />12 Rue du Sport<br />75000 Paris</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-accent shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-medium text-foreground">Téléphone</p>
                  <a href="tel:+33123456789" className="text-sm text-muted-foreground hover:text-accent transition-colors">01 23 45 67 89</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-accent shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:contact@handball-club.fr" className="text-sm text-muted-foreground hover:text-accent transition-colors">contact@handball-club.fr</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-accent shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-medium text-foreground">Horaires du secrétariat</p>
                  <p className="text-sm text-muted-foreground">Mardi : 18h – 20h<br />Jeudi : 18h – 20h<br />Samedi : 10h – 12h</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display font-black text-2xl text-foreground mb-6">Envoyez-nous un message</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "mailto:contact@handball-club.fr";
              }}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Nom</label>
                <input id="name" type="text" required className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input id="email" type="email" required className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea id="message" rows={5} required className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Contact;
