import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarX, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EvenementCard, type Evenement } from "@/components/EvenementCard";

// ── Skeleton card ─────────────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div className="glass-premium rounded-3xl overflow-hidden border border-white/[0.08]">
      <div className="h-1 w-full bg-white/[0.06]" />
      <div className="p-8 md:p-10 space-y-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const Events = () => {
  const { hash } = useLocation();
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    fetch(
      `${url}/rest/v1/evenements?actif=eq.true&or=(expire_le.is.null,expire_le.gte.${today})&order=ordre.asc,date_debut.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Array<Evenement & { publie_le?: string | null }>) => {
        const filtered = data.filter((ev) => !ev.publie_le || ev.publie_le <= today);
        setEvents(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hash || loading) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        const offset = 120; // navbar + ticker
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }, 100);
    }
  }, [hash, loading]);

  return (
    <>
      {/* Page Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[420px] h-[420px] bg-emerald-600/10 top-[-100px] right-[-80px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[280px] h-[280px] bg-orange-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "18s", animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Événements <span className="gradient-text">&amp; Actus</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Events list */}
      <section className="pb-24">
        <div className="container-narrow px-4 md:px-6 max-w-4xl space-y-6">

          {loading && (
            <>
              <EventSkeleton />
              <EventSkeleton />
            </>
          )}

          {!loading && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium rounded-3xl p-16 text-center border border-white/[0.06]"
            >
              <CalendarX size={36} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/50 font-display font-bold text-lg mb-1">
                Aucun événement en cours
              </p>
              <p className="text-white/30 text-sm">
                Revenez bientôt — de nouveaux événements seront annoncés prochainement.
              </p>
            </motion.div>
          )}

          {!loading && events.map((ev, i) => (
            <EvenementCard key={ev.id} ev={ev} index={i} />
          ))}

          {/* Bottom CTA */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl p-10 text-center overflow-hidden border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-orange-600/[0.08] blur-3xl pointer-events-none" />
              <Clock size={28} className="text-orange-400 mx-auto mb-4" />
              <h3 className="font-display font-black text-white text-xl mb-3">
                Un événement à proposer ?
              </h3>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Tournoi, initiative solidaire ou soirée club — contactez-nous pour en discuter.
              </p>
              <Link to="/contact" className="btn-primary gap-2">
                Nous contacter <ArrowRight size={15} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;
