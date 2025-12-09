<template>
    <DefaultField :field="field" :errors="errors" :show-help-text="showHelpText">
        <template #field>
            <div class="bk-form-field">
                <div class="bk-form-row">
                    <label class="bk-label">Supplier</label>
                    <select v-model="currentSupplier" class="bk-select">
                        <option value="satar">Satar</option>
                        <option value="hdrm">HDRM</option>
                    </select>
                </div>

                <div class="bk-form-row">
                    <label class="bk-label">Box</label>
                    <select v-model="currentBox" class="bk-select">
                        <option :value="null">Auto-select best box</option>
                        <option v-for="box in currentBoxes" :key="box.id" :value="box.id">
                            {{ box.name }} ({{ box.type === 'laptop' ? 'Flat' : 'Cube' }})
                        </option>
                    </select>
                </div>

                <div class="bk-form-row">
                    <label class="bk-label">Padding</label>
                    <div class="bk-padding-input">
                        <input
                            type="range"
                            v-model.number="currentPadding"
                            min="0"
                            max="5"
                            step="0.5"
                            class="bk-range"
                        />
                        <span class="bk-padding-value">{{ currentPadding }} cm</span>
                    </div>
                </div>

                <div v-if="items.length" class="bk-items-info">
                    <span class="bk-items-count">{{ validItems.length }} items</span>
                    <span v-if="invalidItems.length" class="bk-items-warning">
                        ({{ invalidItems.length }} missing dimensions)
                    </span>
                </div>
            </div>
        </template>
    </DefaultField>
</template>

<script>
import { FormField, HandlesValidationErrors } from 'laravel-nova'
import { getBoxes } from '../../data/suppliers'

export default {
    mixins: [FormField, HandlesValidationErrors],

    props: ['resourceName', 'resourceId', 'field'],

    data() {
        return {
            currentSupplier: 'satar',
            currentBox: null,
            currentPadding: 0
        }
    },

    computed: {
        items() {
            return this.value?.items || []
        },

        validItems() {
            return this.items.filter(item => item.w > 0 && item.h > 0 && item.d > 0)
        },

        invalidItems() {
            return this.items.filter(item => !(item.w > 0 && item.h > 0 && item.d > 0))
        },

        currentBoxes() {
            return getBoxes(this.currentSupplier)
        }
    },

    watch: {
        currentSupplier() {
            // Reset box selection when supplier changes
            this.currentBox = null
        }
    },

    methods: {
        setInitialValue() {
            this.value = this.field.value || {
                items: [],
                selectedBox: null,
                selectedSupplier: 'satar',
                padding: 0
            }
            this.currentSupplier = this.value.selectedSupplier || 'satar'
            this.currentBox = this.value.selectedBox || null
            this.currentPadding = this.value.padding || 0
        },

        fill(formData) {
            formData.append(
                this.fieldAttribute,
                JSON.stringify({
                    selectedBox: this.currentBox,
                    selectedSupplier: this.currentSupplier,
                    padding: this.currentPadding
                })
            )
        }
    }
}
</script>

<style scoped>
.bk-form-field {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bk-form-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bk-label {
    font-size: 13px;
    color: var(--colors-gray-500);
    min-width: 70px;
}

.bk-select {
    flex: 1;
    max-width: 300px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--colors-gray-300);
    background: var(--colors-white);
    font-size: 13px;
    color: var(--colors-gray-700);
}

.dark .bk-select {
    background: var(--colors-gray-900);
    border-color: var(--colors-gray-700);
    color: var(--colors-gray-300);
}

.bk-padding-input {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    max-width: 300px;
}

.bk-range {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    background: var(--colors-gray-300);
    border-radius: 2px;
}

.dark .bk-range {
    background: var(--colors-gray-700);
}

.bk-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--colors-primary-500);
    border-radius: 50%;
    cursor: pointer;
}

.bk-padding-value {
    font-size: 13px;
    color: var(--colors-gray-600);
    min-width: 50px;
}

.bk-items-info {
    font-size: 12px;
    color: var(--colors-gray-500);
    padding: 8px 12px;
    background: var(--colors-gray-100);
    border-radius: 6px;
    max-width: 300px;
}

.dark .bk-items-info {
    background: var(--colors-gray-800);
}

.bk-items-warning {
    color: var(--colors-yellow-600);
}
</style>
