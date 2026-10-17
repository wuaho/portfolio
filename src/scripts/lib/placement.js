const EDGE_MARGIN_PX = 16;
const GRID_STEPS = 6;

function overlapArea(a, b) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

function range(size, viewportSize) {
  const room = viewportSize - size;
  const margin = room >= EDGE_MARGIN_PX * 2 ? EDGE_MARGIN_PX : 0;
  return [margin, Math.max(margin, room - margin)];
}

// Picks the top-left corner for a window of `size` inside `viewport` that
// overlaps the `occupied` rects (DOMRect-like) the least. Ties go to the spot
// closest to the viewport center.
export function findFreeSpot(size, occupied, viewport) {
  const [minX, maxX] = range(size.width, viewport.width);
  const [minY, maxY] = range(size.height, viewport.height);
  const center = {
    x: (viewport.width - size.width) / 2,
    y: (viewport.height - size.height) / 2,
  };

  let best = null;
  for (let row = 0; row <= GRID_STEPS; row += 1) {
    for (let column = 0; column <= GRID_STEPS; column += 1) {
      const x = minX + ((maxX - minX) * column) / GRID_STEPS;
      const y = minY + ((maxY - minY) * row) / GRID_STEPS;
      const rect = {
        left: x,
        top: y,
        right: x + size.width,
        bottom: y + size.height,
      };
      const overlap = occupied.reduce(
        (sum, other) => sum + overlapArea(rect, other),
        0,
      );
      const distance = Math.hypot(x - center.x, y - center.y);

      if (
        !best ||
        overlap < best.overlap ||
        (overlap === best.overlap && distance < best.distance)
      ) {
        best = { x, y, overlap, distance };
      }
    }
  }

  return { x: Math.round(best.x), y: Math.round(best.y) };
}
