/**
 * Courier shipping tiers
 * Dimensions are max allowed (L×W×H), sorted largest to smallest for comparison
 */

export const courierTiers = [
    {
        id: 'small',
        name: 'صغير',
        nameEn: 'Small',
        // Max dimensions - will be sorted for comparison
        maxW: 60,
        maxD: 40,
        maxH: 35,
        maxWeight: 20, // kg
        color: '#fbbf24' // yellow
    },
    {
        id: 'medium',
        name: 'متوسط',
        nameEn: 'Medium',
        maxW: 80,
        maxD: 60,
        maxH: 50,
        maxWeight: 40,
        color: '#3b82f6' // blue
    },
    {
        id: 'large',
        name: 'كبير',
        nameEn: 'Large',
        maxW: 100,
        maxD: 80,
        maxH: 70,
        maxWeight: 60,
        color: '#8b5cf6' // purple
    },
    {
        id: 'xlarge',
        name: 'كبير جداً',
        nameEn: 'Extra Large',
        maxW: 100,
        maxD: 80,
        maxH: 70,
        maxWeight: Infinity, // 60kg+
        color: '#ef4444' // red
    }
]

/**
 * Get sorted dimensions array (largest first)
 */
function sortDims(w, h, d) {
    return [w, h, d].sort((a, b) => b - a)
}

/**
 * Check if a box fits within a courier tier
 * Compares sorted dimensions (rotation allowed)
 */
export function boxFitsTier(box, tier) {
    const boxDims = sortDims(box.w, box.h, box.d)
    const tierDims = sortDims(tier.maxW, tier.maxH, tier.maxD)

    return boxDims[0] <= tierDims[0] &&
           boxDims[1] <= tierDims[1] &&
           boxDims[2] <= tierDims[2]
}

/**
 * Find the smallest tier that fits a box
 */
export function getBoxTier(box) {
    for (const tier of courierTiers) {
        if (boxFitsTier(box, tier)) {
            return tier
        }
    }
    return null // Box too large for any tier
}

/**
 * Get all supplier boxes that fit within a specific tier
 */
export function getBoxesForTier(boxes, tierId) {
    const tier = courierTiers.find(t => t.id === tierId)
    if (!tier) return boxes

    return boxes.filter(box => boxFitsTier(box, tier))
}

/**
 * Analyze which supplier boxes fit each tier
 */
export function analyzeBoxesByTier(boxes) {
    const analysis = {}

    for (const tier of courierTiers) {
        const fittingBoxes = boxes.filter(box => boxFitsTier(box, tier))
        analysis[tier.id] = {
            tier,
            boxes: fittingBoxes,
            count: fittingBoxes.length
        }
    }

    return analysis
}

/**
 * Get recommended boxes for each tier (largest that fits)
 */
export function getRecommendedBoxesPerTier(boxes) {
    const recommendations = []

    for (const tier of courierTiers) {
        const fittingBoxes = boxes
            .filter(box => boxFitsTier(box, tier))
            .sort((a, b) => (b.w * b.h * b.d) - (a.w * a.h * a.d))

        if (fittingBoxes.length > 0) {
            // Get largest box that fits this tier
            const largest = fittingBoxes[0]
            // Check if it's not already recommended for a smaller tier
            const alreadyRecommended = recommendations.some(r => r.box.id === largest.id)

            if (!alreadyRecommended) {
                recommendations.push({
                    tier,
                    box: largest,
                    volume: largest.w * largest.h * largest.d
                })
            }
        }
    }

    return recommendations
}

export default {
    courierTiers,
    boxFitsTier,
    getBoxTier,
    getBoxesForTier,
    analyzeBoxesByTier,
    getRecommendedBoxesPerTier
}