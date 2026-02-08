// ✅ COLE EM: src/pages/Dashboard.jsx  (VERSÃO FINAL – já com cardio somando + “ver planos” sem erro)
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ORANGE = "#FF6A00";
const TEXT = "#0f172a";
const MUTED = "#64748b";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function estimateWorkoutKcal(weightKg) {
  const kg = Number(weightKg || 0);
  if (!kg) return 320;
  return Math.round((6 * 3.5 * kg) / 200 * 45);
}

function calcWeeklyCount(list) {
  const now = new Date();
  return list.filter((k) => {
    const dt = new Date(k);
    const diff = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7.0001;
  }).length;
}

function calcStreak(opens, workoutSet) {
  let s = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const k = d.toISOString().slice(0, 10);
    if (opens[k] && workoutSet.has(k)) {
      s++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return s;
}

function getCardioWeekKcal(email) {
  const weekKey = `cardio_week_${email}`;
  const raw = localStorage.getItem(weekKey);
  const obj = raw ? JSON.parse(raw) : {};
  const now = new Date();

  let sum = 0;
  for (const [day, kcal] of Object.entries(obj)) {
    const dt = new Date(day);
    const diff = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff < 7.0001) sum += Number(kcal || 0);
  }
  return Math.round(sum);
}

function ProgressPill({ value, max, label }) {
  const pct = max <= 0 ? 0 : clamp(value / max, 0, 1);
  return (
    <div style={styles.pill}>
      <div style={styles.pillTop}>
        <div style={styles.pillLabel}>{label}</div>
        <div style={styles.pillValue}>
          {value}/{max}
        </div>
      </div>
      <div style={styles.pillTrack}>
        <div style={{ ...styles.pillFill, width: `${Math.round(pct * 100)}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || "anon").toLowerCase();

  const paid = useMemo(() => localStorage.getItem(`paid_${email}`) === "1", [email]);

  const workoutKey = `workout_${email}`;
  const openKey = `open_${email}`;

  const today = useMemo(() => todayKey(), []);

  const [workouts, setWorkouts] = useState(() => {
    const raw = localStorage.getItem(workoutKey);
    return raw ? JSON.parse(raw) : [];
  });

  const [opens] = useState(() => {
    const raw = localStorage.getItem(openKey);
    const obj = raw ? JSON.parse(raw) : {};
    obj[today] = (obj[today] || 0) + 1;
    localStorage.setItem(openKey, JSON.stringify(obj));
    return obj;
  });

  const workoutSet = useMemo(() => new Set(workouts), [workouts]);

  function markWorkout() {
    if (workoutSet.has(today)) return;
    const next = [...workouts, today];
    setWorkouts(next);
    localStorage.setItem(workoutKey, JSON.stringify(next));
  }

  // metas
  const weekGoal = Number(user?.frequencia || 4) || 4;
  const streakGoal = 7;

  const weekly = useMemo(() => calcWeeklyCount(workouts), [workouts]);
  const streak = useMemo(() => calcStreak(opens, workoutSet), [opens, workoutSet]);

  const kcalPerWorkout = useMemo(() => estimateWorkoutKcal(user?.peso), [user?.peso]);
  const kcalFromWorkouts = useMemo(() => weekly * kcalPerWorkout, [weekly, kcalPerWorkout]);
  const kcalFromCardio = useMemo(() => getCardioWeekKcal(email), [email]);

  // motivação grande (clicável)
  const tips = useMemo(
    () => [
      { title: "Treino de hoje", text: "Comece agora. 25 min bem feitos mudam o jogo." },
      { title: "Sem drama", text: "Faça o básico bem feito: execução limpa e constância." },
      { title: "Progresso visível", text: "Registre o treino e deixe o app trabalhar por você." },
      { title: "Você no controle", text: "Pequenas vitórias por dia = resultado inevitável." },
    ],
    []
  );
  const [tipIndex, setTipIndex] = useState(0);
  const [tap, setTap] = useState(false);

  function nextTip() {
    setTap(true);
    setTimeout(() => setTap(false), 140);
    setTipIndex((i) => (i + 1) % tips.length);
  }

  const name = user?.nome ? user.nome.split(" ")[0] : "Você";

  return (
    <div className="container page" style={styles.page}>
      {/* topo plano */}
      <div style={styles.planCard}>
        <div>
          <div style={styles.planLabel}>Plano</div>
          <div style={styles.planName}>{paid ? "Básico ativo • R$ 12,99/mês" : "Sem plano ativo"}</div>
          <div style={styles.planSub}>
            {paid ? "Treinos liberados. Nutri+ é upgrade." : "Assine para liberar o treino completo."}
          </div>
        </div>

        {/* ✅ SEM ERRO: sempre vai pra /planos */}
        <button style={paid ? styles.planBtnSoft : styles.planBtn} onClick={() => nav("/planos")}>
          Ver planos
        </button>
      </div>

      {/* motivação grande em cima */}
      <button
        onClick={nextTip}
        style={{
          ...styles.motivation,
          transform: tap ? "scale(0.985)" : "scale(1)",
        }}
      >
        <div style={styles.motKicker}>TOQUE PARA MOTIVAÇÃO</div>
        <div style={styles.motTitle}>Bem-vindo, {name}</div>
        <div style={styles.motText}>
          <b>{tips[tipIndex].title}:</b> {tips[tipIndex].text}
        </div>

        <div style={styles.motActions}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (paid) nav("/treino");
              else nav("/planos");
            }}
            style={styles.motPrimary}
          >
            {paid ? "Ver treino" : "Ver planos"}
          </button>

          {/* botão para cardio */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nav("/cardio");
            }}
            style={styles.motGhost}
          >
            Hora do cardio
          </button>

          {paid ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markWorkout();
              }}
              style={styles.motGhost2}
            >
              {workoutSet.has(today) ? "Treino já registrado" : "Marcar como feito"}
            </button>
          ) : null}
        </div>
      </button>

      {/* progresso (sem rodinha) */}
      <div style={styles.progressRow}>
        <ProgressPill value={weekly} max={Math.max(weekGoal, 1)} label="Semana" />
        <ProgressPill value={streak} max={streakGoal} label="Streak" />
      </div>

      {/* cards menores */}
      <div style={styles.grid}>
        <div style={styles.cardSoft}>
          <div style={styles.cardTitle}>Calorias queimadas</div>
          <div style={styles.cardBig}>{(kcalFromWorkouts || 0) + (kcalFromCardio || 0)} kcal</div>
          <div style={styles.cardSub}>
            {kcalPerWorkout} kcal/treino + {kcalFromCardio} kcal (cardio)
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Consistência</div>
          <div style={styles.cardBig}>{streak} dias</div>
          <div style={styles.cardSub}>conta quando abre + registra treino</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Objetivo</div>
          <div style={styles.cardBig}>{user?.objetivo || "Hipertrofia"}</div>
          <div style={styles.cardSub}>frequência: {weekGoal}x/sem</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 18, paddingBottom: 120, background: "#f8fafc" },

  planCard: {
    borderRadius: 22,
    padding: 16,
    background: "#0B0B0C",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 18px 50px rgba(0,0,0,.18)",
    marginTop: 6,
    marginBottom: 14,
  },
  planLabel: { fontSize: 12, fontWeight: 900, opacity: 0.75 },
  planName: { marginTop: 2, fontSize: 14, fontWeight: 950 },
  planSub: { marginTop: 4, fontSize: 12, fontWeight: 750, opacity: 0.8, lineHeight: 1.35 },
  planBtn: {
    padding: "12px 14px",
    borderRadius: 16,
    border: "none",
    background: ORANGE,
    color: "#111",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  planBtnSoft: {
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,106,0,.35)",
    background: "rgba(255,106,0,.14)",
    color: "#fff",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },

  motivation: {
    borderRadius: 26,
    padding: 18,
    textAlign: "left",
    background: "linear-gradient(135deg, rgba(255,106,0,.16), rgba(15,23,42,.03))",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 20px 60px rgba(15,23,42,.10)",
    transition: "transform .12s ease",
  },
  motKicker: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid rgba(255,106,0,.25)",
    color: ORANGE,
    fontWeight: 950,
    fontSize: 11,
  },
  motTitle: { marginTop: 12, fontSize: 22, fontWeight: 950, color: TEXT, letterSpacing: -0.6 },
  motText: { marginTop: 8, fontSize: 14, fontWeight: 750, color: "#334155", lineHeight: 1.55 },
  motActions: { marginTop: 14, display: "grid", gap: 10 },
  motPrimary: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #FF6A00, #FF8A3D)",
    color: "#111",
    fontWeight: 950,
    boxShadow: "0 16px 40px rgba(255,106,0,.25)",
  },
  motGhost: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,.10)",
    background: "#fff",
    color: TEXT,
    fontWeight: 950,
  },
  motGhost2: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,.10)",
    background: "rgba(255,106,0,.10)",
    color: TEXT,
    fontWeight: 950,
  },

  progressRow: { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  pill: {
    borderRadius: 20,
    padding: 14,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 12px 34px rgba(15,23,42,.06)",
  },
  pillTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  pillLabel: { fontSize: 12, fontWeight: 950, color: MUTED },
  pillValue: { fontSize: 16, fontWeight: 950, color: TEXT, letterSpacing: -0.4 },
  pillTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(15,23,42,.08)",
    overflow: "hidden",
  },
  pillFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #FF6A00, #FFB26B)",
    boxShadow: "0 10px 24px rgba(255,106,0,.18)",
    transition: "width .25s ease",
  },

  grid: { marginTop: 14, display: "grid", gap: 12 },
  card: {
    background: "#fff",
    borderRadius: 22,
    padding: 16,
    border: "1px solid rgba(15,23,42,.06)",
    boxShadow: "0 14px 40px rgba(15,23,42,.06)",
  },
  cardSoft: {
    background: "linear-gradient(135deg, rgba(255,106,0,.12), rgba(255,106,0,.06))",
    borderRadius: 22,
    padding: 16,
    border: "1px solid rgba(255,106,0,.16)",
  },
  cardTitle: { fontSize: 13, fontWeight: 950, color: MUTED },
  cardBig: { marginTop: 6, fontSize: 28, fontWeight: 950, color: TEXT, letterSpacing: -0.7 },
  cardSub: { marginTop: 4, fontSize: 12, fontWeight: 750, color: MUTED, lineHeight: 1.35 },
};
