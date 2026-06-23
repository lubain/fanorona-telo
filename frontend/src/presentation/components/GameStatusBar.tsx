export default function GameStatusBar({
  label,
  sub,
  color,
}: {
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="hub-status">
      <span className="hub-status-label" style={color ? { color } : undefined}>
        {label}
      </span>
      {sub && <span className="hub-status-sub">{sub}</span>}
    </div>
  );
}
