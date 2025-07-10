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

export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}
