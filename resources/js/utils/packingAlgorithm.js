/**
 * 3D Bin Packing Algorithm
 * Items are placed using a footprint-minimizing heuristic that prefers stacking
 */

/**
 * Pack items into a box using 3D bin packing
 * @param {Array} items - Array of items with {product, qty}
 * @param {Object} box - Box dimensions {w, h, d}
 * @param {number} padding - Padding thickness in cm
 * @returns {Array} Array of placements with positions or overflow flag
 */
export function packItems(items, box, padding = 0) {
    if (!items.length || !box) return []

    const availableW = box.w - padding * 2
    const availableH = box.h - padding * 2
    const availableD = box.d - padding * 2

    // Expand items by quantity and sort by base area (largest footprint first)
    let expandedItems = []
    items.forEach(item => {
        const product = item.product || item
        const qty = item.qty || 1
        for (let i = 0; i < qty; i++) {
            expandedItems.push({
                ...product,
                volume: product.w * product.h * product.d,
                baseArea: product.w * product.d,
                originalColor: product.color || '#94a3b8'
            })
        }
    })

    // Sort by base area (largest footprint first for stable stacking)
    expandedItems.sort((a, b) => b.baseArea - a.baseArea)

    const placements = []

    // Track occupied spaces as boxes [x, y, z, w, h, d]
    const occupied = []

    // Helper: check if position collides with any placed item
    function collides(x, y, z, w, h, d) {
        for (const o of occupied) {
            const [ox, oy, oz, ow, oh, od] = o
            if (x < ox + ow && x + w > ox &&
                y < oy + oh && y + h > oy &&
                z < oz + od && z + d > oz) {
                return true
            }
        }
        return false
    }

    // Helper: find the floor level at a given x,z position
    function getFloorAt(x, z, w, d) {
        let maxY = padding
        for (const o of occupied) {
            const [ox, oy, oz, ow, oh, od] = o
            // Check if this occupied space is under our footprint
            if (x < ox + ow && x + w > ox && z < oz + od && z + d > oz) {
                maxY = Math.max(maxY, oy + oh)
            }
        }
        return maxY
    }

    // Calculate current footprint extent
    function getCurrentExtent() {
        if (occupied.length === 0) return { maxX: 0, maxZ: 0 }
        return {
            maxX: Math.max(...occupied.map(o => o[0] + o[3])),
            maxZ: Math.max(...occupied.map(o => o[2] + o[5]))
        }
    }

    for (const item of expandedItems) {
        // Generate all 6 orientations
        const allOrientations = [
            { w: item.w, h: item.h, d: item.d },
            { w: item.d, h: item.h, d: item.w },
            { w: item.w, h: item.d, d: item.h },
            { w: item.h, h: item.w, d: item.d },
            { w: item.d, h: item.w, d: item.h },
            { w: item.h, h: item.d, d: item.w },
        ]

        // Sort orientations to prefer FLAT placement (smallest dimension as height)
        const orientations = allOrientations.sort((a, b) => {
            // Prefer smaller height (flat orientation)
            if (a.h !== b.h) return a.h - b.h
            // If same height, prefer larger base area (more stable)
            return (b.w * b.d) - (a.w * a.d)
        })

        let bestPlacement = null
        let bestScore = Infinity

        // Try each orientation
        for (const orient of orientations) {
            if (orient.w > availableW || orient.d > availableD) continue

            // Scan for valid positions (grid-based)
            const step = 2 // cm step for scanning
            for (let z = 0; z <= availableD - orient.d; z += step) {
                for (let x = 0; x <= availableW - orient.w; x += step) {
                    // Find the floor level at this position
                    const floorY = getFloorAt(x, z, orient.w, orient.d)

                    // Check if item fits in height
                    if (floorY + orient.h > box.h - padding) continue

                    // Check for collisions
                    if (!collides(x, floorY, z, orient.w, orient.h, orient.d)) {
                        // Calculate score: prefer positions that minimize footprint
                        const currentExtent = getCurrentExtent()
                        const newMaxX = Math.max(currentExtent.maxX, x + orient.w)
                        const newMaxZ = Math.max(currentExtent.maxZ, z + orient.d)
                        const newFootprint = newMaxX * newMaxZ

                        // Score favors:
                        // 1. Smaller footprint (stacking on existing items)
                        // 2. If footprint is same, prefer back-left corner (smaller x, z)
                        // 3. Slight preference for stacking (higher floorY) at same footprint
                        const score = newFootprint * 10000 + x + z * 100 - floorY * 10

                        if (score < bestScore) {
                            bestScore = score
                            bestPlacement = {
                                item,
                                x: x - availableW / 2 + orient.w / 2,
                                y: floorY + orient.h / 2,
                                z: z - availableD / 2 + orient.d / 2,
                                w: orient.w,
                                h: orient.h,
                                d: orient.d,
                                rawX: x,
                                rawY: floorY,
                                rawZ: z
                            }
                        }
                    }
                }
            }
        }

        if (bestPlacement) {
            placements.push(bestPlacement)
            occupied.push([
                bestPlacement.rawX,
                bestPlacement.rawY,
                bestPlacement.rawZ,
                bestPlacement.w,
                bestPlacement.h,
                bestPlacement.d
            ])
        } else {
            // Item doesn't fit - mark as overflow
            placements.push({
                item,
                overflow: true
            })
        }
    }

    return placements
}

/**
 * Check if all items fit in the box
 * @param {Array} placements - Result from packItems
 * @returns {boolean} True if all items fit
 */
export function allItemsFit(placements) {
    return !placements.some(p => p.overflow)
}

/**
 * Count overflow items
 * @param {Array} placements - Result from packItems
 * @returns {number} Number of items that don't fit
 */
export function countOverflow(placements) {
    return placements.filter(p => p.overflow).length
}

export default {
    packItems,
    allItemsFit,
    countOverflow
}
