export function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
export function numArg(name: string, fallback: number): number {
  const value = Number(arg(name, String(fallback)));
  if (!Number.isFinite(value) || value < 1) throw new Error(`--${name} phải là số nguyên dương`);
  return Math.floor(value);
}
export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
