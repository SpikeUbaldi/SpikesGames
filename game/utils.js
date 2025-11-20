function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

// weighted random used for drops
function weightedRandom(list) {
    const total = list.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;

    for (let item of list) {
        if (r < item.weight) return item.value;
        r -= item.weight;
    }
    return list[0].value;
}
