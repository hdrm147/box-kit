<template>
    <div class="box-grid-container">
        <div v-if="!rankedBoxes.length" class="empty-state">
            Add items to see box recommendations
        </div>
        <div v-else class="box-grid">
            <BoxCard
                v-for="ranked in rankedBoxes"
                :key="ranked.box.id"
                :box="ranked.box"
                :fit="ranked.fit"
                :actually-fits="ranked.actuallyFits"
                :is-selected="selectedBox?.id === ranked.box.id"
                :is-recommended="bestFit?.box.id === ranked.box.id"
                @select="$emit('select', $event)"
            />
        </div>
    </div>
</template>

<script>
import BoxCard from './BoxCard.vue'
import { getBoxes } from '../../data/suppliers'
import { rankBoxes } from '../../utils/boxFitting'

export default {
    name: 'BoxGrid',

    components: {
        BoxCard
    },

    props: {
        items: {
            type: Array,
            default: () => []
        },
        supplier: {
            type: String,
            default: 'satar'
        },
        selectedBox: {
            type: Object,
            default: null
        },
        padding: {
            type: Number,
            default: 0
        }
    },

    emits: ['select', 'update:bestFit'],

    computed: {
        boxes() {
            return getBoxes(this.supplier)
        },

        rankedBoxes() {
            if (!this.items.length) return []
            return rankBoxes(this.boxes, this.items, this.padding)
        },

        bestFit() {
            return this.rankedBoxes.find(rb => rb.actuallyFits)
        }
    },

    watch: {
        bestFit: {
            immediate: true,
            handler(newBest) {
                this.$emit('update:bestFit', newBest?.box || null)
            }
        }
    }
}
</script>

<style scoped>
.box-grid-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.box-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    overflow-y: auto;
    flex: 1;
    padding-right: 4px;
}

.empty-state {
    text-align: center;
    padding: 20px;
    color: #64748b;
    font-size: 12px;
    grid-column: span 2;
}
</style>
