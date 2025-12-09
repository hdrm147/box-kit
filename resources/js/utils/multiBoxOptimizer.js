/**
 * Multi-Box Optimizer
 * Finds the optimal number of boxes (N) and item assignment to minimize total cost
 */

import { packItems, allItemsFit } from './packingAlgorithm'
import { getUnitPrice } from './pricingFunctions'

/**
 * Find optimal boxing strategy for a set of items
 * @param {Array} items - Items with dimensions {w, h, d, qty, name}
 * @param {Array} boxes - Available box types
 * @param {Object} options - Configuration options
 * @returns {Object} Optimal solution with alternatives
 */
export function findOptimalBoxing(items, boxes, options = {}) {
    const {
        padding = 0,
        qtyTier = 25,
        shippingRatePerKg = 0,
        dimFactor = 5000,
        maxBoxes = 5
    } = options

    // Expand items by quantity
    const expandedItems = []
    items.forEach((item, idx) => {
        const qty = item.qty || 1
        for (let i = 0; i < qty; i++) {
            expandedItems.push({
                ...item,
                originalIndex: idx,
                instanceId: `${idx}-${i}`
            })
        }
    })

    const n = expandedItems.length

    if (n === 0) {
        return {
            optimal: null,
            alternatives: [],
            analysis: { itemCount: 0, message: 'No items to pack' }
        }
    }

    // For small orders, use exact algorithm
    // For larger orders, use greedy with improvements
    let solutions

    if (n <= 6) {
        solutions = exactOptimal(expandedItems, boxes, { padding, qtyTier, shippingRatePerKg, dimFactor })
    } else if (n <= 10) {
        solutions = boundedSearch(expandedItems, boxes, { padding, qtyTier, shippingRatePerKg, dimFactor, maxBoxes, timeout: 500 })
    } else {
        solutions = greedyWithOptimization(expandedItems, boxes, { padding, qtyTier, shippingRatePerKg, dimFactor, maxBoxes })
    }

    // Sort by total cost
    solutions.sort((a, b) => a.totalCost - b.totalCost)

    // Remove duplicates (same number of boxes, same total cost)
    const unique = []
    const seen = new Set()
    for (const sol of solutions) {
        const key = `${sol.numBoxes}-${Math.round(sol.totalCost)}`
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(sol)
        }
    }

    const optimal = unique[0] || null
    const alternatives = unique.slice(1, 4) // Top 3 alternatives

    // Calculate savings compared to alternatives
    if (optimal && alternatives.length > 0) {
        alternatives.forEach(alt => {
            alt.costDiff = alt.totalCost - optimal.totalCost
            alt.costDiffPercent = Math.round((alt.costDiff / optimal.totalCost) * 100)
        })
    }

    return {
        optimal,
        alternatives,
        analysis: {
            itemCount: n,
            originalItemCount: items.length,
            algorithUsed: n <= 6 ? 'exact' : (n <= 10 ? 'bounded' : 'greedy'),
            solutionsEvaluated: solutions.length
        }
    }
}

/**
 * Exact optimal solution using partition enumeration (n ≤ 6)
 */
function exactOptimal(items, boxes, options) {
    const partitions = generateAllPartitions(items)
    const solutions = []

    for (const partition of partitions) {
        const solution = evaluatePartition(partition, boxes, options)
        if (solution) {
            solutions.push(solution)
        }
    }

    return solutions
}

/**
 * Generate all set partitions (Bell partitions)
 */
function generateAllPartitions(items) {
    if (items.length === 0) return [[]]
    if (items.length === 1) return [[[items[0]]]]

    const [first, ...rest] = items
    const subPartitions = generateAllPartitions(rest)
    const result = []

    for (const partition of subPartitions) {
        // Add first item to each existing group
        for (let i = 0; i < partition.length; i++) {
            result.push(partition.map((group, j) =>
                j === i ? [first, ...group] : [...group]
            ))
        }
        // Create new group with first item
        result.push([[first], ...partition])
    }

    return result
}

/**
 * Bounded search with pruning (n = 7-10)
 */
function boundedSearch(items, boxes, options) {
    const { maxBoxes = 5, timeout = 500 } = options
    const startTime = Date.now()
    const solutions = []

    // Sort items by volume (largest first) for better pruning
    const sortedItems = [...items].sort((a, b) =>
        (b.w * b.h * b.d) - (a.w * a.h * a.d)
    )

    let bestCost = Infinity

    function search(remaining, currentGroups) {
        // Timeout check
        if (Date.now() - startTime > timeout) return

        // Base case: all items assigned
        if (remaining.length === 0) {
            const solution = evaluatePartition(currentGroups, boxes, options)
            if (solution) {
                solutions.push(solution)
                if (solution.totalCost < bestCost) {
                    bestCost = solution.totalCost
                }
            }
            return
        }

        // Pruning: too many groups
        if (currentGroups.length >= maxBoxes) {
            // Must add to existing groups
            const item = remaining[0]
            const rest = remaining.slice(1)

            for (let i = 0; i < currentGroups.length; i++) {
                const newGroups = currentGroups.map((g, j) =>
                    j === i ? [...g, item] : [...g]
                )
                search(rest, newGroups)
            }
            return
        }

        const item = remaining[0]
        const rest = remaining.slice(1)

        // Option 1: Add to existing group
        for (let i = 0; i < currentGroups.length; i++) {
            const newGroups = currentGroups.map((g, j) =>
                j === i ? [...g, item] : [...g]
            )
            search(rest, newGroups)
        }

        // Option 2: Start new group
        search(rest, [...currentGroups, [item]])
    }

    search(sortedItems, [])

    return solutions
}

