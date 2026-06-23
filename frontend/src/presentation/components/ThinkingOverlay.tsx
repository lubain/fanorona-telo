export default function ThinkingOverlay({ text }: { text: string }) {
  return (
    <div className="hub-overlay">
      <div className="hub-thinking">
        <span className="hub-spinner" />
        <span>{text}</span>
      </div>
    </div>
  );
}
