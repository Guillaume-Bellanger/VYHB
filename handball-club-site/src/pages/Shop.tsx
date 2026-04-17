import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

const Shop = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-4xl md:text-5xl mb-4"
        >
          Boutique
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Équipez-vous aux couleurs du Val d'Yerres HB.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-sport p-12 flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-accent" />
          </div>
          <h2 className="font-display font-black text-2xl text-foreground mb-4">
            Boutique en cours de création
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Notre boutique en ligne arrive bientôt ! Maillots, vêtements et accessoires aux couleurs du club seront disponibles prochainement.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            En attendant, contactez-nous directement pour toute commande de maillot ou d'équipement.
          </p>
          <Link to="/contact" className="btn-primary">
            Nous contacter <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  </>
);

export default Shop;
