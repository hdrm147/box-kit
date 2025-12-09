/**
 * Pareto-based purchase advisor calculations
 * Implements 80/20 rule for optimal box stock recommendations
 */

import { orderPatterns, sizeRanges } from '../data/orderPatterns'
import { roundToTier, calculateTotalCost } from './pricingFunctions'

/**
 * Find the best matching box from supplier inventory for a recommended size
 * @param {string} recommendedSize - Size category (xs, s, m, l, xl, etc.)
 * @param {Array} boxes - Available boxes from supplier
 * @returns {Object|null} Best matching box
 */
export function findBestMatchingBox(recommendedSize, boxes) {
    const range = sizeRanges[recommendedSize] || { maxVol: 10000 }

    let bestBox = null
    let bestScore = Infinity

    boxes.forEach(box => {
        const vol = box.w * box.h * box.d
        const minVol = range.minVol || 0
        const maxVol = range.maxVol || Infinity

        if (vol >= minVol && vol <= maxVol) {
            const score = Math.abs(vol - (maxVol || vol))
            if (score < bestScore) {
                bestScore = score
                bestBox = box
            }
        }
    })

    // Fallback to closest match if no exact range match
    if (!bestBox) {
        const targetVol = sizeRanges[recommendedSize]?.maxVol || 10000
        boxes.forEach(box => {
            const vol = box.w * box.h * box.d
            const score = Math.abs(vol - targetVol)
            if (score < bestScore) {
                bestScore = score
                bestBox = box
            }
        })
    }

    return bestBox
}

/**
 * Calculate initial stock recommendations using Pareto principle
 * @param {Object} options - Configuration options
 * @param {number} options.monthlyOrders - Expected monthly orders
 * @param {number} options.safetyBuffer - Safety buffer percentage (0-100)
 * @param {Array} options.boxes - Available boxes from supplier
 * @returns {Object} Recommendations and statistics
 */
export function calculateInitialStock({ monthlyOrders = 100, safetyBuffer = 20, boxes }) {
    const bufferMultiplier = 1 + (safetyBuffer / 100)

    // Initialize box needs
    const boxNeeds = {}
    boxes.forEach(box => {
        boxNeeds[box.id] = 0
    })

    // Simulate order distribution using realistic order types
    orderPatterns.forEach(orderType => {
        const ordersOfType = monthlyOrders * orderType.weight
        const matchingBox = findBestMatchingBox(orderType.recommendedBox, boxes)
        if (matchingBox) {
            boxNeeds[matchingBox.id] += ordersOfType
        }
    })

    // Apply safety buffer and round up to tier quantities
    const recommendations = []
    let totalBoxes = 0
    let totalCost = 0

    boxes.forEach(box => {
        const rawNeed = boxNeeds[box.id]
        let withBuffer = Math.ceil(rawNeed * bufferMultiplier)

        // Round up to nearest tier
        if (withBuffer > 0) {
            withBuffer = roundToTier(withBuffer, box)
        }

        if (withBuffer > 0) {
            const cost = calculateTotalCost(box, withBuffer)

            recommendations.push({
                box,
                quantity: withBuffer,
                rawNeed: Math.round(rawNeed),
                coverage: (rawNeed / monthlyOrders) * 100,
                cost
            })
            totalBoxes += withBuffer
            totalCost += cost
        }
    })

    // Sort by quantity (most needed first) - Pareto approach
    recommendations.sort((a, b) => b.quantity - a.quantity)

    // Calculate Pareto coverage (how many box types cover 80% of needs)
    let cumulativeCoverage = 0
    let paretoCount = 0
    const totalCoverage = recommendations.reduce((sum, r) => sum + r.coverage, 0)

    for (const rec of recommendations) {
        cumulativeCoverage += rec.coverage
        paretoCount++
        if (cumulativeCoverage >= totalCoverage * 0.8) break
    }

    // Mark priority levels
    recommendations.forEach((rec, index) => {
        if (index < paretoCount) {
            rec.priority = 'high'
        } else if (rec.quantity >= 10) {
            rec.priority = 'medium'
        } else {
            rec.priority = 'low'
        }
    })

    return {
        recommendations,
        stats: {
            monthlyOrders,
            totalBoxes,
            totalCost,
            paretoCount,
            paretoCoverage: Math.min(cumulativeCoverage, totalCoverage),
            totalCoverage,
            uniqueSizes: recommendations.length
        }
    }
}

export default {
    findBestMatchingBox,
    calculateInitialStock
}
