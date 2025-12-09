<template>
    <div class="results-summary">
        <div class="summary-row">
            <span class="label">Supplier</span>
            <span class="value">{{ supplierName }} ({{ supplierPhone }})</span>
        </div>
        <div class="summary-row">
            <span class="label">Monthly Orders</span>
            <span class="value">{{ stats.monthlyOrders }}</span>
        </div>
        <div class="summary-row">
            <span class="label">Total Boxes Needed</span>
            <span class="value highlight">{{ stats.totalBoxes }}</span>
        </div>
        <div class="summary-row">
            <span class="label">Estimated Cost</span>
            <span class="value highlight">{{ formattedCost }} IQD</span>
        </div>
        <div class="summary-row">
            <span class="label">Box Sizes to Stock</span>
            <span class="value">{{ stats.uniqueSizes }}</span>
        </div>
        <div class="summary-row">
            <span class="label">Core Sizes (80%)</span>
            <span class="value">{{ stats.paretoCount }} sizes</span>
        </div>
    </div>
</template>

<script>
import { formatPrice } from '../../utils/pricingFunctions'

export default {
    name: 'ResultsSummary',

    props: {
        stats: {
            type: Object,
            required: true
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

    computed: {
        formattedCost() {
            return formatPrice(this.stats.totalCost)
        }
    }
}
</script>

<style scoped>
.results-summary {
    background: #0f172a;
    border-radius: 8px;
    padding: 12px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding: 4px 0;
    border-bottom: 1px solid #1e293b;
}

.summary-row:last-child {
    border-bottom: none;
}

.label {
    color: #94a3b8;
}

.value {
    color: #f1f5f9;
    font-weight: 600;
}

.value.highlight {
    color: #22c55e;
}
</style>
