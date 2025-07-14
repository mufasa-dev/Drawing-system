export function rgbaToHex(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
}

export function rgbaStringToHex(rgba: string): string {
  // Verifica se já é um hex válido
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(rgba.trim())) {
    return rgba;
  }
  
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]+)?\)/);

  if (!match) return '#000000';

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255;

  const toHex = (val: number) => val.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else h = 60 * (((r - g) / delta) + 4);
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h, s, v];
}
