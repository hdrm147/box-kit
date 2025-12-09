<template>
    <div class="bk-detail-wrapper">
        <div class="bk-detail-header">
            <span class="bk-field-label">{{ field.name }}</span>
        </div>
        <div class="bk-detail-content">
            <BoxPickerMain
                :items="items"
                :selected-box="value.selectedBox"
                :selected-supplier="value.selectedSupplier"
                :padding="value.padding ?? 0"
                :readonly="true"
            />
        </div>
    </div>
</template>

<script>
import BoxPickerMain from '../shared/BoxPickerMain.vue'

export default {
    components: {
        BoxPickerMain
    },

    props: ['index', 'resource', 'resourceName', 'resourceId', 'field'],

    computed: {
        value() {
            return this.field.value || {}
        },

        items() {
            return this.value?.items || []
        }
    }
}
</script>

<style scoped>
.bk-detail-wrapper {
    width: 100%;
    padding: 16px 0;
}

.bk-detail-header {
    margin-bottom: 12px;
}

.bk-field-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--colors-gray-500);
}

.bk-detail-content {
    background: #0f172a;
    border-radius: 12px;
    padding: 16px;
    min-height: 500px;
}

:deep(.dark) .bk-detail-content {
    background: #0f172a;
}
</style>
