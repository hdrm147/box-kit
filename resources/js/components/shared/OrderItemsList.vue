<template>
    <div class="bk-order-items-container">
        <div v-if="!items.length" class="bk-empty-order">
            No items in order
        </div>
        <div v-else class="bk-order-items">
            <div
                v-for="(item, index) in items"
                :key="item.id || index"
                class="bk-order-item"
                :class="{ 'bk-missing-dims': !hasDimensions(item) }"
            >
                <div class="bk-order-item-info">
                    <div
                        class="bk-item-color"
                        :style="{ background: item.color || '#94a3b8' }"
                    ></div>
                    <div class="bk-item-details">
                        <span class="bk-item-name">{{ item.name }}</span>
                        <span v-if="hasDimensions(item)" class="bk-item-dims">
                            {{ item.w }} × {{ item.d }} × {{ item.h }} cm
                        </span>
                        <span v-else class="bk-item-dims bk-missing">
                            Missing dimensions
                        </span>
                    </div>
                </div>
                <div class="bk-item-qty">
                    ×{{ item.qty || 1 }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'OrderItemsList',

    props: {
        items: {
            type: Array,
            default: () => []
        }
    },

    methods: {
        hasDimensions(item) {
            return item.w > 0 && item.h > 0 && item.d > 0
        }
    }
}
</script>

<style scoped>
.bk-order-items-container {
    max-height: 200px;
    overflow-y: auto;
}

.bk-order-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.bk-order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: #334155;
    border-radius: 6px;
}

.bk-order-item.bk-missing-dims {
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
}

.bk-order-item-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.bk-item-color {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
}

.bk-item-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.bk-item-name {
    font-size: 12px;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bk-item-dims {
    font-size: 10px;
    color: #64748b;
}

.bk-item-dims.bk-missing {
    color: #eab308;
}

.bk-item-qty {
    font-size: 12px;
    font-weight: 600;
    color: #38bdf8;
    flex-shrink: 0;
    margin-left: 8px;
}

.bk-empty-order {
    text-align: center;
    padding: 20px;
    color: #64748b;
    font-size: 12px;
}
</style>