import { player, updatePlayer } from "./player.js";
import { spawnEnemy, updateEnemies, enemies } from "./enemy.js";
import { renderGame } from "./render.js";
import { updateItems, items } from "./items.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bullets = [];
let lastTime = 0;

// Spawn 1 enemy per second
setInterval(() => {
    spawnEnemy();
}, 1000);

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;

        // Hit player
        if (b.fromEnemy) {
            if (Math.abs(b.x - player.x) < 12 && Math.abs(b.y - player.y) < 12) {
                player.hp -= 10;
                bullets.splice(i, 1);
                continue;
            }
        }

        // Remove offscreen
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

function gameLoop(time) {
    const dt = (time - lastTime) / 16.67;
    lastTime = time;

    updatePlayer(bullets, dt);
    updateEnemies(bullets, dt);
    updateBullets(dt);
    updateItems(player);

    renderGame(ctx, bullets, items);

    requestAnimationFrame(gameLoop);
}

gameLoop();
