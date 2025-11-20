// =========================
// ITEMS SYSTEM
// =========================

// Healing, stamina, misc items
const ITEMS = {
    medkit: {
        name: "Medkit",
        type: "heal",
        healAmount: 40,
        color: "red"
    },

    smallMedkit: {
        name: "Small Medkit",
        type: "heal",
        healAmount: 15,
        color: "pink"
    },

    staminaBoost: {
        name: "Stamina Boost",
        type: "buff",
        duration: 6000, // 6 seconds
        staminaIncrease: 40,
        color: "blue"
    },

    // Materials/currency drops
    scrap: {
        name: "Scrap",
        type: "material",
        amount: 1,
        color: "gray"
    },

    electronics: {
        name: "Electronics",
        type: "material",
        amount: 1,
        color: "yellow"
    },

    fuel: {
        name: "Fuel",
        type: "material",
        amount: 1,
        color: "orange"
    }
};


// ======================================
// RANDOM DROP GENERATOR
// Better RNG -> no long streaks
// ======================================

function weightedRandomItem() {
    // Drop chances (total = 100)
    const lootTable = [
        { item: "medkit", weight: 12 },
        { item: "smallMedkit", weight: 18 },
        { item: "staminaBoost", weight: 10 },
        { item: "scrap", weight: 25 },
        { item: "electronics", weight: 20 },
        { item: "fuel", weight: 15 }
    ];

    let total = lootTable.reduce((acc, x) => acc + x.weight, 0);
    let roll = Math.random() * total;

    for (let entry of lootTable) {
        if (roll < entry.weight) {
            return ITEMS[entry.item];
        }
        roll -= entry.weight;
    }

    return ITEMS.scrap; // fallback
}


// ======================================
// EXPORT
// ======================================

export { ITEMS, weightedRandomItem };
