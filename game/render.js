import { enemies } from "./enemy.js";
import { player } from "./player.js";

export function renderGame(ctx, bullets, items) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // PLAYER
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

    // ENEMIES
    ctx.fillStyle = "red";
    for (let e of enemies) {
        ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
    }

    // BULLETS
    ctx.fillStyle = "yellow";
    for (let b of bullets) {
        ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }

    // ITEMS
    for (let item of items) {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}
