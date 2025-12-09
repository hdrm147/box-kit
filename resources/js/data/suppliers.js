/**
 * Suppliers and box definitions with tiered pricing in IQD (thousands)
 * Dimensions: Length × Width × Height in cm
 */

export const suppliers = {
    satar: {
        id: 'satar',
        name: 'Satar',
        phone: '07712394656',
        boxes: [
            // Laptop-style boxes (بوكس شكل لابتوب) - 3 layers
            { id: 'satar-15x10x5', name: '15×10×5', w: 15, h: 5, d: 10, type: 'laptop', layers: 3, colors: ['white', 'brown', 'red', 'pink'],
              prices: { 25: 13, 50: 24, 100: 44, 200: 84, 500: 205, 1000: 390, 2000: 760 }, typical: 'NVMe, Small accessories' },
            { id: 'satar-15x10x6', name: '15×10×6', w: 15, h: 6, d: 10, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 13, 50: 24, 100: 44, 200: 84, 500: 205, 1000: 390, 2000: 760 }, typical: 'SSD, Small items' },
            { id: 'satar-23x13x10', name: '23×13×10', w: 23, h: 10, d: 13, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 14, 50: 26, 100: 48, 200: 90, 500: 218, 1000: 415, 2000: 810 }, typical: 'CPU, RAM kits' },
            { id: 'satar-25x17x7', name: '25×17×7', w: 25, h: 7, d: 17, type: 'laptop', layers: 3, colors: ['pink', 'black', 'turquoise', 'blue'],
              prices: { 25: 18, 50: 33, 100: 54, 200: 99, 500: 240, 1000: 455, 2000: 900 }, typical: 'RAM, Small peripherals' },
            { id: 'satar-25x20x10', name: '25×20×10', w: 25, h: 10, d: 20, type: 'laptop', layers: 3, colors: ['pink', 'red', 'black'],
              prices: { 25: 22, 50: 39, 100: 69, 200: 133, 500: 324, 1000: 630, 2000: 1240 }, typical: 'CPU+Cooler, PSU SFX' },
            { id: 'satar-25x25x5', name: '25×25×5', w: 25, h: 5, d: 25, type: 'laptop', layers: 3, colors: ['white'],
              prices: { 25: 19, 50: 34, 100: 67, 200: 128, 500: 320, 1000: 622, 2000: 1210 }, typical: 'Flat items, Keyboards' },
            { id: 'satar-25x25x12', name: '25×25×12', w: 25, h: 12, d: 25, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 19, 50: 32, 100: 60, 200: 115, 500: 282, 1000: 537, 2000: 1056 }, typical: 'ITX Motherboard' },
            { id: 'satar-30x25x12', name: '30×25×12', w: 30, h: 12, d: 25, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 21, 50: 36, 100: 68, 200: 132, 500: 325, 1000: 640, 2000: 1260 }, typical: 'mATX Motherboard' },
            { id: 'satar-35x26x5', name: '35×26×5', w: 35, h: 5, d: 26, type: 'laptop', layers: 3, colors: ['white'],
              prices: { 25: 21, 50: 37, 100: 71, 200: 135, 500: 325, 1000: 625, 2000: 1220 }, typical: 'Full Keyboard' },
            { id: 'satar-35x26x10', name: '35×26×10', w: 35, h: 10, d: 26, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 21, 50: 36, 100: 68, 200: 132, 500: 325, 1000: 640, 2000: 1260 }, typical: 'GPU Compact' },
            { id: 'satar-45x35x10', name: '45×35×10', w: 45, h: 10, d: 35, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 23, 50: 40, 100: 74, 200: 144, 500: 352, 1000: 680, 2000: 1349 }, typical: 'GPU Mid-range, ATX Mobo' },

            // Regular boxes (بوكس الصندوق) - various layers
            { id: 'satar-25x25x20-3', name: '25×25×20 (3L)', w: 25, h: 20, d: 25, type: 'regular', layers: 3,
              prices: { 25: 22, 50: 39, 100: 75, 200: 142 }, typical: 'PSU ATX, Tower Cooler' },
            { id: 'satar-30x30x30-3', name: '30×30×30 (3L)', w: 30, h: 30, d: 30, type: 'regular', layers: 3,
              prices: { 25: 23, 50: 43, 100: 81, 200: 150 }, typical: 'AIO 240, Multiple items' },
            { id: 'satar-40x40x30-3', name: '40×40×30 (3L)', w: 40, h: 30, d: 40, type: 'regular', layers: 3,
              prices: { 25: 25, 50: 46, 100: 88, 200: 166 }, typical: 'GPU Large, Combo orders' },
            { id: 'satar-40x40x30-5', name: '40×40×30 (5L)', w: 40, h: 30, d: 40, type: 'regular', layers: 5,
              prices: { 25: 36, 50: 71, 100: 138, 200: 271 }, typical: 'Heavy items, Protection' },
            { id: 'satar-60x30x20-3', name: '60×30×20 (3L)', w: 60, h: 20, d: 30, type: 'regular', layers: 3,
              prices: { 25: 23, 50: 47, 100: 91, 200: 174 }, typical: 'Keyboard+Mouse combo' },
            { id: 'satar-60x45x35-3', name: '60×45×35 (3L)', w: 60, h: 35, d: 45, type: 'regular', layers: 3,
              prices: { 25: 38, 50: 69, 100: 129, 200: 249 }, typical: 'Full build, ITX Case' },
            { id: 'satar-60x45x35-5', name: '60×45×35 (5L)', w: 60, h: 35, d: 45, type: 'regular', layers: 5,
              prices: { 25: 49, 50: 94, 100: 183, 200: 348 }, typical: 'Heavy builds, Protection' },
        ]
    },
    hdrm: {
        id: 'hdrm',
        name: 'HDRM',
        phone: '0776 333 7776',
        boxes: [
            // Laptop-style boxes (كارتون شكل اللابتوب)
            { id: 'hdrm-10x15x6', name: '15×10×6', w: 15, h: 6, d: 10, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 13, 50: 24, 100: 44, 200: 84, 500: 205, 1000: 390, 2000: 760 }, typical: 'NVMe, Small items' },
            { id: 'hdrm-10x15x5', name: '15×10×5', w: 15, h: 5, d: 10, type: 'laptop', layers: 3, colors: ['multi'],
              prices: { 25: 13, 50: 24, 100: 44, 200: 84, 500: 205, 1000: 390, 2000: 760 }, typical: 'SSD, Accessories' },
            { id: 'hdrm-10x23x13', name: '23×10×13', w: 23, h: 13, d: 10, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 14, 50: 26, 100: 48, 200: 90, 500: 218, 1000: 415, 2000: 810 }, typical: 'CPU, RAM' },
            { id: 'hdrm-17x25x7', name: '25×17×7', w: 25, h: 7, d: 17, type: 'laptop', layers: 3, colors: ['multi'],
              prices: { 25: 18, 50: 33, 100: 54, 200: 99, 500: 240, 1000: 455, 2000: 900 }, typical: 'RAM kits, Mouse' },
            { id: 'hdrm-20x25x10', name: '25×20×10', w: 25, h: 10, d: 20, type: 'laptop', layers: 3, colors: ['multi'],
              prices: { 25: 22, 50: 39, 100: 69, 200: 133, 500: 324, 1000: 630, 2000: 1240 }, typical: 'CPU+Cooler, SFX PSU' },
            { id: 'hdrm-25x25x5', name: '25×25×5', w: 25, h: 5, d: 25, type: 'laptop', layers: 3, colors: ['white'],
              prices: { 25: 19, 50: 34, 100: 67, 200: 128, 500: 320, 1000: 622, 2000: 1210 }, typical: 'Flat items' },
            { id: 'hdrm-25x25x12', name: '25×25×12', w: 25, h: 12, d: 25, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 19, 50: 32, 100: 60, 200: 115, 500: 282, 1000: 537, 2000: 1056 }, typical: 'ITX Mobo' },
            { id: 'hdrm-25x30x12', name: '30×25×12', w: 30, h: 12, d: 25, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 21, 50: 36, 100: 68, 200: 132, 500: 325, 1000: 640, 2000: 1260 }, typical: 'mATX Mobo' },
            { id: 'hdrm-26x35x5', name: '35×26×5', w: 35, h: 5, d: 26, type: 'laptop', layers: 3, colors: ['white'],
              prices: { 25: 21, 50: 37, 100: 71, 200: 135, 500: 325, 1000: 625, 2000: 1220 }, typical: 'Keyboard' },
            { id: 'hdrm-26x35x10', name: '35×26×10', w: 35, h: 10, d: 26, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 21, 50: 36, 100: 68, 200: 132, 500: 325, 1000: 640, 2000: 1260 }, typical: 'GPU Compact' },
            { id: 'hdrm-35x45x10', name: '45×35×10', w: 45, h: 10, d: 35, type: 'laptop', layers: 3, colors: ['brown'],
              prices: { 25: 23, 50: 40, 100: 74, 200: 144, 500: 352, 1000: 680, 2000: 1249 }, typical: 'GPU, ATX Mobo' },

            // Regular boxes (كارتون شكل العادي)
            { id: 'hdrm-25x25x20', name: '25×25×20', w: 25, h: 20, d: 25, type: 'regular', layers: 3,
              prices: { 25: 22, 50: 39, 100: 75, 200: 142, 500: 341, 1000: 650, 2000: 1276 }, typical: 'PSU, Cooler' },
            { id: 'hdrm-30x30x30', name: '30×30×30', w: 30, h: 30, d: 30, type: 'regular', layers: 3,
              prices: { 25: 23, 50: 43, 100: 81, 200: 150, 500: 362, 1000: 690, 2000: 1346 }, typical: 'AIO, Multiple' },
            { id: 'hdrm-40x40x30-3', name: '40×40×30 (3L)', w: 40, h: 30, d: 40, type: 'regular', layers: 3,
              prices: { 25: 25, 50: 46, 100: 88, 200: 166, 500: 407, 1000: 779, 2000: 1526 }, typical: 'Large GPU' },
            { id: 'hdrm-40x40x30-5', name: '40×40×30 (5L)', w: 40, h: 30, d: 40, type: 'regular', layers: 5,
              prices: { 25: 36, 50: 71, 100: 138, 200: 271, 500: 660, 1000: 1285, 2000: 2470 }, typical: 'Heavy items' },
            { id: 'hdrm-60x45x35-3', name: '60×45×35 (3L)', w: 60, h: 35, d: 45, type: 'regular', layers: 3,
              prices: { 25: 38, 50: 69, 100: 129, 200: 249, 500: 608, 1000: 1185, 2000: 1336 }, typical: 'Full build' },
            { id: 'hdrm-60x45x35-5', name: '60×45×35 (5L)', w: 60, h: 35, d: 45, type: 'regular', layers: 5,
              prices: { 25: 49, 50: 94, 100: 183, 200: 348, 500: 858, 1000: 1330, 2000: 3330 }, typical: 'Heavy builds' },
            { id: 'hdrm-60x30x20', name: '60×30×20', w: 60, h: 20, d: 30, type: 'regular', layers: 3,
              prices: { 25: 23, 50: 47, 100: 91, 200: 174, 500: 420, 1000: 810, 2000: 1587 }, typical: 'Peripherals' },
        ]
    }
}

/**
 * Get boxes for a specific supplier
 * @param {string} supplierId - 'satar' or 'hdrm'
 * @returns {Array} Array of box objects
 */
export function getBoxes(supplierId = 'satar') {
    return suppliers[supplierId]?.boxes || []
}

/**
 * Get supplier info
 * @param {string} supplierId - 'satar' or 'hdrm'
 * @returns {Object} Supplier object
 */
export function getSupplier(supplierId = 'satar') {
    return suppliers[supplierId] || suppliers.satar
}

export default suppliers
