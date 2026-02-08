// ✅ COLE EM: src/pages/Treino.jsx  (não pagante: mostra “meia parte” + blur + botão flutuante “Começar agora”)
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

function pick(split, dayIndex) {
  return split[Math.min(dayIndex, split.length - 1)];
}

function calcDayIndex(email) {
  const key = `treino_day_${email}`;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function bumpDayIndex(email, max) {
  const key = `treino_day_${email}`;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : 0;
  const next = (Number.isFinite(n) ? n : 0) + 1;
  localStorage.setItem(key, String(next % max));
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
    { name: "Supino Reto com Barra", group: "Peito" },
    { name: "Supino Inclinado com Halteres", group: "Peito" },
    { name: "Crucifixo no Cross Over", group: "Peito" },
    { name: "Desenvolvimento com Barra", group: "Ombros" },
    { name: "Elevação Lateral", group: "Ombros" },
    { name: "Tríceps Pulley", group: "Tríceps" },
  ];

  const B = [
    { name: "Puxada no Puxador / Barra", group: "Costas" },
    { name: "Remada Curvada", group: "Costas" },
    { name: "Face Pull", group: "Ombro" },
    { name: "Rosca Direta", group: "Bíceps" },
    { name: "Rosca Martelo", group: "Bíceps" },
    { name: "Prancha", group: "Core" },
  ];

  const C = [
    { name: "Agachamento", group: "Pernas" },
    { name: "Levantamento Terra Romeno", group: "Posterior" },
    { name: "Leg Press", group: "Pernas" },
    { name: "Panturrilha", group: "Pernas" },
    { name: "Abdominal", group: "Core" },
    { name: "Afundo", group: "Pernas" },
  ];

  let split = [];
  if (freq <= 2) split = [A, B];
  else if (freq === 3) split = [A, B, C];
  else if (freq === 4) split = [A, C, B, C];
  else split = [A, B, C, A, C];

  return { base, split };
}

export default function Treino() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || "anon").toLowerCase();

  const paid = localStorage.getItem(`paid_${email}`) === "1";

  const objetivoRaw = String(user?.objetivo || "hipertrofia").toLowerCase();
  const objetivo = objetivoRaw.includes("atlet") ? "atleta" : objetivoRaw.includes("bem") ? "bem-estar" : "hipertrofia";
  const frequencia = Number(user?.frequencia || 3);

  const { base, split } = useMemo(() => buildPlan({ objetivo, frequencia }), [objetivo, frequencia]);

  const dayIndex = useMemo(() => calcDayIndex(email), [email]);
  const todayWorkout = useMemo(() => pick(split, dayIndex), [split, dayIndex]);

  const [done, setDone] = useState(() => {
    const raw = localStorage.getItem(`done_ex_${email}_${dayIndex}`);
    return raw ? JSON.parse(raw) : {};
  });

  function toggleDone(i) {
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    localStorage.setItem(`done_ex_${email}_${dayIndex}`, JSON.stringify(next));
  }

  function finishWorkout() {
    bumpDayIndex(email, split.length);
    localStorage.removeItem(`done_ex_${email}_${dayIndex}`);

    // marca treino no dashboard também
    const wkKey = `workout_${email}`;
    const today = todayKey();
    const raw = localStorage.getItem(wkKey);
    const list = raw ? JSON.parse(raw) : [];
    if (!list.includes(today)) localStorage.setItem(wkKey, JSON.stringify([...list, today]));

    window.location.reload();
  }

  // não pagante: mostra só a primeira metade visível
  const previewCount = Math.max(2, Math.ceil(todayWorkout.length / 2));
  const previewList = todayWorkout.slice(0, previewCount);
  const lockedList = todayWorkout.slice(previewCount);

  return (
    
    <div style={styles.page}>
      <div style={styles.headCard}>
        <div style={styles.headTitle}>Treino do dia</div>
        <div style={styles.headSub}>
          Objetivo: <b>{objetivo}</b> • Frequência: <b>{frequencia}x/sem</b>
        </div>
      </div>
{/* HORA DO CARDIO */}
<div style={styles.cardCardio}>
  <div style={styles.cardCardioTitle}>Hora do cardio</div>
  <div style={styles.cardCardioSub}>
    Escolha um cardio rápido e some calorias no dashboard.
  </div>
  <button style={styles.cardCardioBtn} onClick={() => nav("/cardio")}>
    Abrir cardio
  </button>
</div>
      <div style={styles.summaryCard}>
        <div style={styles.summaryTitle}>Resumo</div>
        <div style={styles.summaryLine}>
          Séries × Reps: <b>{base.sets} × {base.reps}</b>
        </div>
        <div style={styles.summaryLine}>
          Descanso: <b>{base.rest}</b>
        </div>

        {paid ? (
          <button style={styles.finishBtn} onClick={finishWorkout}>
            Concluir treino
          </button>
        ) : null}
      </div>

      <div style={styles.sectionTitle}>Exercícios</div>

      {/* parte liberada (sempre) */}
      <div style={styles.list}>
        {previewList.map((ex, i) => (
          <div key={i} style={styles.exCard}>
            <div style={styles.exTop}>
              <div style={styles.num}>{i + 1}</div>
              <div>
                <div style={styles.exName}>{ex.name}</div>
                <div style={styles.exNote}>Área: {ex.group} • Execução controlada</div>
              </div>
            </div>

            <button
              style={{
                ...styles.doneBtn,
                background: done[i] ? ORANGE : "rgba(15,23,42,.06)",
                color: done[i] ? "#111" : TEXT,
              }}
              onClick={() => toggleDone(i)}
            >
              {done[i] ? "Feito ✓" : "Marcar como feito"}
            </button>
          </div>
        ))}
      </div>

      {/* parte bloqueada (blur) */}
      {!paid && lockedList.length > 0 ? (
        <>
          <div style={styles.lockTitle}>Parte do treino bloqueada</div>
          <div style={styles.lockWrap}>
            {lockedList.map((ex, j) => (
              <div key={`l_${j}`} style={styles.exCard}>
                <div style={styles.exTop}>
                  <div style={styles.numMuted}>{previewCount + j + 1}</div>
                  <div>
                    <div style={styles.exName}>{ex.name}</div>
                    <div style={styles.exNote}>Área: {ex.group} • Dica + execução</div>
                  </div>
                </div>
                <button style={{ ...styles.doneBtn, background: "rgba(15,23,42,.06)", color: TEXT }}>
                  Marcar como feito
                </button>
              </div>
            ))}
          </div>

          {/* botão flutuante */}
          <button style={styles.fab} onClick={() => nav("/planos")}>
            Começar agora
          </button>
        </>
      ) : null}
    </div>
  );
}

