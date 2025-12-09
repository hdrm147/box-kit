<template>
    <div class="export-buttons">
        <button class="export-btn csv" @click="exportCSV" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
            Export CSV
        </button>
        <button class="export-btn text" @click="exportText" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Export Text
        </button>
        <button class="export-btn print" @click="printList" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print
        </button>
    </div>
</template>

<script>
import { downloadCSV, downloadPurchaseList, printRecommendations } from '../../utils/exportFunctions'

export default {
    name: 'ExportButtons',

    props: {
        recommendations: {
            type: Array,
            default: () => []
        },
        inventory: {
            type: Object,
            default: () => ({})
        },
        boxes: {
            type: Array,
            default: () => []
        },
        supplierName: {
            type: String,
            default: ''
        },
        supplierPhone: {
            type: String,
            default: ''
        }
    },

    methods: {
        getExportData() {
            // Combine recommendations with manual inventory orders
            const items = []

            // Add recommendations
            this.recommendations.forEach(rec => {
                items.push({
                    box: rec.box,
                    quantity: rec.quantity,
                    cost: rec.cost,
                    source: 'recommendation'
                })
            })

            // Add manual orders from inventory
            this.boxes.forEach(box => {
                const inv = this.inventory[box.id]
                if (inv && inv.toOrder > 0) {
                    // Check if already in recommendations
                    const existing = items.find(i => i.box.id === box.id)
                    if (!existing) {
                        items.push({
                            box: box,
                            quantity: inv.toOrder,
                            cost: this.calculateCost(box, inv.toOrder),
                            source: 'manual'
                        })
                    }
                }
            })

            return items
        },

        calculateCost(box, qty) {
            if (!box.pricing || qty <= 0) return 0
            let price = box.pricing[0]?.price || 0
            for (const tier of box.pricing) {
                if (qty >= tier.qty) {
                    price = tier.price
                }
            }
            return price * qty
        },

        exportCSV() {
            if (this.recommendations.length === 0) {
                alert('No items to export')
                return
            }
            const supplier = { name: this.supplierName, phone: this.supplierPhone }
            const totalCost = this.recommendations.reduce((sum, r) => sum + (r.cost || 0), 0)
            downloadCSV(this.recommendations, supplier, totalCost)
        },

        exportText() {
            if (this.recommendations.length === 0 && Object.keys(this.inventory).length === 0) {
                alert('No items to export')
                return
            }
            const supplier = { name: this.supplierName, phone: this.supplierPhone, id: this.supplierName.toLowerCase() }
            downloadPurchaseList(this.inventory, this.boxes, supplier)
        },

        printList() {
            if (this.recommendations.length === 0) {
                alert('No items to print')
                return
            }
            const supplier = { name: this.supplierName, phone: this.supplierPhone }
            const stats = {
                totalCost: this.recommendations.reduce((sum, r) => sum + (r.cost || 0), 0),
                monthlyOrders: 100,
                safetyBuffer: 20
            }
            printRecommendations(this.recommendations, stats, supplier)
        }
    }
}
</script>

<style scoped>
.export-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.export-btn.csv {
    background: #1e40af;
    color: white;
}

.export-btn.csv:hover {
    background: #1d4ed8;
}

.export-btn.text {
    background: #065f46;
    color: white;
}

.export-btn.text:hover {
    background: #047857;
}

.export-btn.print {
    background: #7c3aed;
    color: white;
}

.export-btn.print:hover {
    background: #8b5cf6;
}

.export-btn svg {
    flex-shrink: 0;
}
</style>
