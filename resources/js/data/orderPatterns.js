/**
 * Realistic order patterns for PC components e-commerce
 * Used for Pareto-based purchase recommendations
 *
 * Distribution:
 * - 60% single items or small upgrades (SSD, RAM, GPU)
 * - 25% combo purchases (CPU+Cooler, GPU+PSU, Platform upgrades)
 * - 10% full builds
 * - 5% large items (cases, monitors, chairs)
 */

export const orderPatterns = [
    {
        id: 'storage-upgrade',
        name: 'Storage Upgrade',
        description: 'Customer adding SSD/NVMe to existing system',
        weight: 0.15,
        recommendedBox: 'xs',
        boxReasoning: 'NVMe is 14×10×2cm. XS box (15×10×8cm) fits perfectly with minimal wasted space.',
        customerProfile: 'Gamers needing more storage, professionals adding work drives'
    },
    {
        id: 'ram-upgrade',
        name: 'Memory Upgrade',
        description: 'Customer upgrading RAM in existing system',
        weight: 0.12,
        recommendedBox: 's',
        boxReasoning: 'RAM kit is 18×12×4cm. Small box provides room for bubble wrap protection.',
        customerProfile: 'Users upgrading from 8GB to 16GB/32GB'
    },
    {
        id: 'gpu-only',
        name: 'GPU Upgrade',
        description: 'Single graphics card - most valuable single-item order',
        weight: 0.18,
        recommendedBox: 'm',
        boxReasoning: 'GPU is 28×13×5cm. Medium box allows proper cushioning around fragile component.',
        customerProfile: 'Gamers upgrading, 1-2 year upgrade cycle'
    },
    {
        id: 'cpu-cooler-combo',
        name: 'CPU + Cooler Combo',
        description: 'Natural pairing - CPU often needs aftermarket cooling',
        weight: 0.10,
        recommendedBox: 'm',
        boxReasoning: 'CPU + Tower cooler combined volume fits Medium box. Stack vertically with divider.',
        customerProfile: 'Enthusiasts who know stock coolers are inadequate'
    },
    {
        id: 'platform-upgrade',
        name: 'Platform Upgrade',
        description: 'CPU + Motherboard + RAM - complete platform refresh',
        weight: 0.12,
        recommendedBox: 'l',
        boxReasoning: 'Motherboard (35×30cm) dictates box size. Large box fits mobo flat with CPU/RAM on top.',
        customerProfile: 'Users doing major upgrades every 3-5 years'
    },
    {
        id: 'gpu-psu-combo',
        name: 'GPU + PSU Combo',
        description: 'New GPU often requires PSU upgrade for power demands',
        weight: 0.08,
        recommendedBox: 'l',
        boxReasoning: 'Large GPU + ATX PSU exceed Medium box. Large allows side-by-side with foam divider.',
        customerProfile: 'Gamers upgrading to RTX 4070+ class cards'
    },
    {
        id: 'full-build-internal',
        name: 'Full Build (No Case)',
        description: 'All internal components - customer has case separately',
        weight: 0.08,
        recommendedBox: 'xl',
        boxReasoning: '7 items need XL box. Low fill rate necessary for retail boxes + foam separators.',
        customerProfile: 'DIY builders, first-time builders following YouTube guides'
    },
    {
        id: 'peripherals-bundle',
        name: 'Peripherals Bundle',
        description: 'Keyboard + Mouse + Headset - common desk setup',
        weight: 0.07,
        recommendedBox: 'm',
        boxReasoning: 'Keyboard (48×20cm) is longest. Place diagonally, mouse and headset fill gaps.',
        customerProfile: 'New PC owners, office setups, gifts'
    },
    {
        id: 'case-order',
        name: 'PC Case Only',
        description: 'Case purchased separately for case swaps or builds',
        weight: 0.05,
        recommendedBox: 'case-m',
        boxReasoning: 'Mid-tower (50×52cm) needs dedicated case box. Double-boxed for protection.',
        customerProfile: 'Enthusiasts doing case swaps, aesthetic upgrades'
    },
    {
        id: 'monitor-order',
        name: 'Monitor Only',
        description: 'Display purchase - high value, fragile item',
        weight: 0.05,
        recommendedBox: 'monitor-m',
        boxReasoning: '27" monitor needs Monitor-M box. Extra padding critical - highest damage rate.',
        customerProfile: 'Gamers upgrading displays, work-from-home setups'
    }
]

/**
 * Size ranges for mapping order types to actual supplier boxes
 */
export const sizeRanges = {
    'xs': { maxVol: 1500 },
    's': { maxVol: 6000 },
    'm': { maxVol: 20000 },
    'l': { maxVol: 50000 },
    'xl': { maxVol: 100000 },
    'xxl': { maxVol: 150000 },
    'case-m': { minVol: 100000, maxVol: 130000 },
    'case-l': { minVol: 130000 },
    'monitor-s': { minVol: 60000, maxVol: 80000 },
    'monitor-m': { minVol: 80000, maxVol: 100000 },
    'monitor-l': { minVol: 100000 },
}

export default orderPatterns
