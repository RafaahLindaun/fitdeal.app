// ✅ (OPCIONAL) SE VOCÊ AINDA NÃO CRIOU: crie este arquivo para sumir o erro
// COLE EM: src/pages/TreinoDetalhe.jsx
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
function calcDayIndex(email) {
  const key = `treino_day_${email}`;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}
function pick(split, dayIndex) {
  return split[Math.min(dayIndex, split.length - 1)];
}
function estimateSets(obj) {
  if (obj === "atleta") return 4;
  if (obj === "hipertrofia") return 4;
  return 3;
}
function estimateReps(obj) {
  if (obj === "atleta") return "8–12";
  if (obj === "hipertrofia") return "6–12";
  return "10–15";
}
function estimateRest(obj) {
  if (obj === "atleta") return "60–90s";
  if (obj === "hipertrofia") return "75–120s";
  return "45–75s";
}
function buildPlan({ objetivo, frequencia }) {
  const freq = Number(frequencia || 3);
  const base = { sets: estimateSets(objetivo), reps: estimateReps(objetivo), rest: estimateRest(objetivo) };

  const A = [
    { name: "Supino Reto com Barra", group: "Peito", area: "Peitoral, tríceps e deltoide anterior.", cue: "Escápulas encaixadas e pés firmes. Desça controlando." },
    { name: "Supino Inclinado com Halteres", group: "Peito", area: "Peitoral superior e ombros.", cue: "Cotovelos 45°. Não deixe o ombro subir." },
    { name: "Crucifixo no Cross Over", group: "Peito", area: "Peitoral (isolamento).", cue: "Abra até sentir alongar, sem forçar articulação." },
    { name: "Desenvolvimento com Barra", group: "Ombros", area: "Deltoides e tríceps.", cue: "Core firme. Suba sem hiperextender a lombar." },
    { name: "Elevação Lateral", group: "Ombros", area: "Deltoide lateral.", cue: "Sobe até linha do ombro. Sem balanço." },
    { name: "Tríceps Pulley", group: "Tríceps", area: "Tríceps.", cue: "Cotovelos colados ao corpo. Estenda total." },
  ];

  const B = [
    { name: "Puxada no Puxador / Barra", group: "Costas", area: "Dorsal e bíceps.", cue: "Puxa com as costas, não com o pescoço. Peito alto." },
    { name: "Remada Curvada", group: "Costas", area: "Costas médias e lombar estabilizadora.", cue: "Coluna neutra. Puxa com cotovelos." },
    { name: "Face Pull", group: "Ombro", area: "Posterior de ombro e escápulas.", cue: "Puxa para o rosto, abrindo cotovelos." },
    { name: "Rosca Direta", group: "Bíceps", area: "Bíceps.", cue: "Cotovelo fixo. Sem roubar com o tronco." },
    { name: "Rosca Martelo", group: "Bíceps", area: "Bíceps e braquiorradial.", cue: "Punho neutro. Controle total." },
    { name: "Prancha", group: "Core", area: "Core e estabilização.", cue: "Glúteo contraído e barriga para dentro." },
  ];

  const C = [
    { name: "Agachamento", group: "Pernas", area: "Quadríceps, glúteos e core.", cue: "Joelho acompanha a ponta do pé. Tronco firme." },
    { name: "Levantamento Terra Romeno", group: "Posterior", area: "Posterior de coxa e glúteos.", cue: "Quadril vai para trás. Coluna neutra." },
    { name: "Leg Press", group: "Pernas", area: "Quadríceps e glúteos.", cue: "Não trave o joelho. Amplitude segura." },
    { name: "Panturrilha", group: "Pernas", area: "Panturrilhas.", cue: "Pausa em cima e embaixo. Sem quicar." },
    { name: "Abdominal", group: "Core", area: "Core.", cue: "Exale subindo. Sem puxar o pescoço." },
    { name: "Afundo", group: "Pernas", area: "Glúteos e quadríceps.", cue: "Passo firme. Tronco estável." },
  ];

  let split = [];
  if (freq <= 2) split = [A, B];
  else if (freq === 3) split = [A, B, C];
  else if (freq === 4) split = [A, C, B, C];
  else split = [A, B, C, A, C];

  return { base, split };
}

function suggestLoadRange(exName, pesoKg, objetivo) {
  const kg = Number(pesoKg || 0) || 70;
  const isAtleta = objetivo === "atleta";
  const isHip = objetivo === "hipertrofia";

  let base = 0.35;
  const n = exName.toLowerCase();
  if (n.includes("supino")) base = 0.55;
  if (n.includes("agacha")) base = 0.7;
  if (n.includes("remada")) base = 0.5;
  if (n.includes("terra") || n.includes("romeno")) base = 0.75;
  if (n.includes("desenvolvimento")) base = 0.35;
  if (n.includes("elevação lateral")) base = 0.12;
  if (n.includes("rosca")) base = 0.2;
  if (n.includes("tríceps") || n.includes("triceps")) base = 0.22;

  const mult = isAtleta ? 1.1 : isHip ? 1.0 : 0.85;
  const mid = kg * base * mult;

  const low = Math.max(2, Math.round(mid * 0.85));
  const high = Math.max(low + 1, Math.round(mid * 1.05));
  return `${low}–${high}kg`;
}

