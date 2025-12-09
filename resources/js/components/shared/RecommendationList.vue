<template>
    <div class="recommendation-list">
        <div
            v-for="rec in recommendations"
            :key="rec.box.id"
            class="rec-item"
            :class="'priority-' + rec.priority"
        >
            <div class="rec-info">
                <h4>{{ rec.box.name }}</h4>
                <span>
                    {{ rec.box.w }} × {{ rec.box.d }} × {{ rec.box.h }} cm |
                    {{ rec.box.type === 'laptop' ? 'Flat' : 'Cube' }}
                </span>
            </div>
            <div class="rec-qty">
                <div class="rec-qty-value">{{ rec.quantity }}</div>
                <div class="rec-qty-label">boxes</div>
            </div>
            <div class="rec-cost">
                <div class="rec-cost-value">{{ formatCost(rec.cost) }}</div>
                <div class="rec-cost-label">IQD</div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatPrice } from '../../utils/pricingFunctions'

export default {
    name: 'RecommendationList',

    props: {
        recommendations: {
            type: Array,
            default: () => []
        }
    },

    methods: {
        formatCost(cost) {
            return formatPrice(cost || 0)
        }
    }
}
</script>

<style scoped>
.recommendation-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.rec-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    background: #0f172a;
    border-radius: 8px;
    border-left: 3px solid #334155;
}

.rec-item.priority-high {
    border-left-color: #22c55e;
}

.rec-item.priority-medium {
    border-left-color: #eab308;
}

.rec-item.priority-low {
    border-left-color: #64748b;
}

.rec-info h4 {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
    color: #f1f5f9;
}

.rec-info span {
    font-size: 10px;
    color: #64748b;
}

.rec-qty,
.rec-cost {
    text-align: center;
}

.rec-qty-value {
    font-size: 18px;
    font-weight: 700;
    color: #38bdf8;
}

.rec-qty-label,
.rec-cost-label {
    font-size: 9px;
    color: #64748b;
    text-transform: uppercase;
}

.rec-cost-value {
    font-size: 14px;
    font-weight: 600;
    color: #22c55e;
}
</style>
