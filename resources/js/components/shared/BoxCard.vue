<template>
    <div
        class="box-card"
        :class="{
            selected: isSelected,
            recommended: isRecommended && actuallyFits,
            'no-fit': !actuallyFits
        }"
        @click="handleClick"
    >
        <div class="box-card-name">{{ box.name }}</div>
        <div class="box-card-dims">
            {{ box.w }} × {{ box.d }} × {{ box.h }} cm
            <span v-if="box.layers">({{ box.layers }}L)</span>
        </div>
        <div class="box-card-meter">
            <div
                class="box-card-meter-fill"
                :class="meterClass"
                :style="{ width: displayEfficiency + '%' }"
            ></div>
        </div>
        <div class="box-card-stats">
            <span>{{ typeLabel }}</span>
            <span>{{ displayEfficiency }}% fit</span>
        </div>
        <div v-if="priceDisplay" class="box-card-price">
            {{ priceDisplay }}/25
        </div>
    </div>
</template>

<script>
import { formatPrice } from '../../utils/pricingFunctions'

export default {
    name: 'BoxCard',

    props: {
        box: {
            type: Object,
            required: true
        },
        fit: {
            type: Object,
            default: () => ({})
        },
        actuallyFits: {
            type: Boolean,
            default: true
        },
        isSelected: {
            type: Boolean,
            default: false
        },
        isRecommended: {
            type: Boolean,
            default: false
        }
    },

    emits: ['select'],

    computed: {
        displayEfficiency() {
            if (!this.actuallyFits) return 0
            return Math.round(this.fit.spaceUsage || this.fit.efficiency || 0)
        },

        meterClass() {
            if (this.displayEfficiency > 70) return 'meter-tight'
            if (this.displayEfficiency > 50) return 'meter-ok'
            return 'meter-good'
        },

        typeLabel() {
            return this.box.type === 'laptop' ? 'Flat' : 'Cube'
        },

        priceDisplay() {
            if (!this.box.prices) return ''
            const minPrice = Math.min(...Object.values(this.box.prices))
            return formatPrice(minPrice) + ' IQD'
        }
    },

    methods: {
        handleClick() {
            if (this.actuallyFits) {
                this.$emit('select', this.box)
            }
        }
    }
}
</script>

<style scoped>
.box-card {
    background: #0f172a;
    border: 2px solid #334155;
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
}

.box-card:hover {
    border-color: #475569;
}

.box-card.selected {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
}

.box-card.recommended {
    border-color: #22c55e;
}

.box-card.recommended::before {
    content: 'BEST';
    position: absolute;
    top: -1px;
    right: 10px;
    background: #22c55e;
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 0 0 4px 4px;
    letter-spacing: 0.5px;
}

.box-card.no-fit {
    opacity: 0.4;
    pointer-events: none;
}

.box-card-name {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 4px;
}

.box-card-dims {
    font-size: 11px;
    color: #64748b;
    margin-bottom: 8px;
}

.box-card-meter {
    height: 6px;
    background: #334155;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;
}

.box-card-meter-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
}

.meter-good {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}

.meter-ok {
    background: linear-gradient(90deg, #eab308, #fde047);
}

.meter-tight {
    background: linear-gradient(90deg, #f97316, #fb923c);
}

.box-card-stats {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94a3b8;
}

.box-card-price {
    font-size: 11px;
    color: #22c55e;
    font-weight: 600;
    margin-top: 4px;
}
</style>
