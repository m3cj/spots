const MARKUP = /<[^>]*>/g;
// Everything below U+0020 except tab, newline and carriage return, plus DEL.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Plain-text policy: SpotS never stores HTML, so tags and control characters are removed on the way in. */
export function clean(value) {
  return value.replace(MARKUP, '').replace(CONTROL_CHARS, '').trim();
}
