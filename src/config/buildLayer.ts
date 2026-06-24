/** Increment after each layer is approved: 1 → 2 → 3 → 4 → 5 */
export const BUILD_LAYER = 5

export function isLayerActive(layer: number): boolean {
  return BUILD_LAYER >= layer
}

/** Max lesson step number available at current build layer */
export function maxStepNumber(): number {
  if (BUILD_LAYER >= 2) return 5
  return 3
}
