import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const partnersList = [
  { name: "Mairie de Paris", type: "Institutionnel", desc: "Soutien aux infrastructures et aux événements sportifs." },
  { name: "Région Île-de-France", type: "Institutionnel", desc: "Subventions pour la formation des jeunes." },
  { name: "Décathlon", type: "Équipementier", desc: "Équipement sportif pour les équipes jeunes." },
  { name: "Crédit Mutuel", type: "Sponsor principal", desc: "Partenaire historique depuis 2010." },
  { name: "Hummel", type: "Équipementier", desc: "Maillots officiels du club." },
  { name: "Select", type: "Fournisseur", desc: "Ballons officiels pour les entraînements et matchs." },
  { name: "Boulangerie du Centre", type: "Commerce local", desc: "Partenaire fidèle du club depuis 2018." },
  { name: "Garage Martin", type: "Commerce local", desc: "Sponsor maillot des -18 garçons." },
];

const Partners = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl mb-4">
          Nos Partenaires
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Ils nous accompagnent et rendent possible notre aventure sportive.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnersList.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-sport p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center font-display font-black text-xl text-muted-foreground">
                {p.name.charAt(0)}
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{p.name}</h3>
              <span className="inline-block text-xs text-accent font-display font-bold uppercase mb-2">{p.type}</span>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-muted/50">
      <div className="container-narrow text-center">
        <h2 className="font-display font-black text-2xl md:text-3xl text-foreground mb-4">
          Devenir partenaire ?
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Associez votre image à un club dynamique et engagé. Plusieurs formules de partenariat sont disponibles.
        </p>
        <Link to="/contact" className="btn-primary">
          Contactez-nous <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </>
);

export default Partners;
