<template>
    <div class="bk-picker">
        <!-- Top Bar: Supplier + Items Summary -->
        <div class="bk-top-bar">
            <SupplierSelector v-model="currentSupplier" class="bk-supplier" />
            <div class="bk-items-summary">
                <span class="bk-items-label">Items:</span>
                <span class="bk-items-count" :class="{ 'bk-warning': invalidItems.length > 0 }">
                    {{ validItems.length }}/{{ items.length }}
                </span>
                <span v-if="invalidItems.length > 0" class="bk-items-warn">
                    ({{ invalidItems.length }} missing dims)
                </span>
            </div>
            <PaddingControl v-model="currentPadding" class="bk-padding" />
        </div>

        <!-- Main Content: Preview + Box List -->
        <div class="bk-main">
            <!-- 3D Preview (Large) -->
            <div class="bk-preview-area">
                <Visualization3D
                    :items="validItems"
                    :selected-box="currentSelectedBox"
                    :padding="currentPadding"
                />
                <!-- Selected Box Info Overlay -->
                <div v-if="currentSelectedBox" class="bk-selected-info">
                    <div class="bk-selected-name">{{ currentSelectedBox.name }}</div>
                    <div class="bk-selected-dims">{{ currentSelectedBox.w }}×{{ currentSelectedBox.d }}×{{ currentSelectedBox.h }} cm</div>
                    <div class="bk-selected-price">{{ getBoxPrice(currentSelectedBox) }} IQD/25</div>
                </div>
            </div>

            <!-- Order Items (Compact Sidebar) -->
            <div class="bk-sidebar">
                <div class="bk-sidebar-header">Order Items</div>
                <div class="bk-items-list">
                    <div
                        v-for="item in items"
                        :key="item.id"
                        class="bk-item"
                        :class="{ 'bk-item-invalid': !isValidItem(item) }"
                    >
                        <div class="bk-item-color" :style="{ background: item.color || '#94a3b8' }"></div>
                        <div class="bk-item-info">
                            <div class="bk-item-name">{{ item.name }}</div>
                            <div class="bk-item-dims" v-if="isValidItem(item)">
                                {{ item.w }}×{{ item.d }}×{{ item.h }}
                            </div>
                            <div class="bk-item-dims bk-missing" v-else>No dims</div>
                        </div>
                        <div class="bk-item-qty">×{{ item.qty || 1 }}</div>
                    </div>
                    <div v-if="!items.length" class="bk-no-items">No items</div>
                </div>
            </div>
        </div>

        <!-- Box Recommendations (Compact Horizontal) -->
        <div class="bk-boxes-section">
            <div class="bk-boxes-header">
                <span>Box Recommendations</span>
                <span v-if="hasOverflow" class="bk-overflow-warn">Items don't fit!</span>
            </div>
            <div class="bk-boxes-scroll">
                <div
                    v-for="box in rankedBoxes"
                    :key="box.id"
                    class="bk-box-card"
                    :class="{
                        'bk-selected': currentSelectedBox?.id === box.id,
                        'bk-best': box.isBest
                    }"
                    @click="selectBox(box)"
                >
                    <div class="bk-box-name">{{ box.name }}</div>
                    <div class="bk-box-dims">{{ box.w }}×{{ box.d }}×{{ box.h }}</div>
                    <div class="bk-box-meta">
                        <span class="bk-box-type">{{ box.type === 'laptop' ? 'Flat' : 'Cube' }}</span>
                        <span class="bk-box-fit" :class="getFitClass(box)">{{ box.fitPercent }}%</span>
                    </div>
                    <div class="bk-box-price">{{ formatBoxPrice(box) }}</div>
                    <div v-if="box.isBest" class="bk-best-badge">BEST</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SupplierSelector from './SupplierSelector.vue'
import PaddingControl from './PaddingControl.vue'
import Visualization3D from './Visualization3D.vue'
import { getBoxes } from '../../data/suppliers'
import { packItems, countOverflow } from '../../utils/packingAlgorithm'
import { formatPrice, getBoxPrice } from '../../utils/pricingFunctions'
import { rankBoxes } from '../../utils/boxFitting'

