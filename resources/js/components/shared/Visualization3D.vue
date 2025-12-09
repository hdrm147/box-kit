<template>
    <div class="bk-viz-container" ref="container">
        <canvas ref="canvas"></canvas>
        <div class="bk-packing-status" :class="statusClass">
            {{ statusText }}
        </div>
    </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { packItems, countOverflow } from '../../utils/packingAlgorithm'

// Store Three.js objects outside Vue's reactivity
let scene = null
let camera = null
let renderer = null
let controls = null
let boxGroup = null
let itemsGroup = null
let animationId = null

export default {
    name: 'Visualization3D',

    props: {
        items: {
            type: Array,
            default: () => []
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

    data() {
        return {
            placements: [],
            isInitialized: false
        }
    },

    computed: {
        statusText() {
            if (!this.items.length) return 'No items to pack'
            if (!this.selectedBox) return 'Select a box'
            const overflow = countOverflow(this.placements)
            if (overflow > 0) return `${overflow} item(s) don't fit`
            return `All ${this.placements.length} items fit`
        },

        statusClass() {
            if (!this.items.length || !this.selectedBox) return ''
            const overflow = countOverflow(this.placements)
            if (overflow > 0) return 'bk-status-error'
            return 'bk-status-good'
        }
    },

    watch: {
        items: {
            deep: true,
            handler() {
                this.updateScene()
            }
        },
        selectedBox: {
            handler() {
                this.updateScene()
            }
        },
        padding: {
            handler() {
                this.updateScene()
            }
        }
    },

    mounted() {
        this.$nextTick(() => {
            this.initThree()
        })
    },

    beforeUnmount() {
        this.cleanup()
    },

    methods: {
        cleanup() {
            if (animationId) {
                cancelAnimationFrame(animationId)
                animationId = null
            }
            if (controls) {
                controls.dispose()
                controls = null
            }
            if (renderer) {
                renderer.dispose()
                renderer = null
            }
            scene = null
            camera = null
            boxGroup = null
            itemsGroup = null
            this.isInitialized = false
        },

        initThree() {
            const canvas = this.$refs.canvas
            const container = this.$refs.container

            if (!canvas || !container) {
                console.warn('[BoxKit] Canvas or container not found')
                return
            }

            const width = container.clientWidth || 400
            const height = container.clientHeight || 300

            // Scene
            scene = new THREE.Scene()
            scene.background = new THREE.Color(0x0f172a)

            // Camera
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
            camera.position.set(60, 40, 60)

            // Renderer
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            // Controls
            controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controls.dampingFactor = 0.05
            controls.minDistance = 20
            controls.maxDistance = 200

            // Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.6)
            scene.add(ambient)

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
            dirLight.position.set(50, 80, 50)
            scene.add(dirLight)

            const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.3)
            fillLight.position.set(-30, 20, -30)
            scene.add(fillLight)

            // Grid
            const grid = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b)
            scene.add(grid)

            // Groups
            boxGroup = new THREE.Group()
            itemsGroup = new THREE.Group()
            scene.add(boxGroup)
            scene.add(itemsGroup)

            this.isInitialized = true

            // Start animation
            this.animate()

            // Handle resize
            window.addEventListener('resize', this.onResize)

            // Initial render
            this.updateScene()
        },

        clearGroup(group) {
            if (!group) return
            while (group.children.length > 0) {
                const child = group.children[0]
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
                group.remove(child)
            }
        },

        createBox(box) {
            if (!boxGroup) return
            this.clearGroup(boxGroup)
            if (!box) return

            const { w, d, h } = box

            // Transparent box
            const boxMat = new THREE.MeshPhysicalMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                roughness: 0.9
            })

            const geo = new THREE.BoxGeometry(w, h, d)
            const mesh = new THREE.Mesh(geo, boxMat)
            mesh.position.set(0, h / 2, 0)
            boxGroup.add(mesh)

            // Edges
            const edges = new THREE.EdgesGeometry(geo)
            const edgeMat = new THREE.LineBasicMaterial({ color: 0x6B4423 })
            const edgeLines = new THREE.LineSegments(edges, edgeMat)
            edgeLines.position.set(0, h / 2, 0)
            boxGroup.add(edgeLines)

            // Center camera on box
            const maxDim = Math.max(w, h, d)
            camera.position.set(maxDim * 1.5, maxDim, maxDim * 1.5)
            controls.target.set(0, h / 2, 0)
            controls.update()
        },

        renderPackedItems() {
            if (!itemsGroup) return
            this.clearGroup(itemsGroup)

            const box = this.selectedBox
            if (!box) return

            // Offset to center the box at origin
            const offsetX = -box.w / 2
            const offsetZ = -box.d / 2

            this.placements.forEach(placement => {
                if (placement.overflow) return

                const { item, rawX, rawY, rawZ, w, h, d } = placement
                const color = item.color || item.originalColor || '#94a3b8'

                const mat = new THREE.MeshPhysicalMaterial({
                    color: color,
                    roughness: 0.4,
                    metalness: 0.2
                })

                const geo = new THREE.BoxGeometry(w - 0.3, h - 0.3, d - 0.3)
                const mesh = new THREE.Mesh(geo, mat)

                // Position using raw coordinates (corner-based) + offset to center
                mesh.position.set(
                    offsetX + rawX + w / 2,
                    rawY + h / 2,
                    offsetZ + rawZ + d / 2
                )
                itemsGroup.add(mesh)

                // Item edges
                const edges = new THREE.EdgesGeometry(geo)
                const edgeMat = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.4
                })
                const edgeLines = new THREE.LineSegments(edges, edgeMat)
                edgeLines.position.copy(mesh.position)
                itemsGroup.add(edgeLines)
            })
        },

        updateScene() {
            if (!this.isInitialized || !scene) return

            if (!this.selectedBox) {
                this.clearGroup(boxGroup)
                this.clearGroup(itemsGroup)
                this.placements = []
                return
            }

            this.createBox(this.selectedBox)

            // Pack items
            if (this.items.length > 0) {
                const itemsForPacking = this.items.map(item => ({
                    product: item,
                    qty: item.qty || 1
                }))
                this.placements = packItems(itemsForPacking, this.selectedBox, this.padding)
            } else {
                this.placements = []
            }

            this.renderPackedItems()
        },

        animate() {
            if (!renderer || !scene || !camera) return

            animationId = requestAnimationFrame(() => this.animate())

            if (controls) {
                controls.update()
            }

            renderer.render(scene, camera)
        },

        onResize() {
            const container = this.$refs.container
            if (!container || !camera || !renderer) return

            const width = container.clientWidth
            const height = container.clientHeight

            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)
        }
    }
}
</script>

<style scoped>
.bk-viz-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 250px;
    background: #0f172a;
    border-radius: 8px;
    overflow: hidden;
}

.bk-viz-container canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
}

.bk-packing-status {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.9);
    padding: 6px 14px;
    border-radius: 16px;
    border: 1px solid #334155;
    font-size: 11px;
    color: #94a3b8;
    white-space: nowrap;
}

.bk-packing-status.bk-status-good {
    border-color: #22c55e;
    color: #22c55e;
}

.bk-packing-status.bk-status-error {
    border-color: #ef4444;
    color: #ef4444;
}
</style>