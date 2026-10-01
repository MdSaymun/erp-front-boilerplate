/** Small string helpers shared by the generator scripts. */
export function toPascal(input) {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

export function toCamel(input) {
  const pascal = toPascal(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebab(input) {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

export function toTitle(input) {
  const spaced = toPascal(input).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Inserts `text` on the line before a marker comment, keeping the marker. Throws if the marker is missing. */
export function insertBeforeMarker(source, marker, text, file) {
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Marker "${marker}" not found in ${file}`);
  if (source.includes(text.trim())) return source;
  const lineStart = source.lastIndexOf('\n', index) + 1;
  const indent = source.slice(lineStart, index);
  return `${source.slice(0, lineStart)}${indent}${text.trim()}\n${source.slice(lineStart)}`;
}

export function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        options[key] = true;
      } else {
        options[key] = next;
        i += 1;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, options };
}
