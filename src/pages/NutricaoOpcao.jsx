// ✅ COLE EM: src/pages/NutricaoOpcao.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ORANGE = "#FF6A00";
const BG = "#f8fafc";
const TEXT = "#0f172a";
const MUTED = "#64748b";

function keyOfToday() {
  return new Date().toISOString().slice(0, 10);
}

function dayIndexFromDate(dateStr) {
  // base simples: soma dos dígitos + dia do mês -> 0..6 (estável por dia)
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const seed = day + month * 3;
  return seed % 7;
}

function getPaid(email) {
  return localStorage.getItem(`paid_${email}`) === "1";
}

/**
 * 42 refeições (7 dias * 6 refeições) — autoral, simples, sem copiar sites.
 * Cada dia tem: 2 cafés, 2 almoços, 2 jantas.
 * Opção 1 e 2 têm “estilo” diferente (mais simples vs mais variado).
 */
function buildWeeklyMenus(option) {
  const O = option === "2";

  const week = [
    {
      day: "Dia 1",
      cafes: [
        { title: O ? "Iogurte + banana + aveia" : "Ovos mexidos + pão", ing: ["2 ovos", "1 fatia pão", "1 fruta"], how: ["Mexa os ovos.", "Coma com pão e fruta."] },
        { title: O ? "Vitamina proteica" : "Café + pão com frango", ing: ["leite/água", "banana", "aveia", "opcional whey"], how: ["Bata tudo no liquidificador."] },
      ],
      almocos: [
        { title: O ? "Arroz + feijão + frango grelhado" : "Arroz + feijão + frango", ing: ["arroz", "feijão", "frango", "salada"], how: ["Monte o prato: base + proteína + salada."] },
        { title: O ? "Macarrão + carne moída + salada" : "Batata + frango + legumes", ing: ["macarrão/batata", "proteína", "legumes"], how: ["Cozinhe a base.", "Finalize com proteína e legumes."] },
      ],
      jantas: [
        { title: O ? "Omelete + salada" : "Omelete simples", ing: ["2–3 ovos", "tomate/cebola", "salada"], how: ["Bata ovos.", "Grelhe e finalize com salada."] },
        { title: O ? "Sanduíche de atum" : "Sanduíche de frango", ing: ["pão", "atum/frango", "folhas"], how: ["Misture a proteína.", "Monte e coma."] },
      ],
    },
    {
      day: "Dia 2",
      cafes: [
        { title: O ? "Pão + pasta de amendoim + fruta" : "Pão + ovo + fruta", ing: ["pão", "ovo/pasta", "fruta"], how: ["Monte e coma."] },
        { title: O ? "Panqueca de banana" : "Iogurte + granola", ing: ["banana", "ovo", "aveia (opcional)"], how: ["Amasse banana.", "Misture com ovo.", "Grelhe."] },
      ],
      almocos: [
        { title: O ? "Arroz + feijão + peixe" : "Arroz + feijão + frango", ing: ["arroz", "feijão", "peixe/frango", "salada"], how: ["Prato completo e simples."] },
        { title: O ? "Frango + quinoa + legumes" : "Carne + arroz + salada", ing: ["proteína", "carbo", "legumes"], how: ["Cozinhe e monte o prato."] },
      ],
      jantas: [
        { title: O ? "Sopa + proteína" : "Crepioca", ing: ["sopa", "frango desfiado (opcional)"], how: ["Aqueça a sopa.", "Adicione proteína."] },
        { title: O ? "Wrap de frango" : "Pão + ovos", ing: ["wrap/pão", "frango/ovo", "folhas"], how: ["Monte e finalize."] },
      ],
    },
    {
      day: "Dia 3",
      cafes: [
        { title: O ? "Overnight oats" : "Iogurte + fruta", ing: ["iogurte", "aveia", "fruta"], how: ["Misture e deixe 10–20 min.", "Coma."] },
        { title: O ? "Tapioca + queijo" : "Pão + queijo/ovo", ing: ["tapioca/pão", "queijo/ovo"], how: ["Prepare e coma."] },
      ],
      almocos: [
        { title: O ? "Arroz + feijão + frango + salada" : "Arroz + feijão + frango", ing: ["arroz", "feijão", "frango", "salada"], how: ["Monte o prato."] },
        { title: O ? "Strogonoff leve + arroz" : "Carne + batata + salada", ing: ["proteína", "base", "salada"], how: ["Prepare a proteína.", "Monte com base e salada."] },
      ],
      jantas: [
        { title: O ? "Ovos + legumes" : "Ovos + arroz", ing: ["ovos", "legumes"], how: ["Refogue legumes.", "Adicione ovos."] },
        { title: O ? "Iogurte + fruta (leve)" : "Sanduíche leve", ing: ["iogurte/fruta", "ou pão + proteína"], how: ["Escolha e mantenha leve."] },
      ],
    },
    {
      day: "Dia 4",
      cafes: [
        { title: O ? "Cuscuz + ovos" : "Ovos + pão", ing: ["cuscuz/pão", "ovos"], how: ["Cozinhe cuscuz.", "Sirva com ovos."] },
        { title: O ? "Vitamina de mamão" : "Banana + aveia", ing: ["mamão/banana", "leite/água", "aveia"], how: ["Bata tudo."] },
      ],
      almocos: [
        { title: O ? "Frango + arroz integral + legumes" : "Frango + arroz + salada", ing: ["frango", "arroz", "legumes"], how: ["Cozinhe e monte o prato."] },
        { title: O ? "Carne + feijão + salada" : "Ovos + arroz + salada", ing: ["proteína", "feijão/arroz", "salada"], how: ["Monte o prato."] },
      ],
      jantas: [
        { title: O ? "Tapioca + frango" : "Omelete", ing: ["tapioca", "frango/ovo"], how: ["Prepare e recheie."] },
        { title: O ? "Sopa + pão" : "Sanduíche", ing: ["sopa", "pão"], how: ["Aqueça e finalize."] },
      ],
    },
    {
      day: "Dia 5",
      cafes: [
        { title: O ? "Iogurte + mel + granola" : "Iogurte + fruta", ing: ["iogurte", "granola", "fruta"], how: ["Misture e coma."] },
        { title: O ? "Ovos + tapioca" : "Pão + ovos", ing: ["ovos", "tapioca/pão"], how: ["Prepare e coma."] },
      ],
      almocos: [
        { title: O ? "Arroz + feijão + carne" : "Arroz + feijão + frango", ing: ["arroz", "feijão", "proteína", "salada"], how: ["Monte o prato."] },
        { title: O ? "Macarrão + frango" : "Batata + carne", ing: ["base", "proteína", "salada"], how: ["Prepare e finalize."] },
      ],
      jantas: [
        { title: O ? "Omelete caprichada" : "Omelete simples", ing: ["ovos", "legumes"], how: ["Bata, grelhe, finalize."] },
        { title: O ? "Wrap + salada" : "Sanduíche leve", ing: ["wrap/pão", "proteína", "folhas"], how: ["Monte e coma."] },
      ],
    },
    {
      day: "Dia 6",
      cafes: [
        { title: O ? "Panqueca de aveia" : "Banana + ovos", ing: ["aveia", "ovo", "banana"], how: ["Misture.", "Grelhe."] },
        { title: O ? "Pão + queijo + fruta" : "Pão + frango", ing: ["pão", "queijo/frango", "fruta"], how: ["Monte."] },
      ],
      almocos: [
        { title: O ? "Frango + feijão + salada" : "Arroz + frango + salada", ing: ["proteína", "feijão/arroz", "salada"], how: ["Monte o prato."] },
        { title: O ? "Peixe + arroz + legumes" : "Carne + arroz + salada", ing: ["proteína", "arroz", "legumes"], how: ["Prepare e finalize."] },
      ],
      jantas: [
        { title: O ? "Sopa + ovos" : "Ovos + salada", ing: ["sopa/salada", "ovos"], how: ["Aqueça/misture e coma."] },
        { title: O ? "Iogurte + fruta (leve)" : "Sanduíche", ing: ["iogurte/fruta", "ou pão"], how: ["Escolha e finalize."] },
      ],
    },
    {
      day: "Dia 7",
      cafes: [
        { title: O ? "Tapioca + ovos" : "Ovos + pão", ing: ["tapioca/pão", "ovos"], how: ["Prepare e coma."] },
        { title: O ? "Vitamina + aveia" : "Iogurte + fruta", ing: ["banana", "aveia", "leite/água"], how: ["Bata e beba."] },
      ],
      almocos: [
        { title: O ? "Arroz + feijão + frango + salada" : "Arroz + feijão + frango", ing: ["arroz", "feijão", "frango", "salada"], how: ["Monte o prato."] },
        { title: O ? "Carne + batata + legumes" : "Ovos + arroz + salada", ing: ["proteína", "base", "legumes"], how: ["Cozinhe e monte."] },
      ],
      jantas: [
        { title: O ? "Omelete + legumes" : "Omelete", ing: ["ovos", "legumes"], how: ["Refogue legumes.", "Finalize com ovos."] },
        { title: O ? "Wrap + proteína" : "Sanduíche leve", ing: ["wrap/pão", "proteína"], how: ["Monte e coma."] },
      ],
    },
  ];

  return week;
}

