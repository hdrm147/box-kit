/**
 * Stock Manager - localStorage-based inventory tracking
 * Later can be migrated to database API
 */

const STORAGE_KEY = 'boxkit_stock'
const SETTINGS_KEY = 'boxkit_settings'

/**
 * Get all stock data
 * @returns {Object} { supplier: string, boxes: { [boxId]: number } }
 */
export function getStock() {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) {
            return { supplier: 'satar', boxes: {} }
        }
        return JSON.parse(data)
    } catch (e) {
        console.error('[BoxKit] Failed to load stock:', e)
        return { supplier: 'satar', boxes: {} }
    }
}

/**
 * Save stock data
 * @param {Object} stock - { supplier: string, boxes: { [boxId]: number } }
 */
export function saveStock(stock) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stock))
        // Dispatch event for reactive updates
        window.dispatchEvent(new CustomEvent('boxkit-stock-updated', { detail: stock }))
    } catch (e) {
        console.error('[BoxKit] Failed to save stock:', e)
    }
}

/**
 * Get quantity for a specific box
 * @param {string} boxId - Box ID
 * @returns {number} Quantity in stock (0 if not found)
 */
export function getBoxStock(boxId) {
    const stock = getStock()
    return stock.boxes[boxId] || 0
}

/**
 * Set quantity for a specific box
 * @param {string} boxId - Box ID
 * @param {number} qty - Quantity
 */
export function setBoxStock(boxId, qty) {
    const stock = getStock()
    if (qty > 0) {
        stock.boxes[boxId] = qty
    } else {
        delete stock.boxes[boxId]
    }
    saveStock(stock)
}

/**
 * Update multiple box quantities
 * @param {Object} updates - { [boxId]: number }
 */
export function updateStock(updates) {
    const stock = getStock()
    for (const [boxId, qty] of Object.entries(updates)) {
        if (qty > 0) {
            stock.boxes[boxId] = qty
        } else {
            delete stock.boxes[boxId]
        }
    }
    saveStock(stock)
}

/**
 * Check if a box is in stock
 * @param {string} boxId - Box ID
 * @returns {boolean}
 */
export function isInStock(boxId) {
    return getBoxStock(boxId) > 0
}

/**
 * Filter boxes to only those in stock
 * @param {Array} boxes - Array of box objects
 * @returns {Array} Filtered boxes that are in stock
 */
export function filterInStock(boxes) {
    const stock = getStock()
    return boxes.filter(box => (stock.boxes[box.id] || 0) > 0)
}

/**
 * Get boxes with stock info attached
 * @param {Array} boxes - Array of box objects
 * @returns {Array} Boxes with stockQty property added
 */
export function attachStockInfo(boxes) {
    const stock = getStock()
    return boxes.map(box => ({
        ...box,
        stockQty: stock.boxes[box.id] || 0,
        inStock: (stock.boxes[box.id] || 0) > 0
    }))
}

/**
 * Check if any stock is configured
 * @returns {boolean}
 */
export function hasAnyStock() {
    const stock = getStock()
    return Object.keys(stock.boxes).length > 0
}

/**
 * Clear all stock data
 */
export function clearStock() {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('boxkit-stock-updated', { detail: { supplier: 'satar', boxes: {} } }))
}

/**
 * Get stock summary
 * @returns {Object} { totalBoxes: number, uniqueSizes: number, byTier: {} }
 */
export function getStockSummary() {
    const stock = getStock()
    const boxes = stock.boxes

    let totalBoxes = 0
    const uniqueSizes = Object.keys(boxes).length

    for (const qty of Object.values(boxes)) {
        totalBoxes += qty
    }

    return {
        totalBoxes,
        uniqueSizes,
        supplier: stock.supplier
    }
}

// Settings management

/**
 * Get BoxKit settings
 */
export function getSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY)
        if (!data) {
            return {
                stockFilterEnabled: true, // Default: only show in-stock boxes
                showOutOfStock: false,    // Show grayed out boxes not in stock
                defaultSupplier: 'satar',
                courierTiersEnabled: true
            }
        }
        return JSON.parse(data)
    } catch (e) {
        return {
            stockFilterEnabled: true,
            showOutOfStock: false,
            defaultSupplier: 'satar',
            courierTiersEnabled: true
        }
    }
}

/**
 * Save BoxKit settings
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
        window.dispatchEvent(new CustomEvent('boxkit-settings-updated', { detail: settings }))
    } catch (e) {
        console.error('[BoxKit] Failed to save settings:', e)
    }
}

/**
 * Update a single setting
 */
export function updateSetting(key, value) {
    const settings = getSettings()
    settings[key] = value
    saveSettings(settings)
}

export default {
    getStock,
    saveStock,
    getBoxStock,
    setBoxStock,
    updateStock,
    isInStock,
    filterInStock,
    attachStockInfo,
    hasAnyStock,
    clearStock,
    getStockSummary,
    getSettings,
    saveSettings,
    updateSetting
}