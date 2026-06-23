export default function ResetBtn({
  onClick,
  label = "Rejouer",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button className="hub-reset-btn" onClick={onClick}>
      {label}
    </button>
  );
}
