// ✅ COLE EM: src/pages/Planos.jsx  (garante que "Ver planos" não dá erro)
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ORANGE = "#FF6A00";
const TEXT = "#0f172a";
const MUTED = "#64748b";

export default function Planos() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || "anon").toLowerCase();

  const paid = useMemo(() => localStorage.getItem(`paid_${email}`) === "1", [email]);

  function activateBasic() {
    // SIMULA pagamento do básico (depois troca por Stripe)
    localStorage.setItem(`paid_${email}`, "1");
    const paymentsKey = `payments_${email}`;
    const raw = localStorage.getItem(paymentsKey);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      id: String(Date.now()),
      plan: "Básico",
      price: 12.99,
      at: Date.now(),
      note: "Recorrente (simulado)",
    });
    localStorage.setItem(paymentsKey, JSON.stringify(list.slice(0, 50)));
    nav("/treino");
  }

  return (
    <div className="container page" style={styles.page}>
      <div style={styles.header}>
        <div style={styles.kicker}>Planos</div>
        <div style={styles.title}>Escolha seu acesso</div>
        <div style={styles.sub}>
          Pagamento recorrente e automático. Você pode cancelar quando quiser.
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tag}>BÁSICO</div>
        <div style={styles.cardTitle}>Treinos personalizados</div>
        <div style={styles.price}>R$ 12,99/mês</div>
        <ul style={styles.ul}>
          <li>Treino do dia + “em casa”</li>
          <li>Consistência (streak) e frequência</li>
          <li>Estimativa de calorias por treino</li>
        </ul>
        <button style={styles.primary} onClick={activateBasic}>
          Assinar agora
        </button>
      </div>

      <div style={styles.cardSoft}>
        <div style={styles.tagSoft}>NUTRI+</div>
        <div style={styles.cardTitle}>Nutrição + Treino (upgrade)</div>
        <div style={styles.price}>R$ 65,99/mês</div>
        <div style={styles.note}>
          Em breve: cardápios rotativos (42 refeições), lista de compras e hidratação.
        </div>
        <button style={styles.secondary} onClick={() => nav("/nutricao")}>
          Ver área de nutrição
        </button>
      </div>

      <button style={styles.back} onClick={() => nav("/dashboard")}>
        Voltar
      </button>

      {paid ? <div style={styles.paidHint}>Você já tem o Básico ativo.</div> : null}
    </div>
  );
}

const styles = {
  page: { padding: 18, paddingBottom: 120, background: "#f8fafc" },
  header: { marginTop: 6, marginBottom: 14 },
  kicker: { fontSize: 13, fontWeight: 950, color: MUTED },
  title: { fontSize: 30, fontWeight: 950, color: TEXT, letterSpacing: -0.7, lineHeight: 1.05 },
  sub: { marginTop: 8, fontSize: 13, color: MUTED, fontWeight: 700, lineHeight: 1.35 },

  card: {
    borderRadius: 24,
    padding: 18,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 16px 46px rgba(15,23,42,.08)",
  },
  cardSoft: {
    marginTop: 12,
    borderRadius: 24,
    padding: 18,
    background: "linear-gradient(135deg, rgba(255,106,0,.10), rgba(15,23,42,.03))",
    border: "1px solid rgba(15,23,42,.06)",
  },
  tag: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,106,0,.12)",
    border: "1px solid rgba(255,106,0,.24)",
    color: ORANGE,
    fontWeight: 950,
    fontSize: 12,
  },
  tagSoft: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(15,23,42,.06)",
    border: "1px solid rgba(15,23,42,.10)",
    color: TEXT,
    fontWeight: 950,
    fontSize: 12,
  },
  cardTitle: { marginTop: 12, fontSize: 18, fontWeight: 950, color: TEXT },
  price: { marginTop: 8, fontSize: 26, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },
  ul: { marginTop: 10, paddingLeft: 16, color: "#334155", fontWeight: 750, lineHeight: 1.55, fontSize: 13 },
  note: { marginTop: 10, color: "#334155", fontWeight: 750, lineHeight: 1.5, fontSize: 13 },

  primary: {
    marginTop: 14,
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #FF6A00, #FF8A3D)",
    color: "#111",
    fontWeight: 950,
    boxShadow: "0 16px 40px rgba(255,106,0,.28)",
  },
  secondary: {
    marginTop: 14,
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,106,0,.30)",
    background: "rgba(255,106,0,.12)",
    color: TEXT,
    fontWeight: 950,
  },

  back: {
    marginTop: 14,
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,.10)",
    background: "#fff",
    color: TEXT,
    fontWeight: 950,
  },
  paidHint: { marginTop: 10, textAlign: "center", color: MUTED, fontWeight: 800, fontSize: 12 },
};