const styles = {
  page: { padding: 18, paddingBottom: 140, background: BG },

  headCard: {
    borderRadius: 22,
    padding: 16,
    background: "linear-gradient(135deg, rgba(255,106,0,.92), rgba(255,106,0,.62))",
    color: "#fff",
    boxShadow: "0 22px 70px rgba(15,23,42,.14)",
  },
  headTitle: { fontSize: 24, fontWeight: 950, letterSpacing: -0.5, lineHeight: 1.05 },
  headSub: { marginTop: 6, fontSize: 12, fontWeight: 800, opacity: 0.95 },

  summaryCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  summaryTitle: { fontSize: 18, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  summaryLine: { marginTop: 8, fontSize: 13, fontWeight: 800, color: MUTED },
  finishBtn: {
    marginTop: 12,
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: TEXT,
    color: "#fff",
    fontWeight: 950,
  },

  sectionTitle: { marginTop: 16, fontSize: 22, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },

  list: { marginTop: 12, display: "grid", gap: 14 },
  exCard: {
    borderRadius: 22,
    padding: 16,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  exTop: { display: "flex", gap: 12, alignItems: "center" },
  num: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(255,106,0,.95), rgba(255,106,0,.60))",
    color: "#fff",
    fontWeight: 950,
    fontSize: 16,
    flexShrink: 0,
  },
  numMuted: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(15,23,42,.06)",
    color: TEXT,
    fontWeight: 950,
    fontSize: 16,
    flexShrink: 0,
  },
  exName: { fontSize: 16, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  exNote: { marginTop: 4, fontSize: 12, fontWeight: 800, color: MUTED },

  doneBtn: {
    marginTop: 12,
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    fontWeight: 950,
  },

  lockTitle: { marginTop: 14, fontSize: 14, fontWeight: 950, color: TEXT },
  lockWrap: {
    marginTop: 10,
    filter: "blur(2.6px)",
    opacity: 0.65,
    pointerEvents: "none",
    display: "grid",
    gap: 14,
  },

  fab: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: 86, // acima do menu inferior
    zIndex: 999,
    padding: "14px 18px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #FF6A00, #FF8A3D)",
    color: "#111",
    fontWeight: 950,
    boxShadow: "0 18px 45px rgba(255,106,0,.28)",
  },
  // ✅ COLE NO: src/pages/Treino.jsx
// ✅ ADICIONE NO FINAL DO styles (SEM APAGAR OS OUTROS)

cardCardio: {
  marginTop: 12,
  borderRadius: 22,
  padding: 16,
  background: "#fff",
  border: "1px solid rgba(15,23,42,.06)",
  boxShadow: "0 14px 40px rgba(15,23,42,.06)",
},
cardCardioTitle: { fontSize: 18, fontWeight: 950, color: "#0f172a", letterSpacing: -0.4 },
cardCardioSub: { marginTop: 6, fontSize: 13, fontWeight: 800, color: "#64748b", lineHeight: 1.4 },
cardCardioBtn: {
  marginTop: 12,
  width: "100%",
  padding: 14,
  borderRadius: 18,
  border: "none",
  background: "#FF6A00",
  color: "#111",
  fontWeight: 950,
  boxShadow: "0 16px 40px rgba(255,106,0,.22)",
},

};
