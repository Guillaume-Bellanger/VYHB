import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

const schedule = [
  { group: "Seniors Masculins 1", day: "Mardi & Jeudi", time: "20h00 – 22h00", location: "Gymnase Municipal – Salle A" },
  { group: "Seniors Masculins 2", day: "Lundi & Mercredi", time: "20h00 – 22h00", location: "Gymnase Municipal – Salle A" },
  { group: "Seniors Féminines 1", day: "Mardi & Jeudi", time: "19h00 – 21h00", location: "Gymnase Municipal – Salle B" },
  { group: "Seniors Féminines 2", day: "Lundi & Mercredi", time: "19h00 – 21h00", location: "Gymnase Municipal – Salle B" },
  { group: "-18 Garçons", day: "Mercredi & Vendredi", time: "17h00 – 19h00 / 18h00 – 20h00", location: "Gymnase Municipal – Salle A" },
  { group: "-18 Filles", day: "Mercredi & Vendredi", time: "15h00 – 17h00 / 17h00 – 19h00", location: "Gymnase Municipal – Salle B" },
  { group: "-16 Garçons / Filles", day: "Mercredi & Samedi", time: "14h00 – 16h00", location: "Gymnase Municipal – Salle B" },
  { group: "-14 / -12 Mixte", day: "Mercredi / Samedi", time: "13h00 – 15h00 / 10h00 – 12h00", location: "Gymnase Municipal – Salle A" },
  { group: "Baby Hand", day: "Samedi", time: "9h00 – 10h00", location: "Gymnase Municipal – Salle B" },
  { group: "Loisirs Adultes", day: "Vendredi", time: "20h00 – 22h00", location: "Gymnase Municipal – Salle A" },
];

const Schedule = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl mb-4">
          Entraînements & Horaires
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Retrouvez tous les créneaux d'entraînement pour la saison 2025-2026.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-sport p-5"
            >
              <h3 className="font-display font-bold text-foreground mb-3">{s.group}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-accent shrink-0" />
                  <span><strong className="text-foreground">{s.day}</strong> — {s.time}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>{s.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Schedule;
