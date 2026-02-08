// ✅ COLE EM: src/pages/Cardio.jsx
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ORANGE = '#FF6A00';
const BG = '#f8fafc';
const TEXT = '#0f172a';
const MUTED = '#64748b';

function yyyyMmDd(d = new Date()) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getGoal(user) {
  const raw = String(user?.objetivo || 'hipertrofia').toLowerCase();
  if (raw.includes('power')) return 'powerlifting';
  if (raw.includes('body')) return 'bodybuilding';
  if (raw.includes('cond')) return 'condicionamento';
  if (raw.includes('saud') || raw.includes('bem')) return 'saude';
  return 'hipertrofia';
}

function getLevel(user) {
  const raw = String(user?.nivel || 'iniciante').toLowerCase();
  if (raw.includes('avan')) return 'avancado';
  if (raw.includes('inter')) return 'intermediario';
  return 'iniciante';
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Estimativa simples por minuto (kcal/min) usando MET:
 * kcal/min = MET * 3.5 * kg / 200
 * Ajusta MET por objetivo/nível (leve, estável).
 */
function calcKcalPerMin({ kg, met }) {
  const w = Number(kg || 0) || 70;
  return (met * 3.5 * w) / 200;
}

function getCardioOptions(goal, level) {
  // MET base por modalidade (aprox. e estável)
  const base = [
    {
      id: 'walk',
      title: 'Caminhada rápida',
      met: 4.3,
      mapQ: 'parque caminhada',
    },
    { id: 'run', title: 'Corrida leve', met: 7.0, mapQ: 'pista corrida' },
    { id: 'bike', title: 'Bike (moderado)', met: 6.8, mapQ: 'ciclovia' },
    { id: 'jump', title: 'Corda (leve)', met: 8.8, mapQ: 'quadra esportiva' },
    { id: 'hiit', title: 'HIIT (curto)', met: 9.5, mapQ: 'academia' },
  ];

  // ajuste por objetivo/nível
  let mult = 1.0;
  if (goal === 'saude') mult = 0.92;
  if (goal === 'hipertrofia') mult = 1.0;
  if (goal === 'bodybuilding') mult = 1.02;
  if (goal === 'condicionamento') mult = 1.08;
  if (goal === 'powerlifting') mult = 0.98;

  if (level === 'iniciante') mult *= 0.92;
  if (level === 'avancado') mult *= 1.06;

  return base.map((o) => ({ ...o, met: clamp(o.met * mult, 3.6, 10.5) }));
}

function getCongrats(goal, level) {
  if (goal === 'saude')
    return level === 'iniciante'
      ? 'Parabéns! Você fez o básico bem feito — isso muda o corpo e a mente.'
      : 'Excelente! Rotina consistente é o que mantém você forte por anos.';
  if (goal === 'condicionamento')
    return level === 'iniciante'
      ? 'Boa! Seu fôlego começa a mudar a partir de hoje.'
      : 'Monstro! Você subiu o nível — sua resistência tá ficando real.';
  if (goal === 'powerlifting')
    return 'Perfeito. Cardio na medida certa melhora recuperação sem roubar força.';
  if (goal === 'bodybuilding')
    return 'Excelente! Cardio inteligente ajuda definição e melhora o desempenho.';
  return 'Parabéns! Você fez o que precisava — consistência vence.';
}

export default function Cardio() {
  const nav = useNavigate();
  const { user } = useAuth();
  const email = (user?.email || 'anon').toLowerCase();

  const paid = localStorage.getItem(`paid_${email}`) === '1';
  const nutriPlus = localStorage.getItem(`nutri_${email}`) === '1'; // se você já usa esse flag, mantém

  const goal = useMemo(() => getGoal(user), [user]);
  const level = useMemo(() => getLevel(user), [user]);

  const weightKg = Number(user?.peso || 0) || 70;

  const options = useMemo(() => getCardioOptions(goal, level), [goal, level]);
  const [picked, setPicked] = useState(options[0]?.id || 'walk');

  const opt = useMemo(
    () => options.find((o) => o.id === picked) || options[0],
    [options, picked]
  );
  const kcalPerMin = useMemo(
    () => calcKcalPerMin({ kg: weightKg, met: opt?.met || 4.3 }),
    [weightKg, opt]
  );

  // timer
  const [minutes, setMinutes] = useState(20);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(20 * 60);

  const tickRef = useRef(null);

  function setPresetMin(v) {
    const m = clamp(Number(v || 0), 5, 120);
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function start() {
    if (running) return;
    setRunning(true);
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function pause() {
    setRunning(false);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function reset() {
    pause();
    setRemaining(minutes * 60);
  }

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function finish() {
    pause();
    const doneMin = Math.max(0, Math.round((minutes * 60 - remaining) / 60));
    const kcal = Math.round(doneMin * kcalPerMin);

    const day = yyyyMmDd(new Date());
    const sessionsKey = `cardio_sessions_${email}`;
    const totalKey = `cardio_total_${email}`;
    const weekKey = `cardio_week_${email}`; // objeto por dia

    const record = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      day,
      minutes: doneMin,
      kcal,
      type: opt.id,
      title: opt.title,
      met: opt.met,
      createdAt: Date.now(),
      
      
    };

    const raw = localStorage.getItem(sessionsKey);
    const list = raw ? JSON.parse(raw) : [];
    const nextList = [record, ...list].slice(0, 90);
    localStorage.setItem(sessionsKey, JSON.stringify(nextList));

    const prevTotal = Number(localStorage.getItem(totalKey) || 0) || 0;
    localStorage.setItem(totalKey, String(prevTotal + kcal));

    const weekRaw = localStorage.getItem(weekKey);
    const obj = weekRaw ? JSON.parse(weekRaw) : {};
    obj[day] = (obj[day] || 0) + kcal;
    localStorage.setItem(weekKey, JSON.stringify(obj));

    // mensagem grande
    localStorage.setItem(
      `cardio_lastmsg_${email}`,
      JSON.stringify({
        day,
        kcal,
        minutes: doneMin,
        title: opt.title,
        goal,
        level,
        text: getCongrats(goal, level),
        ts: Date.now(),
      })
    );
  
    setTimeout(() => nav('/dashboard'), 600);
  }

  function openMap() {
    // “mapa” simples sem API: abre o Google Maps com busca
    const q = encodeURIComponent(`${opt.mapQ} perto de mim`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${q}`,
      '_blank'
    );
  }

  if (!paid) {
    return (
      <div style={styles.page}>
        <div style={styles.lockCard}>
          <div style={styles.lockTitle}>Cardio bloqueado</div>
          <div style={styles.lockText}>
            Assine o plano para liberar o cardio guiado.
          </div>
          <button style={styles.lockBtn} onClick={() => nav('/planos')}>
            Ver planos (recorrente e automático)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.head}>
        <div>
          <div style={styles.kicker}>Hora do cardio</div>
          <div style={styles.title}>Escolha e faça agora</div>
          <div style={styles.sub}>
            Meta: <b>{goal}</b> • Nível: <b>{level}</b>
          </div>
        </div>

        <button style={styles.backBtn} onClick={() => nav('/treino')}>
          Voltar
        </button>
      </div>

      <div style={styles.pickCard}>
        <div style={styles.pickTop}>
          <div style={styles.pickTitle}>Melhores opções</div>
          <button style={styles.mapBtn} onClick={openMap}>
            Ver mapa
          </button>
        </div>

        <div style={styles.optList}>
          {options.map((o) => {
            const kpm = calcKcalPerMin({ kg: weightKg, met: o.met });
            return (
              <button
                key={o.id}
                onClick={() => {
                  setPicked(o.id);
                  reset();
                }}
                style={{
                  ...styles.optBtn,
                  ...(picked === o.id ? styles.optOn : styles.optOff),
                }}
              >
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={styles.optTitle}>{o.title}</div>
                  <div style={styles.optSub}>
                    ~{Math.round(kpm)} kcal/min • ~{Math.round(kpm * 20)} kcal
                    em 20min
                  </div>
                </div>
                <div style={styles.pill}>
                  {picked === o.id ? 'Selecionado' : '—'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.timerCard}>
        <div style={styles.timerTop}>
          <div>
            <div style={styles.timerLabel}>Timer</div>
            <div style={styles.timerBig}>{formatTime(remaining)}</div>
            <div style={styles.timerSub}>
              Estimativa:{' '}
              <b>
                ~
                {Math.round(
                  Math.max(0, Math.round((minutes * 60 - remaining) / 60)) *
                    kcalPerMin
                )}{' '}
                kcal
              </b>
            </div>
          </div>
        </div>

        <div style={styles.presets}>
          {[10, 15, 20, 30, 45].map((m) => (
            <button
              key={m}
              onClick={() => setPresetMin(m)}
              style={{
                ...styles.presetBtn,
                ...(minutes === m ? styles.presetOn : styles.presetOff),
              }}
            >
              {m}min
            </button>
          ))}
        </div>

        <div style={styles.timerActions}>
          {!running ? (
            <button style={styles.startBtn} onClick={start}>
              Começar
            </button>
          ) : (
            <button style={styles.pauseBtn} onClick={pause}>
              Pausar
            </button>
          )}

          <button style={styles.resetBtn} onClick={reset}>
            Reset
          </button>
        </div>

        <button
          style={styles.finishBtn}
          onClick={finish}
          disabled={Math.round((minutes * 60 - remaining) / 60) < 3}
        >
          Concluir cardio
        </button>

        <div style={styles.note}>
          Dica: conclua pelo menos <b>3 min</b> para registrar no dashboard.
        </div>
      </div>

      {!nutriPlus && (
        <button
          onClick={() => nav('/nutri-upgrade')}
          style={styles.floatingNutri}
        >
          Plano Nutri+ (mudar)
        </button>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 18, paddingBottom: 140, background: BG },

  lockCard: {
    borderRadius: 22,
    padding: 16,
    background:
      'linear-gradient(135deg, rgba(255,106,0,.16), rgba(255,106,0,.08))',
    border: '1px solid rgba(255,106,0,.22)',
    boxShadow: '0 18px 50px rgba(15,23,42,.10)',
  },
  lockTitle: { fontSize: 16, fontWeight: 950, color: TEXT },
  lockText: {
    marginTop: 6,
    fontSize: 13,
    color: MUTED,
    fontWeight: 800,
    lineHeight: 1.4,
  },
  lockBtn: {
    marginTop: 10,
    width: '100%',
    padding: 14,
    borderRadius: 18,
    border: 'none',
    background: ORANGE,
    color: '#111',
    fontWeight: 950,
  },

  head: {
    borderRadius: 22,
    padding: 16,
    background:
      'linear-gradient(135deg, rgba(255,106,0,.92), rgba(255,106,0,.62))',
    color: '#fff',
    boxShadow: '0 22px 70px rgba(15,23,42,.14)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  kicker: { fontSize: 12, fontWeight: 900, opacity: 0.95 },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: 950,
    letterSpacing: -0.5,
    lineHeight: 1.05,
  },
  sub: { marginTop: 6, fontSize: 12, fontWeight: 800, opacity: 0.95 },
  backBtn: {
    padding: '12px 14px',
    borderRadius: 16,
    border: 'none',
    background: 'rgba(255,255,255,.18)',
    color: '#fff',
    fontWeight: 950,
  },

  pickCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    background: '#fff',
    border: '1px solid rgba(15,23,42,.06)',
    boxShadow: '0 14px 40px rgba(15,23,42,.06)',
  },
  pickTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  pickTitle: {
    fontSize: 18,
    fontWeight: 950,
    color: TEXT,
    letterSpacing: -0.4,
  },
  mapBtn: {
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid rgba(255,106,0,.28)',
    background: 'rgba(255,106,0,.10)',
    color: TEXT,
    fontWeight: 950,
  },

  optList: { marginTop: 12, display: 'grid', gap: 10 },
  optBtn: {
    width: '100%',
    textAlign: 'left',
    borderRadius: 18,
    padding: 14,
    border: '1px solid rgba(15,23,42,.06)',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    transition: 'transform .12s ease',
  },
  optOn: {
    background: 'rgba(255,106,0,.10)',
    border: '1px solid rgba(255,106,0,.22)',
    transform: 'scale(0.99)',
  },
  optOff: { background: '#fff' },
  optTitle: { fontSize: 15, fontWeight: 950, color: TEXT },
  optSub: { fontSize: 12, fontWeight: 800, color: MUTED },
  pill: {
    padding: '8px 10px',
    borderRadius: 999,
    background: 'rgba(15,23,42,.06)',
    fontWeight: 950,
    fontSize: 12,
    color: TEXT,
  },

  timerCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    background: '#fff',
    border: '1px solid rgba(15,23,42,.06)',
    boxShadow: '0 14px 40px rgba(15,23,42,.06)',
  },
  timerLabel: { fontSize: 12, fontWeight: 950, color: MUTED },
  timerBig: {
    marginTop: 6,
    fontSize: 44,
    fontWeight: 950,
    color: TEXT,
    letterSpacing: -1.2,
  },
  timerSub: { marginTop: 6, fontSize: 12, fontWeight: 800, color: MUTED },

  presets: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
  },
  presetBtn: {
    padding: 12,
    borderRadius: 16,
    border: '1px solid rgba(15,23,42,.08)',
    fontWeight: 950,
    background: '#fff',
  },
  presetOn: { background: ORANGE, border: 'none', color: '#111' },
  presetOff: { background: '#fff', color: TEXT },

  timerActions: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  startBtn: {
    padding: 14,
    borderRadius: 18,
    border: 'none',
    background: ORANGE,
    color: '#111',
    fontWeight: 950,
    boxShadow: '0 16px 40px rgba(255,106,0,.22)',
  },
  pauseBtn: {
    padding: 14,
    borderRadius: 18,
    border: 'none',
    background: TEXT,
    color: '#fff',
    fontWeight: 950,
  },
  resetBtn: {
    padding: 14,
    borderRadius: 18,
    border: '1px solid rgba(15,23,42,.10)',
    background: '#fff',
    color: TEXT,
    fontWeight: 950,
  },

  finishBtn: {
    marginTop: 12,
    width: '100%',
    padding: 14,
    borderRadius: 18,
    border: 'none',
    background: TEXT,
    color: '#fff',
    fontWeight: 950,
    opacity: 1,
  },
  note: { marginTop: 10, fontSize: 12, fontWeight: 800, color: MUTED },

  floatingNutri: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 86,
    zIndex: 999,
    padding: '14px 18px',
    borderRadius: 999,
    border: 'none',
    background: ORANGE,
    color: '#111',
    fontWeight: 950,
    boxShadow: '0 18px 45px rgba(255,106,0,.28)',
  },
};
