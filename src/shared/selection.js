// Selection rules of the media grid: click, Ctrl+click and Shift+click.
export function nextSelection(selected, visible, clicked, { ctrl = false, shift = false, anchor = null } = {}) {
  if (shift && visible.includes(anchor)) {
    const from = visible.indexOf(anchor);
    const to = visible.indexOf(clicked);
    const range = visible.slice(Math.min(from, to), Math.max(from, to) + 1);
    return ctrl ? [...new Set([...selected, ...range])] : range;
  }
  if (ctrl) {
    return selected.includes(clicked) ? selected.filter((id) => id !== clicked) : [...selected, clicked];
  }
  return [clicked];
}

// What stays on screen after the deletion of the selection.
export function neighbourAfterRemoval(selected, visible) {
  const last = Math.max(...selected.map((id) => visible.indexOf(id)));
  const remaining = (id) => !selected.includes(id);
  return visible.slice(last + 1).find(remaining) ?? visible.slice(0, last).reverse().find(remaining) ?? null;
}
