import Tool from './components/tool/Tool.vue'

Nova.booting((app, store) => {
    Nova.inertia('BoxKit', Tool)
})
