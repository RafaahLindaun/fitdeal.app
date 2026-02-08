// ✅ COLE/ATUALIZE EM: src/pages/Nutricao.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ORANGE = "#FF6A00";
const BG = "#f8fafc";
const TEXT = "#0f172a";
const MUTED = "#64748b";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildDayMeals(seedKey) {
  // ✅ bem simples: 2 opções de cada refeição por dia + muda diariamente
  // (depois a gente coloca banco grande com 42 refeições)
  const bank = {
    cafe: [
      { t: "Ovos + pão + fruta", d: "2 ovos, 1 pão, 1 fruta, café sem açúcar." },
      { t: "Iogurte + aveia", d: "Iogurte natural, aveia, banana e canela." },
      { t: "Vitamina rápida", d: "Leite, banana, aveia e pasta de amendoim." },
      { t: "Tapioca + queijo", d: "Tapioca com queijo + 1 fruta." },
    ],
    almoco: [
      { t: "Arroz + feijão + frango", d: "Prato base: arroz, feijão, frango e salada." },
      { t: "Macarrão + carne", d: "Macarrão simples + carne magra + salada." },
      { t: "Omelete completo", d: "Omelete 3 ovos + arroz + salada." },
      { t: "Frango + batata", d: "Frango grelhado + batata + legumes." },
    ],
    janta: [
      { t: "Janta leve", d: "Ovos mexidos + salada + pão." },
      { t: "Arroz + frango", d: "Arroz + frango + salada (porção moderada)." },
      { t: "Sanduíche proteico", d: "Pão + frango desfiado/ovo + salada." },
      { t: "Iogurte + fruta", d: "Iogurte + fruta + aveia (se for tarde)." },
    ],
  };

  // pseudo-random determinístico por dia
  let h = 0;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  const pick2 = (arr) => {
    const a = arr[h % arr.length];
    const b = arr[(h + 2) % arr.length];
    return [a, b];
  };

  return {
    cafe: pick2(bank.cafe),
    almoco: pick2(bank.almoco),
    janta: pick2(bank.janta),
  };
}

export default function Nutricao() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || "anon").toLowerCase();

  const hasNutriPlus = localStorage.getItem(`nutri_plus_${email}`) === "1";

  // ✅ botão flutuante SEMPRE aparece pra quem NÃO tem Nutri+
  const showFab = !hasNutriPlus;

  // opções Nutri+ (pago)
  const [opt, setOpt] = useState("op1"); // "op1" | "op2"

  const seed = `${todayKey()}_${email}_${opt}`;
  const meals = useMemo(() => buildDayMeals(seed), [seed]);

  const doneKey = `nutri_done_${email}_${todayKey()}_${opt}`;
  const [done, setDone] = useState(() => localStorage.getItem(doneKey) === "1");

  function markDone() {
    localStorage.setItem(doneKey, "1");
    setDone(true);
  }

  function moreOptions() {
    // troca opt pra “renovar” na hora
    setOpt((p) => (p === "op1" ? "op2" : "op1"));
    localStorage.removeItem(doneKey);
    setDone(false);
  }

  return (
    <div style={styles.page}>
      {!hasNutriPlus ? (
        <div style={styles.lockWrap}>
          <div style={styles.icon}>🍴</div>
          <div style={styles.lockTitle}>Planos de Nutrição</div>
          <div style={styles.lockText}>Em breve você terá acesso a planos alimentares personalizados</div>
        </div>
      ) : (
        <>
          <div style={styles.header}>
            <div style={styles.hTitle}>Nutrição</div>
            <div style={styles.hSub}>Seja bem vindo a área de nutrição</div>

            <div style={styles.optRow}>
              <button
                onClick={() => setOpt("op1")}
                style={{ ...styles.optBtn, ...(opt === "op1" ? styles.optActive : styles.optInactive) }}
              >
                Opção 1
              </button>
              <button
                onClick={() => setOpt("op2")}
                style={{ ...styles.optBtn, ...(opt === "op2" ? styles.optActive : styles.optInactive) }}
              >
                Opção 2
              </button>
            </div>
          </div>

          <div style={styles.mealCard}>
            <div style={styles.mealTitle}>Café da manhã</div>
            {meals.cafe.map((m, i) => (
              <Meal key={`c${i}`} title={m.t} desc={m.d} />
            ))}
          </div>

          <div style={styles.mealCard}>
            <div style={styles.mealTitle}>Almoço</div>
            {meals.almoco.map((m, i) => (
              <Meal key={`a${i}`} title={m.t} desc={m.d} />
            ))}
          </div>

          <div style={styles.mealCard}>
            <div style={styles.mealTitle}>Janta</div>
            {meals.janta.map((m, i) => (
              <Meal key={`j${i}`} title={m.t} desc={m.d} />
            ))}
          </div>

          <div style={styles.actions}>
            <button style={done ? styles.doneBtnOn : styles.doneBtn} onClick={markDone}>
              {done ? "Concluído 🙂" : "Concluído"}
            </button>
            <button style={styles.moreBtn} onClick={moreOptions}>
              Receber mais opções
            </button>
          </div>

          <div style={styles.footerMsg}>
            <b>42 refeições pra você.</b> A cada dia mudamos suas refeições — você merece o melhor todos os dias.
          </div>
        </>
      )}

      {showFab ? (
        <button style={styles.fab} onClick={() => nav("/nutri-plus")}>
          Plano Nutri+
        </button>
      ) : null}
    </div>
  );
}

