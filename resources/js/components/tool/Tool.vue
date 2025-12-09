<template>
    <div class="box-kit-tool">
        <Head title="Purchase Advisor" />

        <div class="tool-header">
            <h1>Box Purchase Advisor</h1>
            <p>Calculate optimal box inventory using Pareto 80/20 principle</p>
        </div>

        <div class="tool-layout">
            <!-- Left Panel: Controls -->
            <div class="control-panel">
                <div class="panel-section">
                    <h3>Supplier</h3>
                    <SupplierSelector
                        :selected="selectedSupplier"
                        @update:selected="selectedSupplier = $event"
                    />
                </div>

                <div class="panel-section">
                    <h3>Parameters</h3>
                    <AdvisorForm
                        :initial-monthly-orders="monthlyOrders"
                        :initial-safety-buffer="safetyBuffer"
                        @calculate="handleCalculate"
                    />
                </div>

                <div v-if="hasResults" class="panel-section">
                    <h3>Summary</h3>
                    <ResultsSummary
                        :stats="summaryStats"
                        :supplier-name="currentSupplier.name"
                        :supplier-phone="currentSupplier.phone"
                    />
                </div>

                <div v-if="hasResults" class="panel-section">
                    <h3>Export</h3>
                    <ExportButtons
                        :recommendations="recommendations"
                        :inventory="inventory"
                        :boxes="currentBoxes"
                        :supplier-name="currentSupplier.name"
                        :supplier-phone="currentSupplier.phone"
                    />
                </div>
            </div>

            <!-- Middle Panel: Recommendations -->
            <div class="recommendations-panel">
                <div class="panel-section">
                    <h3>
                        Recommended Stock
                        <span v-if="hasResults" class="badge">
                            {{ recommendations.length }} sizes
                        </span>
                    </h3>
                    <div v-if="!hasResults" class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                        <p>Enter parameters and click "Calculate Initial Stock"</p>
                    </div>
                    <RecommendationList
                        v-else
                        :recommendations="recommendations"
                    />
                </div>
            </div>

            <!-- Right Panel: Inventory Grid -->
            <div class="inventory-panel">
                <div class="panel-section">
                    <h3>Inventory Manager</h3>
                    <InventoryGrid
                        :boxes="currentBoxes"
                        :inventory="inventory"
                        :supplier-name="currentSupplier.name"
                        @update:inventory="inventory = $event"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Head } from '@inertiajs/vue3'
import { suppliers } from '../../data/suppliers'
import { calculateInitialStock } from '../../utils/paretoCalculator'
import { formatPrice, calculateTotalCost } from '../../utils/pricingFunctions'
import SupplierSelector from '../shared/SupplierSelector.vue'
import AdvisorForm from '../shared/AdvisorForm.vue'
import ResultsSummary from '../shared/ResultsSummary.vue'
import RecommendationList from '../shared/RecommendationList.vue'
import InventoryGrid from '../shared/InventoryGrid.vue'
import ExportButtons from '../shared/ExportButtons.vue'

export default {
    name: 'BoxKitTool',

    components: {
        Head,
        SupplierSelector,
        AdvisorForm,
        ResultsSummary,
        RecommendationList,
        InventoryGrid,
        ExportButtons
    },

    data() {
        return {
            selectedSupplier: 'satar',
            monthlyOrders: 100,
            safetyBuffer: 20,
            recommendations: [],
            inventory: {},
            hasResults: false
        }
    },

    computed: {
        currentSupplier() {
            return suppliers[this.selectedSupplier] || suppliers.satar
        },

        currentBoxes() {
            return this.currentSupplier.boxes || []
        },

        summaryStats() {
            if (!this.hasResults) {
                return {
                    monthlyOrders: 0,
                    totalBoxes: 0,
                    totalCost: 0,
                    uniqueSizes: 0,
                    paretoCount: 0
                }
            }

            const totalBoxes = this.recommendations.reduce((sum, r) => sum + r.quantity, 0)
            const totalCost = this.recommendations.reduce((sum, r) => sum + r.cost, 0)

            return {
                monthlyOrders: this.monthlyOrders,
                totalBoxes,
                totalCost,
                uniqueSizes: this.currentBoxes.length,
                paretoCount: this.recommendations.length
            }
        }
    },

    watch: {
        selectedSupplier() {
            // Reset when supplier changes
            this.recommendations = []
            this.inventory = {}
            this.hasResults = false
        }
    },

    methods: {
        handleCalculate({ monthlyOrders, safetyBuffer }) {
            this.monthlyOrders = monthlyOrders
            this.safetyBuffer = safetyBuffer

            // Calculate recommendations using Pareto algorithm
            const results = calculateInitialStock({
                boxes: this.currentBoxes,
                monthlyOrders,
                safetyBuffer
            })

            this.recommendations = results.recommendations

            // Initialize inventory from recommendations
            const newInventory = {}
            this.currentBoxes.forEach(box => {
                const rec = results.recommendations.find(r => r.box.id === box.id)
                newInventory[box.id] = {
                    stock: 0,
                    toOrder: rec ? rec.quantity : 0
                }
            })
            this.inventory = newInventory
            this.hasResults = true
        }
    }
}
</script>

<style scoped>
.box-kit-tool {
    padding: 24px;
    min-height: 100vh;
    background: #0f172a;
}

.tool-header {
    margin-bottom: 24px;
}

.tool-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 4px;
}

.tool-header p {
    font-size: 14px;
    color: #64748b;
}

.tool-layout {
    display: grid;
    grid-template-columns: 280px 1fr 350px;
    gap: 20px;
    align-items: start;
}

.control-panel,
.recommendations-panel,
.inventory-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.panel-section {
    background: #1e293b;
    border-radius: 12px;
    padding: 16px;
}

.panel-section h3 {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.badge {
    background: #22c55e;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    text-transform: none;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #475569;
    text-align: center;
}

.empty-state svg {
    margin-bottom: 12px;
    opacity: 0.5;
}

.empty-state p {
    font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
    .tool-layout {
        grid-template-columns: 1fr;
    }
}
</style>
