// Tiny HTML helpers: escaping and a tagged template that escapes interpolations.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Marks a string as already-safe HTML. */
export class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(s);

/** Tagged template: escapes values unless wrapped in raw(); arrays are joined. */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => {
    const part = Array.isArray(v)
      ? v.map((x) => (x instanceof Raw ? x.s : esc(x))).join('')
      : v instanceof Raw ? v.s : esc(v);
    out += part + strings[i + 1];
  });
  return new Raw(out);
}
