/**
 * Export utilities for purchase recommendations
 */

import { formatPrice } from './pricingFunctions'

/**
 * Export recommendations as CSV
 * @param {Array} recommendations - Box recommendations
 * @param {Object} supplier - Supplier info
 * @param {number} totalCost - Total cost
 * @returns {string} CSV content
 */
export function exportToCSV(recommendations, supplier, totalCost) {
    let csv = `Supplier,${supplier.name}\n`
    csv += `Phone,${supplier.phone}\n`
    csv += `Total Cost (IQD),${totalCost * 1000}\n\n`
    csv += 'Box Size,Dimensions (cm),Type,Layers,Quantity,Priority,Cost (K IQD)\n'

    recommendations.forEach(rec => {
        csv += `"${rec.box.name}","${rec.box.w} × ${rec.box.d} × ${rec.box.h}",${rec.box.type},${rec.box.layers},${rec.quantity},${rec.priority},${rec.cost || 0}\n`
    })

    return csv
}

/**
 * Download CSV file
 * @param {Array} recommendations - Box recommendations
 * @param {Object} supplier - Supplier info
 * @param {number} totalCost - Total cost
 */
export function downloadCSV(recommendations, supplier, totalCost) {
    const csv = exportToCSV(recommendations, supplier, totalCost)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `box-recommendations-${supplier.id}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * Export purchase list as text
 * @param {Object} boxInventory - Current inventory state
 * @param {Array} boxes - Available boxes
 * @param {Object} supplier - Supplier info
 * @returns {string} Text content
 */
export function exportPurchaseList(boxInventory, boxes, supplier) {
    let text = 'BOX PURCHASE LIST\n'
    text += '='.repeat(50) + '\n\n'
    text += 'Generated: ' + new Date().toLocaleString() + '\n'
    text += `Supplier: ${supplier.name}\n`
    text += `Phone: ${supplier.phone}\n\n`

    let hasOrders = false
    let totalCost = 0

    text += 'ORDERS:\n'
    text += '-'.repeat(50) + '\n'

    boxes.forEach(box => {
        const inv = boxInventory[box.id] || { stock: 0, toOrder: 0 }
        if (inv.toOrder > 0) {
            hasOrders = true

            // Calculate price
            let linePrice = 0
            let tierUsed = 25
            if (box.prices) {
                const tiers = Object.keys(box.prices).map(Number).sort((a, b) => a - b)
                for (const tier of tiers) {
                    if (inv.toOrder >= tier) tierUsed = tier
                }
                const fullTiers = Math.floor(inv.toOrder / tierUsed)
                linePrice = fullTiers * box.prices[tierUsed]
                totalCost += linePrice
            }

            text += `\n${box.name} (${box.w}×${box.d}×${box.h} cm)\n`
            text += `  Type: ${box.type === 'laptop' ? 'Flat/Laptop' : 'Regular'} | Layers: ${box.layers || 3}\n`
            text += `  Quantity: ${inv.toOrder} pcs\n`
            text += `  Price: ${formatPrice(linePrice)} IQD (${tierUsed}pc tier @ ${formatPrice(box.prices?.[tierUsed] || 0)})\n`
            text += `  Current Stock: ${inv.stock}\n`
        }
    })

    if (!hasOrders) {
        text += '\nNo boxes to order.\n'
    } else {
        text += '\n' + '-'.repeat(50) + '\n'
        text += `TOTAL COST: ${formatPrice(totalCost)} IQD\n`
    }

    text += '\n' + '='.repeat(50) + '\n'
    text += 'INVENTORY SUMMARY\n\n'

    boxes.forEach(box => {
        const inv = boxInventory[box.id] || { stock: 0, toOrder: 0 }
        const status = inv.stock < 10 ? '⚠️ LOW' : '✓'
        text += `${box.name}: ${inv.stock} in stock ${status}\n`
    })

    text += '\n' + '='.repeat(50) + '\n'
    text += `Contact ${supplier.name}: ${supplier.phone}\n`

    return text
}

/**
 * Download purchase list as text file
 */
export function downloadPurchaseList(boxInventory, boxes, supplier) {
    const text = exportPurchaseList(boxInventory, boxes, supplier)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `box-purchase-${supplier.id}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * Generate print-friendly HTML
 * @param {Array} recommendations - Box recommendations
 * @param {Object} stats - Statistics
 * @param {Object} supplier - Supplier info
 * @returns {string} HTML content
 */
export function generatePrintHTML(recommendations, stats, supplier) {
    let totalQty = 0
    recommendations.forEach(rec => totalQty += rec.quantity)

    let html = `
        <html>
        <head>
            <title>Box Purchase List - ${supplier.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                .meta { color: #666; margin-bottom: 20px; }
                .supplier-info { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .supplier-info h2 { margin: 0 0 10px 0; color: #22c55e; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #f5f5f5; }
                .priority-high { border-left: 4px solid #22c55e; }
                .priority-medium { border-left: 4px solid #eab308; }
                .priority-low { border-left: 4px solid #94a3b8; }
                .total { font-weight: bold; background: #f0fdf4; }
                .cost { color: #22c55e; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #888; }
            </style>
        </head>
        <body>
            <h1>Box Purchase Order</h1>

            <div class="supplier-info">
                <h2>${supplier.name}</h2>
                <p><strong>Phone:</strong> ${supplier.phone}</p>
                <p><strong>Estimated Total:</strong> <span class="cost">${formatPrice(stats.totalCost)} IQD</span></p>
            </div>

            <div class="meta">
                <p><strong>Monthly Orders:</strong> ${stats.monthlyOrders} | <strong>Safety Buffer:</strong> ${stats.safetyBuffer || 20}%</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <table>
                <tr>
                    <th>Priority</th>
                    <th>Box Size</th>
                    <th>Dimensions (cm)</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Cost (IQD)</th>
                </tr>
    `

    recommendations.forEach(rec => {
        const priorityLabel = rec.priority === 'high' ? 'CORE' : rec.priority === 'medium' ? 'STANDARD' : 'BACKUP'
        html += `
            <tr class="priority-${rec.priority}">
                <td>${priorityLabel}</td>
                <td><strong>${rec.box.name}</strong></td>
                <td>${rec.box.w} × ${rec.box.d} × ${rec.box.h}</td>
                <td>${rec.box.type === 'laptop' ? 'Flat' : 'Cube'} (${rec.box.layers}L)</td>
                <td>${rec.quantity}</td>
                <td class="cost">${formatPrice(rec.cost || 0)}</td>
            </tr>
        `
    })

    html += `
                <tr class="total">
                    <td colspan="4">TOTAL</td>
                    <td>${totalQty}</td>
                    <td class="cost">${formatPrice(stats.totalCost)}</td>
                </tr>
            </table>
            <div class="footer">
                <p><strong>Pareto Approach:</strong> Focus on CORE sizes first - they cover ~80% of your orders.</p>
                <p>STANDARD sizes cover occasional larger orders. BACKUP sizes are for rare, specialty items.</p>
                <p style="margin-top: 15px;"><strong>Contact ${supplier.name}:</strong> ${supplier.phone}</p>
            </div>
        </body>
        </html>
    `

    return html
}

/**
 * Open print dialog with recommendations
 */
export function printRecommendations(recommendations, stats, supplier) {
    const html = generatePrintHTML(recommendations, stats, supplier)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
}

export default {
    exportToCSV,
    downloadCSV,
    exportPurchaseList,
    downloadPurchaseList,
    generatePrintHTML,
    printRecommendations
}
