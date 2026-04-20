export function renderPointers(
  container: HTMLElement,
  pointers: Record<string, number>,
  arrayLength: number,
): void {
  const lane = document.createElement('div');
  lane.className = 'pointer-lane';
  lane.style.gridTemplateColumns = `repeat(${Math.max(arrayLength, 1)}, minmax(72px, 1fr))`;

  for (const [name, index] of Object.entries(pointers)) {
    const marker = document.createElement('div');
    marker.className = 'pointer';
    marker.textContent = name;
    marker.style.gridColumn = String(index + 1);
    lane.append(marker);
  }

  container.append(lane);
}