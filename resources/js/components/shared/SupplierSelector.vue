<template>
    <div class="bk-supplier-selector">
        <button
            v-for="supplier in suppliersList"
            :key="supplier.id"
            class="bk-supplier-btn"
            :class="{ 'bk-active': modelValue === supplier.id }"
            @click="$emit('update:modelValue', supplier.id)"
            type="button"
        >
            <span class="bk-supplier-name">{{ supplier.name }}</span>
            <span class="bk-supplier-phone">{{ supplier.phone }}</span>
        </button>
    </div>
</template>

<script>
import { suppliers } from '../../data/suppliers'

export default {
    name: 'SupplierSelector',

    props: {
        modelValue: {
            type: String,
            default: 'satar'
        }
    },

    emits: ['update:modelValue'],

    computed: {
        suppliersList() {
            return Object.values(suppliers)
        }
    }
}
</script>

<style scoped>
.bk-supplier-selector {
    display: flex;
    gap: 8px;
}

.bk-supplier-btn {
    flex: 1;
    padding: 8px 12px;
    background: #334155;
    border: 2px solid #475569;
    border-radius: 6px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
}

.bk-supplier-btn:hover {
    background: #475569;
    color: #e2e8f0;
}

.bk-supplier-btn.bk-active {
    background: rgba(34, 197, 94, 0.15);
    border-color: #22c55e;
    color: #22c55e;
}

.bk-supplier-name {
    font-size: 12px;
    font-weight: 600;
    display: block;
}

.bk-supplier-phone {
    font-size: 9px;
    opacity: 0.7;
}
</style>
