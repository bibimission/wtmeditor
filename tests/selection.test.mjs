import test from "node:test";
import assert from "node:assert/strict";
import { neighbourAfterRemoval, nextSelection } from "../src/shared/selection.js";

const visible = [1, 2, 3, 4, 5];

test("a click selects only this media", () => {
  assert.deepEqual(nextSelection([1, 2], visible, 3), [3]);
});

test("Ctrl+click adds or removes a media", () => {
  assert.deepEqual(nextSelection([1], visible, 3, { ctrl: true }), [1, 3]);
  assert.deepEqual(nextSelection([1, 3], visible, 3, { ctrl: true }), [1]);
});

test("Shift+click selects a range, in both directions", () => {
  assert.deepEqual(nextSelection([2], visible, 4, { shift: true, anchor: 2 }), [2, 3, 4]);
  assert.deepEqual(nextSelection([4], visible, 2, { shift: true, anchor: 4 }), [2, 3, 4]);
});

test("Ctrl+Shift+click extends the selection", () => {
  assert.deepEqual(nextSelection([5], visible, 2, { ctrl: true, shift: true, anchor: 1 }), [5, 1, 2]);
});

test("Shift+click without a visible anchor acts as a click", () => {
  assert.deepEqual(nextSelection([], visible, 2, { shift: true, anchor: 99 }), [2]);
});

test("after a removal, the next media is chosen, or the previous one at the end", () => {
  assert.equal(neighbourAfterRemoval([2, 3], visible), 4);
  assert.equal(neighbourAfterRemoval([4, 5], visible), 3);
  assert.equal(neighbourAfterRemoval(visible, visible), null);
});
