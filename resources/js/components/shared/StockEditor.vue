<template>
    <div class="bk-stock-editor">
        <div class="bk-stock-header">
            <span class="bk-stock-title">Box Inventory</span>
            <div class="bk-stock-summary" v-if="summary.uniqueSizes > 0">
                {{ summary.uniqueSizes }} sizes, {{ summary.totalBoxes }} boxes
            </div>
            <button type="button" class="bk-stock-close" @click="$emit('close')">×</button>
        </div>

        <div class="bk-stock-tabs">
            <button
                v-for="sup in suppliers"
                :key="sup.id"
                type="button"
                class="bk-stock-tab"
                :class="{ 'bk-active': currentSupplier === sup.id }"
                @click="currentSupplier = sup.id"
            >
                {{ sup.name }}
            </button>
        </div>

        <div class="bk-stock-list">
            <div
                v-for="box in currentBoxes"
                :key="box.id"
                class="bk-stock-item"
                :class="{ 'bk-has-stock': localStock[box.id] > 0 }"
            >
                <div class="bk-stock-item-info">
                    <span class="bk-stock-item-name">{{ box.name }}</span>
                    <span class="bk-stock-item-meta">
                        {{ box.w }}×{{ box.d }}×{{ box.h }} cm
                        <span class="bk-tier-badge" :style="{ background: getTierColor(box) }">
                            {{ getTierLabel(box) }}
                        </span>
                    </span>
                </div>
                <div class="bk-stock-item-qty">
                    <button type="button" class="bk-qty-btn" @click="decrementStock(box.id)">−</button>
                    <input
                        type="number"
                        class="bk-qty-input"
                        :value="localStock[box.id] || 0"
                        @input="setStock(box.id, $event.target.value)"
                        min="0"
                        step="25"
                    />
                    <button type="button" class="bk-qty-btn" @click="incrementStock(box.id)">+</button>
                </div>
            </div>
        </div>

        <div class="bk-stock-actions">
            <button type="button" class="bk-stock-btn bk-btn-clear" @click="clearAll">Clear All</button>
            <button type="button" class="bk-stock-btn bk-btn-quick" @click="quickStock">Quick Stock (25 each)</button>
        </div>
    </div>
</template>

<script>
import { getBoxes, suppliers as supplierData } from '../../data/suppliers'
import { getStock, saveStock, clearStock } from '../../utils/stockManager'
import { getBoxTier, courierTiers } from '../../data/courierTiers'

export default {
    name: 'StockEditor',

    emits: ['close', 'updated'],

    data() {
        return {
            currentSupplier: 'satar',
            localStock: {}
        }
    },

    computed: {
        suppliers() {
            return Object.values(supplierData)
        },

        currentBoxes() {
            return getBoxes(this.currentSupplier)
        },

        summary() {
            let totalBoxes = 0
            let uniqueSizes = 0
            for (const qty of Object.values(this.localStock)) {
                if (qty > 0) {
                    totalBoxes += qty
                    uniqueSizes++
                }
            }
            return { totalBoxes, uniqueSizes }
        }
    },

    mounted() {
        this.loadStock()
    },

    methods: {
        loadStock() {
            const stock = getStock()
            this.localStock = { ...stock.boxes }
            if (stock.supplier) {
                this.currentSupplier = stock.supplier
            }
        },

        setStock(boxId, value) {
            const qty = Math.max(0, parseInt(value) || 0)
            this.localStock[boxId] = qty
            this.save()
        },

        incrementStock(boxId) {
            const current = this.localStock[boxId] || 0
            this.localStock[boxId] = current + 25
            this.save()
        },

        decrementStock(boxId) {
            const current = this.localStock[boxId] || 0
            this.localStock[boxId] = Math.max(0, current - 25)
            this.save()
        },

        save() {
            saveStock({
                supplier: this.currentSupplier,
                boxes: { ...this.localStock }
            })
            this.$emit('updated')
        },

        clearAll() {
            this.localStock = {}
            clearStock()
            this.$emit('updated')
        },

        quickStock() {
            // Add 25 of each box for current supplier
            for (const box of this.currentBoxes) {
                this.localStock[box.id] = 25
            }
            this.save()
        },

        getTierLabel(box) {
            const tier = getBoxTier(box)
            if (!tier) return 'XL'
            return tier.nameEn.charAt(0) // S, M, L
        },

        getTierColor(box) {
            const tier = getBoxTier(box)
            if (!tier) return '#ef4444'
            return tier.color
        }
    }
}
</script>

<style scoped>
.bk-stock-editor {
    background: #1e293b;
    border-radius: 10px;
    overflow: hidden;
    max-height: 500px;
    display: flex;
    flex-direction: column;
}

.bk-stock-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #334155;
}

.bk-stock-title {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
}

.bk-stock-summary {
    flex: 1;
    font-size: 11px;
    color: #64748b;
}

.bk-stock-close {
    width: 24px;
    height: 24px;
    background: #334155;
    border: none;
    border-radius: 4px;
    color: #94a3b8;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bk-stock-close:hover {
    background: #475569;
    color: #f1f5f9;
}

.bk-stock-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid #334155;
}

.bk-stock-tab {
    padding: 6px 16px;
    background: transparent;
    border: 1px solid #334155;
    border-radius: 6px;
    color: #94a3b8;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.bk-stock-tab:hover {
    background: #334155;
}

.bk-stock-tab.bk-active {
    background: #22c55e;
    border-color: #22c55e;
    color: #0f172a;
}

.bk-stock-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.bk-stock-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #334155;
    border-radius: 6px;
    margin-bottom: 6px;
    border: 1px solid transparent;
    transition: all 0.15s;
}

.bk-stock-item.bk-has-stock {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
}

.bk-stock-item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.bk-stock-item-name {
    font-size: 12px;
    font-weight: 600;
    color: #f1f5f9;
}

.bk-stock-item-meta {
    font-size: 10px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
}

.bk-tier-badge {
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 700;
    color: #0f172a;
}

.bk-stock-item-qty {
    display: flex;
    align-items: center;
    gap: 4px;
}

.bk-qty-btn {
    width: 28px;
    height: 28px;
    background: #475569;
    border: none;
    border-radius: 4px;
    color: #f1f5f9;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bk-qty-btn:hover {
    background: #64748b;
}

.bk-qty-input {
    width: 60px;
    padding: 6px 8px;
    background: #0f172a;
    border: 1px solid #475569;
    border-radius: 4px;
    color: #f1f5f9;
    font-size: 12px;
    text-align: center;
}

.bk-qty-input:focus {
    outline: none;
    border-color: #22c55e;
}

.bk-stock-actions {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #334155;
}

.bk-stock-btn {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.bk-btn-clear {
    background: #334155;
    color: #94a3b8;
}

.bk-btn-clear:hover {
    background: #ef4444;
    color: #fff;
}

.bk-btn-quick {
    background: #3b82f6;
    color: #fff;
}

.bk-btn-quick:hover {
    background: #2563eb;
}

/* Scrollbar */
.bk-stock-list::-webkit-scrollbar {
    width: 4px;
}

.bk-stock-list::-webkit-scrollbar-track {
    background: #1e293b;
}

.bk-stock-list::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 2px;
}
</style>