export default {
    name: 'BoxPickerMain',

    components: {
        SupplierSelector,
        PaddingControl,
        Visualization3D
    },

    props: {
        items: { type: Array, default: () => [] },
        selectedBox: { type: String, default: null },
        selectedSupplier: { type: String, default: 'satar' },
        padding: { type: Number, default: 0 }
    },

    emits: ['update:selectedBox', 'update:selectedSupplier', 'update:padding', 'change'],

    data() {
        return {
            currentSupplier: this.selectedSupplier,
            currentPadding: this.padding,
            currentSelectedBoxId: this.selectedBox
        }
    },

    computed: {
        validItems() {
            return this.items.filter(item => this.isValidItem(item))
        },

        invalidItems() {
            return this.items.filter(item => !this.isValidItem(item))
        },

        currentBoxes() {
            return getBoxes(this.currentSupplier)
        },

        rankedBoxes() {
            if (!this.validItems.length) {
                return this.currentBoxes.slice(0, 12).map(box => ({
                    ...box,
                    fitPercent: 0,
                    isBest: false
                }))
            }

            const ranked = rankBoxes(this.currentBoxes, this.validItems, this.currentPadding)
            return ranked.map((r, i) => ({
                ...r.box,
                fitPercent: Math.round(r.fit?.efficiency || 0),
                actuallyFits: r.actuallyFits,
                isBest: i === 0 && r.actuallyFits
            }))
        },

        currentSelectedBox() {
            if (!this.currentSelectedBoxId) {
                const best = this.rankedBoxes.find(b => b.isBest)
                return best || null
            }
            return this.currentBoxes.find(b => b.id === this.currentSelectedBoxId) || null
        },

        hasOverflow() {
            if (!this.currentSelectedBox || !this.validItems.length) return false
            const itemsForPacking = this.validItems.map(item => ({
                product: item,
                qty: item.qty || 1
            }))
            const placements = packItems(itemsForPacking, this.currentSelectedBox, this.currentPadding)
            return countOverflow(placements) > 0
        }
    },

    watch: {
        selectedSupplier(v) { this.currentSupplier = v },
        selectedBox(v) { this.currentSelectedBoxId = v },
        padding(v) { this.currentPadding = v },
        currentSupplier(v) {
            this.$emit('update:selectedSupplier', v)
            this.emitChange()
        },
        currentPadding(v) {
            this.$emit('update:padding', v)
            this.emitChange()
        },
        items: {
            immediate: true,
            handler(items) {
                items.forEach(item => {
                    if (!this.isValidItem(item)) {
                        console.warn(`[BoxKit] Missing dimensions: "${item.name}"`, {
                            id: item.id, w: item.w, h: item.h, d: item.d
                        })
                    }
                })
            }
        }
    },

    methods: {
        isValidItem(item) {
            const w = parseFloat(item.w)
            const h = parseFloat(item.h)
            const d = parseFloat(item.d)
            return w > 0 && h > 0 && d > 0
        },

        selectBox(box) {
            this.currentSelectedBoxId = box.id
            this.$emit('update:selectedBox', box.id)
            this.emitChange()
        },

        emitChange() {
            this.$emit('change', {
                selectedBox: this.currentSelectedBoxId,
                selectedSupplier: this.currentSupplier,
                padding: this.currentPadding
            })
        },

        getBoxPrice(box) {
            if (!box?.pricing) return '-'
            return formatPrice(getBoxPrice(box, 25))
        },

        formatBoxPrice(box) {
            if (!box?.pricing) return '-'
            const price = getBoxPrice(box, 25)
            return `${Math.round(price / 1000)}K`
        },

        getFitClass(box) {
            if (box.fitPercent >= 80) return 'bk-fit-great'
            if (box.fitPercent >= 50) return 'bk-fit-good'
            if (box.fitPercent > 0) return 'bk-fit-ok'
            return 'bk-fit-none'
        }
    }
}
</script>

<style scoped>
.bk-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}

