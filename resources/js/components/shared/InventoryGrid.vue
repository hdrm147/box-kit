<template>
    <div class="inventory-grid">
        <div class="grid-header">
            <span>Box Size</span>
            <span>Stock</span>
            <span>Order</span>
            <span>Price</span>
        </div>
        <div
            v-for="box in boxes"
            :key="box.id"
            class="grid-row"
        >
            <span class="box-name" :title="box.typical">{{ box.name }}</span>
            <input
                type="number"
                class="stock-input"
                :class="{ 'stock-low': getStock(box.id) < 10 }"
                :value="getStock(box.id)"
                @change="updateStock(box.id, $event.target.value)"
                min="0"
            />
            <input
                type="number"
                class="stock-input"
                :value="getOrder(box.id)"
                @change="updateOrder(box.id, $event.target.value)"
                min="0"
            />
            <span class="price-display">
                {{ formatLinePrice(box) }}
            </span>
        </div>
        <div class="total-row">
            <span>Total ({{ supplierName }})</span>
            <span class="total-value">{{ formatTotalCost }} IQD</span>
        </div>
    </div>
</template>

<script>
import { formatPrice, roundToTier, calculateTotalCost } from '../../utils/pricingFunctions'

export default {
    name: 'InventoryGrid',

    props: {
        boxes: {
            type: Array,
            default: () => []
        },
        inventory: {
            type: Object,
            default: () => ({})
        },
        supplierName: {
            type: String,
            default: ''
        }
    },

    emits: ['update:inventory'],

    computed: {
        totalCost() {
            let total = 0
            this.boxes.forEach(box => {
                const order = this.getOrder(box.id)
                if (order > 0) {
                    total += calculateTotalCost(box, order)
                }
            })
            return total
        },

        formatTotalCost() {
            return formatPrice(this.totalCost)
        }
    },

    methods: {
        getStock(boxId) {
            return this.inventory[boxId]?.stock || 0
        },

        getOrder(boxId) {
            return this.inventory[boxId]?.toOrder || 0
        },

        updateStock(boxId, value) {
            const newInventory = { ...this.inventory }
            if (!newInventory[boxId]) {
                newInventory[boxId] = { stock: 0, toOrder: 0 }
            }
            newInventory[boxId].stock = parseInt(value) || 0
            this.$emit('update:inventory', newInventory)
        },

        updateOrder(boxId, value) {
            const box = this.boxes.find(b => b.id === boxId)
            let qty = parseInt(value) || 0

            // Round to tier
            if (qty > 0 && box) {
                qty = roundToTier(qty, box)
            }

            const newInventory = { ...this.inventory }
            if (!newInventory[boxId]) {
                newInventory[boxId] = { stock: 0, toOrder: 0 }
            }
            newInventory[boxId].toOrder = qty
            this.$emit('update:inventory', newInventory)
        },

        formatLinePrice(box) {
            const order = this.getOrder(box.id)
            if (order <= 0) return '-'
            const cost = calculateTotalCost(box, order)
            return formatPrice(cost)
        }
    }
}
</script>

<style scoped>
.inventory-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.grid-header {
    display: grid;
    grid-template-columns: 1fr 60px 60px 70px;
    gap: 6px;
    padding: 0 10px 8px;
    font-size: 9px;
    text-transform: uppercase;
    color: #64748b;
}

.grid-row {
    display: grid;
    grid-template-columns: 1fr 60px 60px 70px;
    gap: 6px;
    align-items: center;
    padding: 6px 10px;
    background: #1e293b;
    border-radius: 6px;
    font-size: 11px;
}

.box-name {
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stock-input {
    background: #334155;
    border: 1px solid #475569;
    border-radius: 4px;
    padding: 5px 6px;
    color: white;
    width: 100%;
    text-align: center;
    font-size: 11px;
}

.stock-input.stock-low {
    color: #f87171;
    border-color: #7f1d1d;
}

.price-display {
    color: #22c55e;
    font-weight: 600;
    text-align: right;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(14, 165, 233, 0.1));
    border: 1px solid #22c55e;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
}

.total-row span:first-child {
    font-size: 12px;
    color: #94a3b8;
}

.total-value {
    font-size: 18px;
    font-weight: 700;
    color: #22c55e;
}
</style>
