import { randRange } from "./utils.js";
import { player } from "./player.js";

export const enemies = [];
let enemyId = 0;

export function spawnEnemy() {
    const e = {
        id: enemyId++,
        x: randRange(50, 850),
        y: randRange(50, 550),
        hp: 30,
        speed: 1.1,
        cooldown: 0,
        fireRate: 40,
        bulletSpeed: 3
    };
    enemies.push(e);
}

export function updateEnemies(bullets, dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // Move towards player
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            e.x += (dx / dist) * e.speed;
            e.y += (dy / dist) * e.speed;
        }

        // Enemy shooting logic
        if (e.cooldown > 0) e.cooldown--;
        else {
            e.cooldown = e.fireRate;

            // Add bullet with slight spread
            const spread = (Math.random() - 0.5) * 0.4;

            bullets.push({
                x: e.x,
                y: e.y,
                dx: (dx / dist) + spread,
                dy: (dy / dist) + spread,
                speed: e.bulletSpeed,
                fromEnemy: true
            });
        }

        // Remove dead enemies
        if (e.hp <= 0) {
            enemies.splice(i, 1);
        }
    }
}
