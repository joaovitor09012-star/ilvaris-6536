import type { ReactNode } from "react";

/**
 * The narrator sometimes leans on `*emphasis*` and `**weight**`. Render them as type,
 * never as stray asterisks. Anything else passes through as plain text.
 */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) out.push(<strong key={k++} className="font-semibold">{m[2]}</strong>);
    else out.push(<em key={k++}>{m[3] ?? m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
