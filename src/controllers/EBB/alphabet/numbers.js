import { createGrid } from './grid'

export function number (number, gap, x, y) {
  const grid = createGrid(gap, x, y)
  switch (number) {
  case 0:
    return [
      'G10',
      grid[1],
      'G11',
      grid[2],
      grid[7],
      grid[10],
      grid[9],
      grid[4],
      grid[1]
    ]
  case 1:
    return [
      'G10',
      grid[1],
      'G11',
      grid[8],
      grid[11]
    ]
  case 2:
    return [
      'G10',
      grid[1],
      'G11',
      grid[4],
      grid[9],
      grid[3],
      grid[11]
    ]
  case 3:
    return [
      'G10',
      grid[1],
      'G11',
      grid[4],
      grid[9],
      grid[5],
      grid[10],
      grid[7],
      grid[2]
    ]
  }
}