export default function TreinoDetalhe() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || "anon").toLowerCase();
  const paid = localStorage.getItem(`paid_${email}`) === "1";

  const objetivoRaw = String(user?.objetivo || "hipertrofia").toLowerCase();
  const objetivo = objetivoRaw.includes("atlet") ? "atleta" : objetivoRaw.includes("bem") ? "bem-estar" : "hipertrofia";
  const frequencia = Number(user?.frequencia || 3);

  const { base, split } = useMemo(() => buildPlan({ objetivo, frequencia }), [objetivo, frequencia]);
  const dayIndex = useMemo(() => calcDayIndex(email), [email]);
  const list = useMemo(() => pick(split, dayIndex), [split, dayIndex]);

  const [loads, setLoads] = useState(() => {
    const raw = localStorage.getItem(`loads_${email}_${dayIndex}`);
    return raw ? JSON.parse(raw) : {};
  });

  function setLoad(i, v) {
    const next = { ...loads, [i]: v };
    setLoads(next);
    localStorage.setItem(`loads_${email}_${dayIndex}`, JSON.stringify(next));
  }

  if (!paid) {
    return (
      <div style={S.page}>
        <div style={S.lockCard}>
          <div style={S.lockTitle}>Treino detalhado bloqueado</div>
          <div style={S.lockText}>Assine para liberar.</div>
          <button style={S.lockBtn} onClick={() => nav("/planos")}>Ver planos</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.head}>
        <button style={S.back} onClick={() => nav("/treino")}>←</button>
        <div>
          <div style={S.hTitle}>Treino detalhado</div>
          <div style={S.hSub}>Séries × Reps: <b>{base.sets} × {base.reps}</b> • Descanso: <b>{base.rest}</b></div>
        </div>
      </div>

      <div style={S.section}>Exercícios</div>

      <div style={S.list}>
        {list.map((ex, i) => {
          const suggested = suggestLoadRange(ex.name, user?.peso, objetivo);
          return (
            <div key={i} style={S.card}>
              <div style={S.topRow}>
                <div style={S.num}>{i + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={S.name}>{ex.name}</div>
                  <div style={S.group}>{ex.group}</div>
                </div>
              </div>

              <div style={S.box}>
                <div style={S.boxTitle}>Área trabalhada</div>
                <div style={S.boxText}>{ex.area}</div>
              </div>

              <div style={S.box2}>
                <div style={S.boxTitle}>Execução</div>
                <div style={S.boxText}>{ex.cue}</div>
              </div>

              <div style={S.loadRow}>
                <div>
                  <div style={S.loadLabel}>Carga sugerida</div>
                  <div style={S.loadVal}>{suggested}</div>
                </div>

                <div style={{ width: 140 }}>
                  <div style={S.loadLabel}>Sua carga</div>
                  <input
                    value={loads[i] ?? ""}
                    onChange={(e) => setLoad(i, e.target.value)}
                    placeholder="ex: 40kg"
                    style={S.input}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 110 }} />
    </div>
  );
}

const S = {
  page: { padding: 18, paddingBottom: 120, background: BG },

  head: {
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 16,
    border: "none",
    background: "rgba(255,106,0,.14)",
    color: TEXT,
    fontWeight: 950,
    fontSize: 16,
  },
  hTitle: { fontSize: 18, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  hSub: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: 800, lineHeight: 1.35 },

  section: { marginTop: 14, fontSize: 22, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },

  list: { marginTop: 12, display: "grid", gap: 14 },
  card: {
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  topRow: { display: "flex", gap: 12, alignItems: "center" },
  num: {
    width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center",
    background: `linear-gradient(135deg, rgba(255,106,0,.95), rgba(255,106,0,.60))`,
    color: "#fff", fontWeight: 950, fontSize: 16,
  },
  name: { fontSize: 18, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  group: { marginTop: 2, fontSize: 12, fontWeight: 900, color: MUTED },

  box: { marginTop: 12, borderRadius: 18, padding: 14, background: "rgba(255,106,0,.10)", border: "1px solid rgba(255,106,0,.22)" },
  box2: { marginTop: 10, borderRadius: 18, padding: 14, background: "rgba(15,23,42,.03)", border: "1px solid rgba(15,23,42,.06)" },
  boxTitle: { fontSize: 12, fontWeight: 950, color: TEXT, opacity: 0.9 },
  boxText: { marginTop: 6, fontSize: 13, fontWeight: 800, color: "#334155", lineHeight: 1.45 },

  loadRow: { marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end" },
  loadLabel: { fontSize: 12, fontWeight: 900, color: MUTED },
  loadVal: { marginTop: 4, fontSize: 18, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  input: {
    width: "100%",
    marginTop: 6,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,.10)",
    outline: "none",
    fontSize: 14,
    fontWeight: 800,
  },

  lockCard: {
    borderRadius: 22,
    padding: 16,
    background: "linear-gradient(135deg, rgba(255,106,0,.16), rgba(255,106,0,.08))",
    border: "1px solid rgba(255,106,0,.22)",
    boxShadow: "0 18px 50px rgba(15,23,42,.10)",
  },
  lockTitle: { fontSize: 16, fontWeight: 950, color: TEXT },
  lockText: { marginTop: 6, fontSize: 13, color: MUTED, fontWeight: 800, lineHeight: 1.4 },
  lockBtn: { marginTop: 10, width: "100%", padding: 14, borderRadius: 18, border: "none", background: ORANGE, color: "#111", fontWeight: 950 },
};
