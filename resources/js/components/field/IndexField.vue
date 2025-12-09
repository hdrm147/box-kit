<template>
    <span class="index-field">
        <span v-if="selectedBox" class="box-badge">
            {{ selectedBox }}
        </span>
        <span v-else class="no-box">-</span>
    </span>
</template>

<script>
export default {
    props: ['resourceName', 'field'],

    computed: {
        value() {
            return this.field.value || {}
        },

        selectedBox() {
            return this.value.selectedBox
        }
    }
}
</script>

<style scoped>
.index-field {
    display: inline-flex;
    align-items: center;
}

.box-badge {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.no-box {
    color: #94a3b8;
}
</style>
