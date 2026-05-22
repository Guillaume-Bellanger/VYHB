import { useEffect, useState } from "react";

const FALLBACK_MESSAGES = [
  "RECRUTEMENT OUVERT 2026/2027",
  "PORTES OUVERTES MAI 2026",
  "REJOIGNEZ LA FAMILLE",
  "ESSAI GRATUIT",
  "VAL D'YERRES HANDBALL",
];

interface TickerMessage {
  message: string;
  ordre: number;
}

export default function Ticker() {
  const [messages, setMessages] = useState<string[]>(FALLBACK_MESSAGES);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    fetch(`${url}/rest/v1/ticker_messages?actif=eq.true&order=ordre`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TickerMessage[]) => {
        if (data.length > 0) setMessages(data.map((m) => m.message));
      })
      .catch(() => {});
  }, []);

  const tickerText = messages.join("  •  ") + "  •  ";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-8 flex items-center overflow-hidden border-b border-white/[0.05]"
      style={{ background: "hsl(0 0% 0% / 0.88)", backdropFilter: "blur(8px)" }}
      aria-hidden="true"
    >
      <div className="flex">
        <span className="animate-ticker text-[11px] font-display font-bold uppercase tracking-[0.18em] text-orange-400 whitespace-nowrap">
          {tickerText.repeat(8)}
        </span>
      </div>
    </div>
  );
}
