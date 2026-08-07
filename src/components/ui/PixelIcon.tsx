import type { SVGProps } from 'react';

/**
 * PixelIcon — hand-drawn 16×16 pixel-art glyphs (Shipaton-style),
 * rendered as a single crisp-edged SVG path. Colors come from
 * `currentColor`, so icons inherit the category accent (brand /
 * cyan / periwinkle) from their container. See DESIGN.md §7.
 */

const GLYPHS = {
  /* viewfinder brackets + center square */
  scan: [
    'XXXXX......XXXXX',
    'XXXXX......XXXXX',
    'XX............XX',
    'XX............XX',
    'XX............XX',
    '................',
    '................',
    '.......XX.......',
    '.......XX.......',
    '................',
    '................',
    'XX............XX',
    'XX............XX',
    'XX............XX',
    'XXXXX......XXXXX',
    'XXXXX......XXXXX',
  ],
  /* speech bubble with two text lines + tail */
  feed: [
    '................',
    '................',
    '...XXXXXXXXXX...',
    '.XXXXXXXXXXXXXX.',
    'XXXXXXXXXXXXXXXX',
    'XXXX........XXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXX......XXXXXX',
    'XXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXX.',
    '..XXXXXXXXXXXX..',
    '..XX............',
    '.XX.............',
    'XX..............',
    '................',
    '................',
  ],
  /* bold plus — add to vault */
  plus: [
    '................',
    '................',
    '................',
    '......XXXX......',
    '......XXXX......',
    '......XXXX......',
    '..XXXXXXXXXXXX..',
    '..XXXXXXXXXXXX..',
    '..XXXXXXXXXXXX..',
    '..XXXXXXXXXXXX..',
    '......XXXX......',
    '......XXXX......',
    '......XXXX......',
    '................',
    '................',
    '................',
  ],
  /* shopfront with scalloped awning + door */
  store: [
    '................',
    '................',
    '..XXXXXXXXXXXX..',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XX..XX..XX..XX..',
    '................',
    '.XXXXXXXXXXXXXX.',
    '.XX..........XX.',
    '.XX...XXXX...XX.',
    '.XX...X..X...XX.',
    '.XX...X..X...XX.',
    '.XX...X..X...XX.',
    '.XX...X..X...XX.',
    '.XXXXXXXXXXXXXX.',
    '................',
  ],
  /* shopping bag */
  bag: [
    '................',
    '................',
    '......XXXX......',
    '.....XX..XX.....',
    '.....XX..XX.....',
    '..XXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '..XXXXXXXXXXXX..',
    '................',
  ],
  /* stacked coins — WTB / money */
  coins: [
    '................',
    '...XXXXXXXXXX...',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '...XXXXXXXXXX...',
    '................',
    '...XXXXXXXXXX...',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '...XXXXXXXXXX...',
    '................',
    '...XXXXXXXXXX...',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '...XXXXXXXXXX...',
    '................',
  ],
  /* clipboard with text lines */
  clipboard: [
    '................',
    '......XXXX......',
    '.....XX..XX.....',
    '..XXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXX.',
    '.XX..........XX.',
    '.XX..XXXXXX..XX.',
    '.XX..........XX.',
    '.XX.XXXXXXXX.XX.',
    '.XX..........XX.',
    '.XX..XXXXX...XX.',
    '.XX..........XX.',
    '.XX..........XX.',
    '.XXXXXXXXXXXXXX.',
    '................',
    '................',
  ],
  /* two opposing arrows — trade / offers */
  swap: [
    '..............XX',
    '............XXXX',
    '..........XXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    '..........XXXXXX',
    '............XXXX',
    '..............XX',
    'XX..............',
    'XXXX............',
    'XXXXXX..........',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXX..........',
    'XXXX............',
    'XX..............',
  ],
  /* shield — verified */
  shield: [
    '................',
    '..XXXXXXXXXXXX..',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    '.XXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXXXX.',
    '..XXXXXXXXXXXX..',
    '..XXXXXXXXXXXX..',
    '...XXXXXXXXXX...',
    '....XXXXXXXX....',
    '.....XXXXXX.....',
    '......XXXX......',
    '................',
  ],
} as const;

export type PixelIconName = keyof typeof GLYPHS;

/** Convert 'X' grid rows into one SVG path (horizontal runs merged). */
function glyphToPath(rows: readonly string[]): string {
  const parts: string[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === 'X') {
        let run = 1;
        while (x + run < row.length && row[x + run] === 'X') run += 1;
        parts.push(`M${x} ${y}h${run}v1h${-run}z`);
        x += run;
      } else {
        x += 1;
      }
    }
  });
  return parts.join('');
}

const PATHS = Object.fromEntries(
  Object.entries(GLYPHS).map(([name, rows]) => [name, glyphToPath(rows)]),
) as Record<PixelIconName, string>;

interface PixelIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: PixelIconName;
}

export function PixelIcon({ name, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
