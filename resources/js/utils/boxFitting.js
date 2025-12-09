/**
 * Box fitting and recommendation utilities
 */

import { packItems, allItemsFit } from './packingAlgorithm'

/**
 * Calculate total volume and max dimensions of items
 * @param {Array} items - Array of items with dimensions
 * @returns {Object} {totalVol, maxW, maxH, maxD}
 */
export function calculateTotalVolume(items) {
    let totalVol = 0
    let maxW = 0, maxH = 0, maxD = 0

    items.forEach(item => {
        const product = item.product || item
        const qty = item.qty || 1
        totalVol += product.w * product.h * product.d * qty
        maxW = Math.max(maxW, product.w)
        maxH = Math.max(maxH, product.h)
        maxD = Math.max(maxD, product.d)
    })

    return { totalVol, maxW, maxH, maxD }
}

/**
 * Check if items fit in a box and calculate efficiency
 * @param {Object} box - Box dimensions
 * @param {Array} items - Items to fit
 * @param {number} padding - Padding thickness
 * @returns {Object} {fits, tight, efficiency, spaceUsage, reason}
 */
export function checkBoxFit(box, items, padding = 0) {
    const availW = box.w - padding * 2
    const availH = box.h - padding * 2
    const availD = box.d - padding * 2
    const boxVol = availW * availH * availD

    const { totalVol, maxW, maxH, maxD } = calculateTotalVolume(items)

    // Check if largest item fits (considering rotations)
    const largestFits = maxW <= availW && maxH <= availH && maxD <= availD ||
                        maxW <= availD && maxH <= availH && maxD <= availW ||
                        maxW <= availW && maxH <= availD && maxD <= availH

    if (!largestFits) {
        return { fits: false, reason: 'too-small', efficiency: 0, spaceUsage: 0 }
    }

    // Volume efficiency (raw volume ratio)
    const volumeEfficiency = (totalVol / boxVol) * 100

    // Space usage calculation
    let spaceUsage
    let totalItems = 0
    items.forEach(item => totalItems += (item.qty || 1))

    if (totalItems === 1 && items.length === 1) {
        // Single item: calculate dimensional fit
        const item = items[0].product || items[0]
        const dims = [item.w, item.h, item.d].sort((a, b) => b - a)
        const boxDims = [availW, availH, availD].sort((a, b) => b - a)

        const dimEfficiency = (dims[0] / boxDims[0]) * (dims[1] / boxDims[1]) * (dims[2] / boxDims[2])
        spaceUsage = dimEfficiency * 100
    } else {
        spaceUsage = volumeEfficiency
    }

    if (volumeEfficiency > 85) {
        return { fits: true, tight: true, efficiency: volumeEfficiency, spaceUsage }
    } else if (volumeEfficiency > 100) {
        return { fits: false, reason: 'volume', efficiency: volumeEfficiency, spaceUsage }
    } else {
        return { fits: true, tight: false, efficiency: volumeEfficiency, spaceUsage }
    }
}

/**
 * Score and rank boxes for given items
 * @param {Array} boxes - Available boxes
 * @param {Array} items - Items to fit
 * @param {number} padding - Padding thickness
 * @returns {Array} Sorted array of {box, fit, actuallyFits, score}
 */
export function rankBoxes(boxes, items, padding = 0) {
    if (!items.length) return []

    const scoredBoxes = boxes.map(box => {
        const fit = checkBoxFit(box, items, padding)
        const placements = packItems(items, box, padding)
        const actuallyFits = allItemsFit(placements)

        return {
            box,
            fit,
            actuallyFits,
            placements,
            score: actuallyFits ? (fit.efficiency > 30 ? 150 - fit.efficiency : 50 - fit.efficiency) : -1000
        }
    })

    // Sort: fitting boxes first (by efficiency desc), then non-fitting
    scoredBoxes.sort((a, b) => {
        if (a.actuallyFits && !b.actuallyFits) return -1
        if (!a.actuallyFits && b.actuallyFits) return 1
        if (a.actuallyFits && b.actuallyFits) {
            return b.fit.efficiency - a.fit.efficiency
        }
        return 0
    })

    return scoredBoxes
}

/**
 * Find the best fitting box
 * @param {Array} boxes - Available boxes
 * @param {Array} items - Items to fit
 * @param {number} padding - Padding thickness
 * @returns {Object|null} Best box or null
 */
export function findBestBox(boxes, items, padding = 0) {
    const ranked = rankBoxes(boxes, items, padding)
    const bestFit = ranked.find(sb => sb.actuallyFits)
    return bestFit ? bestFit.box : null
}

export default {
    calculateTotalVolume,
    checkBoxFit,
    rankBoxes,
    findBestBox
}
