/**
 * Pricing utility functions for box calculations
 * Prices are in IQD (thousands) - "الف" means thousand
 */

/**
 * Get price for a quantity tier
 * @param {Object} box - Box object with prices
 * @param {number} qty - Quantity to order
 * @returns {number} Price in thousands (IQD)
 */
export function getBoxPrice(box, qty) {
    if (!box.prices) return 0
    const tiers = Object.keys(box.prices).map(Number).sort((a, b) => a - b)
    // Find best tier (largest tier <= qty, or smallest if qty is less than all)
    let bestTier = tiers[0]
    for (const tier of tiers) {
        if (qty >= tier) bestTier = tier
    }
    return box.prices[bestTier]
}

/**
 * Calculate unit price based on quantity
 * @param {Object} box - Box object with prices
 * @param {number} qty - Quantity to order
 * @returns {number} Price per box in IQD
 */
export function getUnitPrice(box, qty) {
    if (!box.prices) return 0
    const tierPrice = getBoxPrice(box, qty)
    const tiers = Object.keys(box.prices).map(Number).sort((a, b) => a - b)
    let bestTier = tiers[0]
    for (const tier of tiers) {
        if (qty >= tier) bestTier = tier
    }
    return (tierPrice * 1000) / bestTier // Price per box in IQD
}

/**
 * Format price in IQD
 * @param {number} priceInThousands - Price in thousands
 * @returns {string} Formatted price string
 */
export function formatPrice(priceInThousands) {
    if (priceInThousands >= 1000) {
        return (priceInThousands / 1000).toFixed(1) + 'M'
    }
    return priceInThousands + 'K'
}

/**
 * Round quantity up to nearest supplier tier
 * @param {number} qty - Raw quantity needed
 * @param {Object} box - Box object with prices
 * @returns {number} Rounded quantity matching a tier
 */
export function roundToTier(qty, box) {
    if (qty <= 0) return 0
    if (!box.prices) return qty

    const tiers = Object.keys(box.prices).map(Number).sort((a, b) => a - b)

    // Find the smallest tier that is >= qty
    for (const tier of tiers) {
        if (tier >= qty) return tier
    }

    // If qty exceeds all tiers, round up to multiple of largest tier
    const largestTier = tiers[tiers.length - 1]
    return Math.ceil(qty / largestTier) * largestTier
}

/**
 * Calculate total cost for a quantity at the best tier
 * @param {Object} box - Box object with prices
 * @param {number} qty - Quantity to order
 * @returns {number} Total cost in thousands (IQD)
 */
export function calculateTotalCost(box, qty) {
    if (!box.prices || qty <= 0) return 0

    const tiers = Object.keys(box.prices).map(Number).sort((a, b) => a - b)
    let bestTier = tiers[0]
    for (const tier of tiers) {
        if (qty >= tier) bestTier = tier
    }

    const fullTiers = Math.floor(qty / bestTier)
    return fullTiers * box.prices[bestTier]
}

export default {
    getBoxPrice,
    getUnitPrice,
    formatPrice,
    roundToTier,
    calculateTotalCost
}
