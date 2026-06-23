export default function isPlacement(b: number[]): boolean {
  return b.filter((c) => c !== 0).length < 6;
}