function Meal({ title, desc }) {
  return (
    <div style={styles.mealItem}>
      <div style={styles.dot} />
      <div style={{ minWidth: 0 }}>
        <div style={styles.mealItemTitle}>{title}</div>
        <div style={styles.mealItemDesc}>{desc}</div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 18, paddingBottom: 120, background: BG },

  lockWrap: {
    marginTop: 36,
    borderRadius: 22,
    padding: 22,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
    textAlign: "center",
  },
  icon: { fontSize: 34, marginBottom: 10 },
  lockTitle: { fontSize: 18, fontWeight: 950, color: TEXT },
  lockText: { marginTop: 6, fontSize: 13, color: MUTED, fontWeight: 700, lineHeight: 1.35 },

  header: {
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  hTitle: { fontSize: 24, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },
  hSub: { marginTop: 6, fontSize: 13, color: MUTED, fontWeight: 800 },

  optRow: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  optBtn: {
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,.10)",
    fontWeight: 950,
    transition: "transform .12s ease",
  },
  optActive: { background: "rgba(255,106,0,.12)", borderColor: "rgba(255,106,0,.35)", color: ORANGE },
  optInactive: { background: "#fff", color: TEXT },

  mealCard: {
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  mealTitle: { fontSize: 16, fontWeight: 950, color: TEXT, marginBottom: 10 },
  mealItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 18,
    background: "rgba(15,23,42,.03)",
    border: "1px solid rgba(15,23,42,.06)",
    marginTop: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 999, background: ORANGE, marginTop: 4, flexShrink: 0 },
  mealItemTitle: { fontSize: 14, fontWeight: 950, color: TEXT, lineHeight: 1.2 },
  mealItemDesc: { marginTop: 4, fontSize: 12, fontWeight: 700, color: MUTED, lineHeight: 1.35 },

  actions: { marginTop: 12, display: "grid", gap: 10 },
  doneBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: ORANGE,
    color: "#111",
    fontWeight: 950,
    boxShadow: "0 18px 45px rgba(255,106,0,.22)",
  },
  doneBtnOn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: "rgba(255,106,0,.18)",
    color: TEXT,
    fontWeight: 950,
  },
  moreBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,.10)",
    background: "#fff",
    color: TEXT,
    fontWeight: 950,
  },

  footerMsg: { marginTop: 12, fontSize: 12, color: MUTED, fontWeight: 700, lineHeight: 1.35 },

  fab: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: 86,
    zIndex: 999,
    padding: "14px 18px",
    borderRadius: 999,
    border: "none",
    background: ORANGE,
    color: "#111",
    fontWeight: 950,
    boxShadow: "0 18px 45px rgba(255,106,0,.28)",
  },
};
