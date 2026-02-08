import { Link, useLocation } from "react-router-dom";

type Item = {
  to: string;
  label: string;
  Icon: (p: { active: boolean }) => JSX.Element;
  activeBg: string;
  activeFg: string;
};

export default function BottomMenu() {
  const { pathname } = useLocation();

  const items: Item[] = [
    {
      to: "/dashboard",
      label: "Início",
      Icon: HomeIcon,
      activeBg: "rgba(37, 99, 235, 0.12)",
      activeFg: "#2563eb",
    },
    {
      to: "/nutricao",
      label: "Nutrição",
      Icon: NutritionIcon,
      activeBg: "rgba(34, 197, 94, 0.14)",
      activeFg: "#16a34a",
    },
    {
      to: "/pagamentos",
      label: "Planos",
      Icon: CardIcon,
      activeBg: "rgba(245, 158, 11, 0.16)",
      activeFg: "#d97706",
    },
    {
      to: "/conta",
      label: "Conta",
      Icon: UserIcon,
      activeBg: "rgba(124, 58, 237, 0.14)",
      activeFg: "#7c3aed",
    },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              style={{
                ...styles.item,
                background: active ? it.activeBg : "transparent",
              }}
            >
              <div
                style={{
                  ...styles.square,
                  borderColor: active ? "rgba(15,23,42,0.08)" : "rgba(15,23,42,0.08)",
                  boxShadow: active ? "0 10px 26px rgba(15,23,42,0.10)" : "none",
                }}
              >
                <it.Icon active={active} />
              </div>

              <div
                style={{
                  ...styles.label,
                  color: active ? it.activeFg : "#64748b",
                  fontWeight: active ? 800 : 700,
                }}
              >
                {it.label}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const styles: Record<string, any> = {
  nav: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "10px 12px 14px",
    background: "rgba(255,255,255,0.86)",
    borderTop: "1px solid rgba(15,23,42,0.08)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    zIndex: 200,
  },
  inner: {
    maxWidth: 420,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 6px",
    borderRadius: 16,
    textDecoration: "none",
    transition: "transform 0.14s ease, background 0.14s ease",
  },
  square: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    display: "grid",
    placeItems: "center",
    transition: "box-shadow 0.14s ease, transform 0.14s ease",
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
};

/* ÍCONES (SVG) — sem lib, sem emoji */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.8 12 4l8 6.8V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.2Z"
        stroke={active ? "#2563eb" : "#64748b"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21.5v-6.2h5v6.2"
        stroke={active ? "#2563eb" : "#64748b"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NutritionIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 20c4.5 0 10-6.2 10-12.2C17 5.1 15.7 4 14.2 4 12 4 11 6.2 11 6.2S10 4 7.8 4C6.3 4 5 5.1 5 7.8 5 13.8 2.5 20 7 20Z"
        stroke={active ? "#16a34a" : "#64748b"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 10c-1.2 2.2-3.1 4-5.5 5.2"
        stroke={active ? "#16a34a" : "#64748b"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z"
        stroke={active ? "#d97706" : "#64748b"}
        strokeWidth="1.8"
      />
      <path
        d="M4.5 9.3h15"
        stroke={active ? "#d97706" : "#64748b"}
        strokeWidth="1.8"
      />
      <path
        d="M7.5 15.5h5.2"
        stroke={active ? "#d97706" : "#64748b"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12.2c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z"
        stroke={active ? "#7c3aed" : "#64748b"}
        strokeWidth="1.8"
      />
      <path
        d="M4.8 20c1.6-3 4.1-4.6 7.2-4.6s5.6 1.6 7.2 4.6"
        stroke={active ? "#7c3aed" : "#64748b"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
