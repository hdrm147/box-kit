<template>
    <div class="advisor-form">
        <div class="form-row">
            <div class="input-group">
                <label>Monthly Orders</label>
                <input
                    type="number"
                    v-model.number="monthlyOrders"
                    min="10"
                    max="10000"
                    class="advisor-input"
                />
            </div>
            <div class="input-group">
                <label>Safety Buffer %</label>
                <input
                    type="number"
                    v-model.number="safetyBuffer"
                    min="0"
                    max="100"
                    class="advisor-input"
                />
            </div>
        </div>
        <button class="calculate-btn" @click="calculate" type="button">
            Calculate Initial Stock
        </button>
    </div>
</template>

<script>
export default {
    name: 'AdvisorForm',

    props: {
        initialMonthlyOrders: {
            type: Number,
            default: 100
        },
        initialSafetyBuffer: {
            type: Number,
            default: 20
        }
    },

    emits: ['calculate'],

    data() {
        return {
            monthlyOrders: this.initialMonthlyOrders,
            safetyBuffer: this.initialSafetyBuffer
        }
    },

    methods: {
        calculate() {
            this.$emit('calculate', {
                monthlyOrders: this.monthlyOrders,
                safetyBuffer: this.safetyBuffer
            })
        }
    }
}
</script>

<style scoped>
.advisor-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.input-group label {
    font-size: 10px;
    color: #94a3b8;
    text-transform: uppercase;
}

.advisor-input {
    background: #1e293b;
    border: 1px solid #475569;
    border-radius: 6px;
    padding: 8px 10px;
    color: white;
    font-size: 13px;
    width: 100%;
}

.advisor-input:focus {
    outline: none;
    border-color: #22c55e;
}

.calculate-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.calculate-btn:hover {
    filter: brightness(1.1);
}
</style>
