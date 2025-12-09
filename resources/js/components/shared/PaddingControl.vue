<template>
    <div class="bk-padding-control">
        <label>Padding:</label>
        <input
            type="range"
            :value="modelValue"
            @input="$emit('update:modelValue', parseFloat($event.target.value))"
            min="0"
            max="5"
            step="0.5"
        />
        <span class="bk-padding-value">{{ modelValue }}cm</span>
    </div>
</template>

<script>
export default {
    name: 'PaddingControl',

    props: {
        modelValue: {
            type: Number,
            default: 0
        }
    },

    emits: ['update:modelValue']
}
</script>

<style scoped>
.bk-padding-control {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1e293b;
    padding: 8px 12px;
    border-radius: 6px;
}

.bk-padding-control label {
    font-size: 10px;
    color: #64748b;
    white-space: nowrap;
}

.bk-padding-control input[type="range"] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    background: #334155;
    border-radius: 2px;
    min-width: 60px;
}

.bk-padding-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #38bdf8;
    border-radius: 50%;
    cursor: pointer;
}

.bk-padding-value {
    font-size: 11px;
    color: #38bdf8;
    font-weight: 600;
    min-width: 32px;
    text-align: right;
}
</style>
