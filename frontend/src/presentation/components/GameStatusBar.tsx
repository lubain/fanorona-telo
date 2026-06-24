import { useEffect, useRef, useState } from "react";

export default function GameStatusBar({
  label,
  sub,
  color,
}: {
  label: string;
  sub?: string;
  color?: string;
}) {
  // Animer le label quand il change
  const [visible, setVisible] = useState(true);
  const prevLabel = useRef(label);

  useEffect(() => {
    if (label !== prevLabel.current) {
      setVisible(false);
      const t = setTimeout(() => {
        prevLabel.current = label;
        setVisible(true);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [label]);

  return (
    <div className="hub-status">
      <span
        className="hub-status-label"
        style={{
          color: color ?? "var(--text)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(4px)",
          transition:
            "opacity 0.15s ease, transform 0.15s ease, color 0.3s ease",
          display: "block",
        }}
      >
        {label}
      </span>
      {sub && <span className="hub-status-sub">{sub}</span>}
    </div>
  );
}
