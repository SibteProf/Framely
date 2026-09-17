export type FilterDef = {
  id: string;
  label: string;
  matrix: number[];
};

// 4x5 row-major color matrices consumed by Skia's <ColorMatrix />.
const IDENTITY = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

export const FILTERS: FilterDef[] = [
  { id: 'original', label: 'Original', matrix: IDENTITY },
  {
    id: 'mono',
    label: 'Mono',
    matrix: [
      0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'vivid',
    label: 'Vivid',
    matrix: [
      1.3935, -0.3575, -0.036, 0, 0, -0.1065, 1.1425, -0.036, 0, 0, -0.1065,
      -0.3575, 1.464, 0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'warm',
    label: 'Warm',
    matrix: [
      1.15, 0, 0, 0, 0.04, 0, 1.02, 0, 0, 0.01, 0, 0, 0.82, 0, -0.03, 0, 0, 0,
      1, 0,
    ],
  },
  {
    id: 'cool',
    label: 'Cool',
    matrix: [
      0.86, 0, 0, 0, -0.02, 0, 1.0, 0, 0, 0, 0, 0, 1.22, 0, 0.03, 0, 0, 0, 1,
      0,
    ],
  },
  {
    id: 'fade',
    label: 'Fade',
    matrix: [
      0.88, 0.08, 0.08, 0, 0.06, 0.08, 0.88, 0.08, 0, 0.06, 0.08, 0.08, 0.88,
      0, 0.06, 0, 0, 0, 1, 0,
    ],
  },
];