/* Top Bar */
.bk-top-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.bk-supplier {
    flex: 1;
    min-width: 200px;
}

.bk-items-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #94a3b8;
    padding: 8px 12px;
    background: #1e293b;
    border-radius: 6px;
}

.bk-items-count {
    color: #22c55e;
    font-weight: 600;
}

.bk-items-count.bk-warning {
    color: #eab308;
}

.bk-items-warn {
    color: #f87171;
    font-size: 10px;
}

.bk-padding {
    min-width: 180px;
}

/* Main Content */
.bk-main {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 12px;
    flex: 1;
    min-height: 300px;
}

/* Preview Area */
.bk-preview-area {
    position: relative;
    background: #0f172a;
    border-radius: 10px;
    overflow: hidden;
    min-height: 300px;
}

.bk-selected-info {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.95);
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #334155;
}

.bk-selected-name {
    font-size: 16px;
    font-weight: 700;
    color: #38bdf8;
}

.bk-selected-dims {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
}

.bk-selected-price {
    font-size: 12px;
    color: #22c55e;
    font-weight: 600;
    margin-top: 4px;
}

/* Sidebar */
.bk-sidebar {
    background: #1e293b;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.bk-sidebar-header {
    padding: 10px 12px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    border-bottom: 1px solid #334155;
}

.bk-items-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.bk-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #334155;
    border-radius: 6px;
    margin-bottom: 6px;
}

.bk-item-invalid {
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.3);
}

.bk-item-color {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
}

.bk-item-info {
    flex: 1;
    min-width: 0;
}

.bk-item-name {
    font-size: 10px;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bk-item-dims {
    font-size: 9px;
    color: #64748b;
}

.bk-item-dims.bk-missing {
    color: #eab308;
}

.bk-item-qty {
    font-size: 10px;
    color: #38bdf8;
    font-weight: 600;
}

.bk-no-items {
    text-align: center;
    padding: 20px;
    color: #475569;
    font-size: 11px;
}

/* Box Recommendations */
.bk-boxes-section {
    background: #1e293b;
    border-radius: 10px;
    padding: 10px;
}

.bk-boxes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    margin-bottom: 10px;
    padding: 0 4px;
}

.bk-overflow-warn {
    color: #ef4444;
    font-weight: 600;
}

.bk-boxes-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 6px;
}

.bk-box-card {
    flex-shrink: 0;
    width: 100px;
    padding: 10px;
    background: #334155;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    border: 2px solid transparent;
    position: relative;
}

.bk-box-card:hover {
    background: #475569;
}

.bk-box-card.bk-selected {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
}

.bk-box-card.bk-best {
    border-color: #38bdf8;
}

.bk-box-name {
    font-size: 12px;
    font-weight: 700;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bk-box-dims {
    font-size: 9px;
    color: #64748b;
    margin-top: 2px;
}

.bk-box-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 9px;
}

.bk-box-type {
    color: #94a3b8;
}

.bk-box-fit {
    font-weight: 600;
}

.bk-fit-great { color: #22c55e; }
.bk-fit-good { color: #84cc16; }
.bk-fit-ok { color: #eab308; }
.bk-fit-none { color: #64748b; }

.bk-box-price {
    font-size: 11px;
    color: #22c55e;
    font-weight: 600;
    margin-top: 4px;
}

.bk-best-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #38bdf8;
    color: #0f172a;
    font-size: 8px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
}

/* Scrollbar */
.bk-boxes-scroll::-webkit-scrollbar,
.bk-items-list::-webkit-scrollbar {
    height: 4px;
    width: 4px;
}

.bk-boxes-scroll::-webkit-scrollbar-track,
.bk-items-list::-webkit-scrollbar-track {
    background: #1e293b;
}

.bk-boxes-scroll::-webkit-scrollbar-thumb,
.bk-items-list::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 2px;
}

/* Responsive */
@media (max-width: 700px) {
    .bk-main {
        grid-template-columns: 1fr;
    }
    .bk-sidebar {
        max-height: 150px;
    }
}
</style>
