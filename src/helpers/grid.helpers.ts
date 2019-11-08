export const DEFAULT_NUM_COLS = 4;
export const DEFAULT_NUM_ROWS = 3;
export const DEFAULT_CELL_SIZE = 1;

export const DEFAULT_GRID = {
  numRows: DEFAULT_NUM_ROWS,
  numCols: DEFAULT_NUM_COLS,
  cellSize: DEFAULT_CELL_SIZE,
};

const convertFromOneGridToAnother = (
  n: number,
  currentTotal: number,
  desiredTotal: number
) => n - (currentTotal - desiredTotal) / 2;

/**
 * With Mapping Extensions, we need to move between two different grid systems:
 * - The normal game system, which has columns from 0-3, rows from 0-2
 * - Our custom grid, which can have any number of columns or rows.
 *
 * For example, in an 8x3 grid (2 extra columns on each side), the top-left
 * corner would have a position of [0,2] in our custom grid, but that
 * translates to a position of [-2,2] in our natural game grid.
 *
 * This function converts from our custom grid [0,2] to a standard grid [-2,2]
 */
export const convertGridIndicesToNaturalGrid = (
  colIndex: number,
  numCols: number,
  rowIndex?: number,
  numRows?: number,
  cellSize: number = 1
) => {
  // Sometimes we only care about columns, not rows.
  if (typeof rowIndex === 'undefined' || typeof numRows === 'undefined') {
    return [convertFromOneGridToAnother(colIndex, numCols, DEFAULT_NUM_COLS)];
  }

  // Normally, we have 4 columns and 3 rows.
  // If the user has tweaked that grid, we need to convert to the 4x3 system
  // the game actually uses.
  return [
    convertFromOneGridToAnother(colIndex, numCols, DEFAULT_NUM_COLS),
    convertFromOneGridToAnother(rowIndex, numRows, DEFAULT_NUM_ROWS),
  ];
};

// TODO: Roll this into `convertGridIndicesToNaturalGrid`
export const getCellCoordinates = (
  colIndex: number,
  rowIndex: number,
  colWidth: number,
  rowHeight: number
) => {
  const values = [
    { index: colIndex, ratio: colWidth },
    { index: rowIndex, ratio: rowHeight },
  ];

  const transformedValues = values.map(({ index, ratio }) => {
    // Normally, each cell is 1x1 width x height.
    // If our columns are 0.5 width, the ratio is 0.5.
    // First we need to find out what that means for the offset of the 0 cell.
    // The formula for that is y = -1.5x + 1.5, where `y` is the new offset and `x` is the ratio.

    const offset = -1.5 * ratio + 1.5;

    // our formula to find the new x or y position, then, is:
    // y = ratio * index + offset

    const newValue = ratio * index + offset;

    return newValue;
  });

  return transformedValues;
};
