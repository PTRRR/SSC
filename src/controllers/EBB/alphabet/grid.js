export function createGrid (gap, offsetX, offsetY) {
  return [
    `G1 X${gap * 0 + offsetX} Y${gap * 0 + offsetY}`,
    `G1 X${gap * 0 + offsetX} Y${gap * 1 + offsetY}`,
    `G1 X${gap * 0 + offsetX} Y${gap * 2 + offsetY}`,
    `G1 X${gap * 0 + offsetX} Y${gap * 3 + offsetY}`,

    `G1 X${gap * 1 + offsetX} Y${gap * 0 + offsetY}`,
    `G1 X${gap * 1 + offsetX} Y${gap * 1 + offsetY}`,
    `G1 X${gap * 1 + offsetX} Y${gap * 2 + offsetY}`,
    `G1 X${gap * 1 + offsetX} Y${gap * 3 + offsetY}`,

    `G1 X${gap * 2 + offsetX} Y${gap * 0 + offsetY}`,
    `G1 X${gap * 2 + offsetX} Y${gap * 1 + offsetY}`,
    `G1 X${gap * 2 + offsetX} Y${gap * 2 + offsetY}`,
    `G1 X${gap * 2 + offsetX} Y${gap * 3 + offsetY}`
  ]
}
