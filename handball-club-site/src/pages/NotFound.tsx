import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => (
  <section className="min-h-[80vh] flex items-center justify-center section-padding">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="font-display font-black text-8xl md:text-9xl gradient-text mb-4">404</div>
      <h1 className="font-display font-bold text-2xl text-foreground mb-2">Page introuvable</h1>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Cette page n'existe pas ou a été déplacée. Retournez sur le terrain !
      </p>
      <Link to="/" className="btn-primary">
        <Home size={16} />
        Retour à l'accueil
      </Link>
    </motion.div>
  </section>
);

export default NotFound;
