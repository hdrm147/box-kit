import IndexField from './components/field/IndexField.vue'
import DetailField from './components/field/DetailField.vue'
import FormField from './components/field/FormField.vue'

Nova.booting((app, store) => {
    app.component('index-box-kit-field', IndexField)
    app.component('detail-box-kit-field', DetailField)
    app.component('form-box-kit-field', FormField)
})