export default function NutricaoOpcao() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { id } = useParams(); // "1" | "2"
  const option = id === "2" ? "2" : "1";

  const email = (user?.email || "anon").toLowerCase();
  const paid = useMemo(() => getPaid(email), [email]);

  // dia automático + override para “receber mais opções”
  const overrideKey = `nutri_day_override_${email}_opt${option}`;
  const [override, setOverride] = useState(() => {
    const raw = localStorage.getItem(overrideKey);
    if (!raw) return null;
    try {
      const j = JSON.parse(raw);
      // override vale só no mesmo dia
      if (j?.date === keyOfToday()) return Number(j?.idx);
      return null;
    } catch {
      return null;
    }
  });

  const week = useMemo(() => buildWeeklyMenus(option), [option]);

  const idxAuto = useMemo(() => dayIndexFromDate(keyOfToday()), []);
  const dayIdx = useMemo(() => {
    const v = Number(override);
    return Number.isFinite(v) ? ((v % 7) + 7) % 7 : idxAuto;
  }, [override, idxAuto]);

  const day = week[dayIdx];

  const doneKey = `nutri_done_${email}_opt${option}_${keyOfToday()}`;
  const [done, setDone] = useState(() => localStorage.getItem(doneKey) === "1");

  function markDone() {
    localStorage.setItem(doneKey, "1");
    setDone(true);
  }

  function moreOptions() {
    const next = (dayIdx + 1) % 7;
    const payload = { date: keyOfToday(), idx: next };
    localStorage.setItem(overrideKey, JSON.stringify(payload));
    setOverride(next);
  }

  if (!paid) {
    return (
      <div style={S.page}>
        <div style={S.lockCard}>
          <div style={S.lockTitle}>Em breve</div>
          <div style={S.lockText}>Assine para liberar o plano alimentar diário.</div>
          <button style={S.lockBtn} onClick={() => nav("/planos")}>
            Ver planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.top}>
        <button style={S.backBtn} onClick={() => nav("/nutricao")}>
          ←
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={S.title}>Opção {option}</div>
          <div style={S.sub}>
            42 refeições para você • muda todo dia • {day.day}
          </div>
        </div>
      </div>

      <div style={S.banner}>
        <div style={S.bannerKicker}>Seu plano de hoje</div>
        <div style={S.bannerText}>Você merece o melhor todos os dias.</div>
      </div>

      <Section title="Café da manhã" items={day.cafes} />
      <Section title="Almoço" items={day.almocos} />
      <Section title="Janta" items={day.jantas} />

      <div style={S.actions}>
        <button style={done ? S.doneBtnOn : S.doneBtn} onClick={markDone}>
          {done ? "Concluído 😊" : "Concluído"}
        </button>
        <button style={S.moreBtn} onClick={moreOptions}>
          Receber mais opções
        </button>
      </div>

      <div style={S.footerNote}>
        * As refeições mudam automaticamente todo dia. “Receber mais opções” é só para você visualizar outras sugestões.
      </div>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={S.sectionTitle}>{title}</div>
      <div style={S.grid}>
        {items.map((r, i) => (
          <div key={i} style={S.card}>
            <div style={S.cardTop}>
              <div style={S.chip}>{i + 1}</div>
              <div style={{ minWidth: 0 }}>
                <div style={S.cardTitle}>{r.title}</div>
                <div style={S.cardSub}>Receita rápida e objetiva</div>
              </div>
            </div>

            <div style={S.block}>
              <div style={S.blockTitle}>Ingredientes</div>
              <ul style={S.list}>
                {r.ing.map((x, idx) => (
                  <li key={idx} style={S.li}>{x}</li>
                ))}
              </ul>
            </div>

            <div style={S.block2}>
              <div style={S.blockTitle}>Como fazer</div>
              <ol style={S.list}>
                {r.how.map((x, idx) => (
                  <li key={idx} style={S.li}>{x}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  page: { padding: 20, paddingBottom: 120, background: BG },

  top: { display: "flex", gap: 12, alignItems: "center" },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    border: "none",
    background: "rgba(255,106,0,.14)",
    color: TEXT,
    fontWeight: 950,
    fontSize: 16,
  },
  title: { fontSize: 22, fontWeight: 950, color: TEXT, letterSpacing: -0.5 },
  sub: { marginTop: 4, fontSize: 12, fontWeight: 850, color: MUTED, lineHeight: 1.35 },

  banner: {
    marginTop: 12,
    borderRadius: 24,
    padding: 16,
    background: "linear-gradient(135deg, rgba(255,106,0,.95), rgba(255,106,0,.62))",
    color: "#fff",
    boxShadow: "0 22px 70px rgba(15,23,42,.12)",
  },
  bannerKicker: { fontSize: 12, fontWeight: 900, opacity: 0.95 },
  bannerText: { marginTop: 8, fontSize: 16, fontWeight: 950, letterSpacing: -0.3, lineHeight: 1.2 },

  sectionTitle: { marginTop: 4, fontSize: 20, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },

  grid: { marginTop: 10, display: "grid", gap: 12 },
  card: {
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  cardTop: { display: "flex", gap: 12, alignItems: "center" },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,106,0,.14)",
    border: "1px solid rgba(255,106,0,.22)",
    color: TEXT,
    fontWeight: 950,
  },
  cardTitle: { fontSize: 16, fontWeight: 950, color: TEXT, letterSpacing: -0.3 },
  cardSub: { marginTop: 2, fontSize: 12, fontWeight: 800, color: MUTED },

  block: {
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    background: "rgba(15,23,42,.03)",
    border: "1px solid rgba(15,23,42,.06)",
  },
  block2: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,106,0,.10)",
    border: "1px solid rgba(255,106,0,.22)",
  },
  blockTitle: { fontSize: 12, fontWeight: 950, color: TEXT, opacity: 0.9 },

  list: { marginTop: 8, paddingLeft: 18 },
  li: { fontSize: 13, fontWeight: 800, color: "#334155", lineHeight: 1.45 },

  actions: { marginTop: 14, display: "grid", gap: 10 },
  doneBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: TEXT,
    color: "#fff",
    fontWeight: 950,
  },
  doneBtnOn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: "rgba(15,23,42,.92)",
    color: "#fff",
    fontWeight: 950,
  },
  moreBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,106,0,.28)",
    background: "rgba(255,106,0,.12)",
    color: TEXT,
    fontWeight: 950,
  },

  footerNote: { marginTop: 10, fontSize: 11, fontWeight: 800, color: MUTED, lineHeight: 1.35 },

  lockCard: {
    borderRadius: 22,
    padding: 16,
    background: "linear-gradient(135deg, rgba(255,106,0,.16), rgba(15,23,42,.02))",
    border: "1px solid rgba(255,106,0,.22)",
    boxShadow: "0 18px 50