/**
 * Greedy with local optimization (n > 10)
 */
function greedyWithOptimization(items, boxes, options) {
    // Phase 1: Greedy First Fit Decreasing
    const initial = greedyFFD(items, boxes, options)
    if (!initial) return []

    const solutions = [initial]

    // Phase 2: Try improvements
    // Try merging boxes
    const merged = tryMergeBoxes(initial, boxes, options)
    if (merged) solutions.push(merged)

    return solutions
}

/**
 * Greedy First Fit Decreasing
 */
function greedyFFD(items, boxes, options) {
    const { padding, qtyTier } = options

    // Sort items by volume descending
    const sorted = [...items].sort((a, b) =>
        (b.w * b.h * b.d) - (a.w * a.h * a.d)
    )

    const groups = []

    for (const item of sorted) {
        let placed = false

        // Try to fit in existing group
        for (const group of groups) {
            const testGroup = [...group, item]
            const fittingBox = findSmallestFittingBox(testGroup, boxes, padding)
            if (fittingBox) {
                group.push(item)
                placed = true
                break
            }
        }

        // Need new group
        if (!placed) {
            groups.push([item])
        }
    }

    return evaluatePartition(groups, boxes, options)
}

/**
 * Try to merge two boxes into one
 */
function tryMergeBoxes(solution, boxes, options) {
    if (solution.numBoxes < 2) return null

    const { padding, qtyTier } = options
    let bestMerge = null
    let bestCost = solution.totalCost

    // Try merging each pair of boxes
    for (let i = 0; i < solution.assignments.length; i++) {
        for (let j = i + 1; j < solution.assignments.length; j++) {
            const combinedItems = [
                ...solution.assignments[i].items,
                ...solution.assignments[j].items
            ]

            const fittingBox = findSmallestFittingBox(combinedItems, boxes, padding)
            if (fittingBox) {
                // Create new solution with merged boxes
                const newAssignments = solution.assignments.filter((_, idx) =>
                    idx !== i && idx !== j
                )
                newAssignments.push({
                    box: fittingBox,
                    items: combinedItems
                })

                const newSolution = calculateSolutionCost(newAssignments, options)
                if (newSolution.totalCost < bestCost) {
                    bestCost = newSolution.totalCost
                    bestMerge = newSolution
                }
            }
        }
    }

    return bestMerge
}

/**
 * Evaluate a partition and find optimal boxes
 */
function evaluatePartition(partition, boxes, options) {
    const { padding, qtyTier, shippingRatePerKg, dimFactor } = options
    const assignments = []

    for (const group of partition) {
        if (group.length === 0) continue

        const fittingBox = findSmallestFittingBox(group, boxes, padding)
        if (!fittingBox) {
            return null // Invalid partition - group can't fit
        }

        assignments.push({
            box: fittingBox,
            items: group
        })
    }

    return calculateSolutionCost(assignments, options)
}

/**
 * Find smallest box that fits a group of items
 */
function findSmallestFittingBox(items, boxes, padding = 0) {
    const fittingBoxes = boxes.filter(box => {
        const itemsForPacking = items.map(item => ({
            product: item,
            qty: 1
        }))
        const placements = packItems(itemsForPacking, box, padding)
        return allItemsFit(placements)
    })

    if (fittingBoxes.length === 0) return null

    // Return smallest by volume
    return fittingBoxes.sort((a, b) =>
        (a.w * a.h * a.d) - (b.w * b.h * b.d)
    )[0]
}

/**
 * Calculate total cost for a solution
 */
function calculateSolutionCost(assignments, options) {
    const { qtyTier = 25, shippingRatePerKg = 0, dimFactor = 5000 } = options

    let totalBoxCost = 0
    let totalShippingCost = 0

    const detailedAssignments = assignments.map(({ box, items }) => {
        // Box cost
        const boxCost = box.prices ? (box.prices[qtyTier] || box.prices[25] || 0) * 1000 / qtyTier : 0

        // Shipping cost (dimensional weight)
        let shippingCost = 0
        if (shippingRatePerKg > 0) {
            const dimWeight = (box.w * box.d * box.h) / dimFactor
            shippingCost = dimWeight * shippingRatePerKg
        }

        totalBoxCost += boxCost
        totalShippingCost += shippingCost

        // Group items by original product
        const itemSummary = {}
        items.forEach(item => {
            const key = item.originalIndex !== undefined ? item.originalIndex : item.name
            if (!itemSummary[key]) {
                itemSummary[key] = { name: item.name, qty: 0, color: item.color }
            }
            itemSummary[key].qty++
        })

        return {
            box: {
                id: box.id,
                name: box.name,
                w: box.w,
                h: box.h,
                d: box.d,
                type: box.type,
                prices: box.prices
            },
            items,
            itemSummary: Object.values(itemSummary),
            boxCost,
            shippingCost,
            totalCost: boxCost + shippingCost
        }
    })

    return {
        assignments: detailedAssignments,
        numBoxes: detailedAssignments.length,
        totalBoxCost,
        totalShippingCost,
        totalCost: totalBoxCost + totalShippingCost
    }
}

/**
 * Format price in IQD
 */
export function formatCost(cost) {
    if (cost >= 1000000) {
        return (cost / 1000000).toFixed(1) + 'M'
    } else if (cost >= 1000) {
        return Math.round(cost / 1000) + 'K'
    }
    return Math.round(cost) + ''
}

export default {
    findOptimalBoxing,
    formatCost
}
