import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types & helpers ───────────────────────────────────────────────────────────

interface TickerMessage {
  id: string;
  message: string;
  actif: boolean;
  ordre: number;
}

function tickerHeaders(): Record<string, string> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  let token = key;
  try {
    const ref = new URL(url).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (raw) {
      const s = JSON.parse(raw) as { access_token?: string };
      token = s.access_token ?? key;
    }
  } catch {}
  return { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function tickerUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TickerPage() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [adding, setAdding] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(tickerUrl("ticker_messages?order=ordre"), {
        headers: tickerHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessages(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function handleAdd() {
    if (!newMsg.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const maxOrdre = messages.reduce((m, n) => Math.max(m, n.ordre), 0);
      const res = await fetch(tickerUrl("ticker_messages"), {
        method: "POST",
        headers: { ...tickerHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ message: newMsg.trim(), ordre: maxOrdre + 1, actif: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewMsg("");
      await loadMessages();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(msg: TickerMessage) {
    setError(null);
    try {
      const res = await fetch(tickerUrl(`ticker_messages?id=eq.${msg.id}`), {
        method: "PATCH",
        headers: { ...tickerHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ actif: !msg.actif }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadMessages();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(tickerUrl(`ticker_messages?id=eq.${id}`), {
        method: "DELETE",
        headers: { ...tickerHeaders(), Prefer: "return=minimal" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadMessages();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleMove(msg: TickerMessage, direction: "up" | "down") {
    const idx = messages.findIndex((m) => m.id === msg.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= messages.length) return;
    const other = messages[targetIdx];
    setError(null);
    try {
      await Promise.all([
        fetch(tickerUrl(`ticker_messages?id=eq.${msg.id}`), {
          method: "PATCH",
          headers: { ...tickerHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({ ordre: other.ordre }),
        }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); }),
        fetch(tickerUrl(`ticker_messages?id=eq.${other.id}`), {
          method: "PATCH",
          headers: { ...tickerHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({ ordre: msg.ordre }),
        }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); }),
      ]);
      await loadMessages();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-black text-white">Ticker</h1>
        <p className="text-white/40 text-sm mt-1">
          Messages défilants affichés en bandeau sur toutes les pages.
        </p>
      </div>

      {/* Ajouter un message */}
      <div className="flex gap-2 mb-8">
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="TOURNOI ÉTÉ 2026"
          className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 flex-1 font-display font-bold uppercase tracking-wide"
        />
        <Button
          onClick={handleAdd}
          disabled={adding || !newMsg.trim()}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2 shrink-0"
        >
          {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Ajouter
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center text-white/25 py-10 text-sm">Aucun message configuré.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                msg.actif
                  ? "bg-white/[0.04] border-white/[0.08]"
                  : "bg-white/[0.01] border-white/[0.04] opacity-45"
              }`}
            >
              {/* Boutons ordre ↑↓ */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => handleMove(msg, "up")}
                  disabled={i === 0}
                  className="p-0.5 rounded text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Monter"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(msg, "down")}
                  disabled={i === messages.length - 1}
                  className="p-0.5 rounded text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Descendre"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Numéro ordre */}
              <span className="text-white/20 text-xs tabular-nums w-4 text-right shrink-0">
                {msg.ordre}
              </span>

              {/* Message */}
              <span className={`flex-1 text-sm font-display font-bold uppercase tracking-wide truncate ${
                msg.actif ? "text-orange-400" : "text-white/30"
              }`}>
                {msg.message}
              </span>

              {/* Toggle actif/inactif */}
              <button
                onClick={() => handleToggle(msg)}
                className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  msg.actif
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                    : "bg-white/[0.05] text-white/30 border-white/[0.10] hover:bg-white/10 hover:text-white/50"
                }`}
              >
                {msg.actif ? "Actif" : "Inactif"}
              </button>

              {/* Supprimer */}
              <button
                onClick={() => handleDelete(msg.id)}
                className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                aria-label="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Les messages inactifs ne s'affichent pas sur le site public. Modifications immédiates.
      </p>
    </div>
  );
}
