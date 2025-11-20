// =============================
// GAME ENGINE
// =============================

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

// =============================
// GLOBAL STATE
// =============================
let keys = {};
let bullets = [];
let enemyBullets = [];
let enemies = [];
let drops = [];
let lastPickup = 0;

// Load modules
// (weapons.js gives: WEAPONS)
// (items.js gives: ITEMS)
let player = {
    x: 450,
    y: 300,
    speed: 3,
    width: 30,
    height: 30,
    color: "white",

    health: 100,
    maxHealth: 100,

    stamina: 100,
    maxStamina: 100,
    sprinting: false,

    inventory: [null, null, null],
    activeSlot: 0,

    reloading: false,
    reloadProgress: 0,
    reloadTime: 0,

    canPickup: true,
};

// =============================
// INPUT
// =============================
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("click", () => {
    shootPlayerGun();
});

// Switch inventory slots
window.addEventListener("keydown", e => {
    if (e.key === "1") player.activeSlot = 0;
    if (e.key === "2") player.activeSlot = 1;
    if (e.key === "3") player.activeSlot = 2;
});

// Reload
window.addEventListener("keydown", e => {
    if (e.key === "r") startReload();
});

// =============================
// MOVEMENT
// =============================
function movePlayer() {
    let speed = player.speed;

    if (keys["Shift"] && player.stamina > 0) {
        speed = 5;
        player.sprinting = true;
        player.stamina -= 0.4;
    } else {
        player.sprinting = false;
        player.stamina = Math.min(player.maxStamina, player.stamina + 0.3);
    }

    if (keys["w"]) player.y -= speed;
    if (keys["s"]) player.y += speed;
    if (keys["a"]) player.x -= speed;
    if (keys["d"]) player.x += speed;
}

// =============================
// SHOOTING (PLAYER)
// =============================
function shootPlayerGun() {
    const weapon = player.inventory[player.activeSlot];
    if (!weapon) return;
    if (player.reloading) return;

    if (weapon.ammo <= 0) {
        startReload();
        return;
    }

    const now = performance.now();
    if (now - weapon.lastShot < weapon.fireRate) return;

    weapon.lastShot = now;
    weapon.ammo--;

    bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(0) * weapon.bulletSpeed,
        dy: Math.sin(0) * weapon.bulletSpeed,
        life: weapon.bulletLife,
        damage: weapon.damage
    });
}

// =============================
// SHOOTING (ENEMY)
// =============================
function enemyShoot(e) {
    const now = performance.now();
    if (now - e.lastShot < e.weapon.fireRate) return;

    e.lastShot = now;

    // Aim toward player
    let ang = Math.atan2(player.y - e.y, player.x - e.x);

    // Spread
    ang += (Math.random() - 0.5) * e.weapon.spread;

    enemyBullets.push({
        x: e.x,
        y: e.y,
        dx: Math.cos(ang) * (e.weapon.bulletSpeed * 0.6),
        dy: Math.sin(ang) * (e.weapon.bulletSpeed * 0.6),
        life: e.weapon.bulletLife,
        damage: e.weapon.damage * 0.7,
        owner: e
    });
}

// =============================
// RELOAD
// =============================
function startReload() {
    const weapon = player.inventory[player.activeSlot];
    if (!weapon || player.reloading) return;

    player.reloading = true;
    player.reloadProgress = 0;
    player.reloadTime = weapon.reloadTime;
}

function updateReload() {
    if (!player.reloading) return;

    player.reloadProgress += 16.7;

    if (player.reloadProgress >= player.reloadTime) {
        const weapon = player.inventory[player.activeSlot];
        weapon.ammo = weapon.magSize;
        player.reloading = false;
    }
}

// =============================
// ENEMY LOGIC
// =============================
function spawnEnemy() {
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        health: 100,
        maxHealth: 100,
        weapon: Math.random() < 0.5 ? cloneWeapon("pistol") : cloneWeapon("ak"),
        lastShot: 0,
        visibleHealth: false
    });
}

function moveEnemies() {
    enemies.forEach(e => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let dist = Math.hypot(dx, dy);

        if (dist > 200) {  
            e.x += dx / dist * 1.2;
            e.y += dy / dist * 1.2;
        } else {
            enemyShoot(e);
        }
    });
}

// =============================
// DROPS
// =============================
function dropItem(enemy) {
    const roll = Math.random();
    let item;

    if (roll < 0.33) item = cloneWeapon("pistol");
    else if (roll < 0.66) item = cloneWeapon("ak");
    else item = ITEMS.medkit();

    drops.push({
        x: enemy.x,
        y: enemy.y,
        data: item,
        color: item.color,
        size: 20
    });
}

function pickupCheck() {
    if (performance.now() - lastPickup < 300) return;

    drops = drops.filter(d => {
        if (Math.hypot(d.x - player.x, d.y - player.y) < 35) {
            lastPickup = performance.now();
            assignToInventory(d.data);
            return false;
        }
        return true;
    });
}

// put item in first free slot
function assignToInventory(item) {
    for (let i = 0; i < 3; i++) {
        if (!player.inventory[i]) {
            player.inventory[i] = item;
            return;
        }
    }
}

// =============================
// BULLET UPDATES
// =============================
function updateBullets() {
    bullets = bullets.filter(b => {
        b.x += b.dx;
        b.y += b.dy;
        b.life -= 16.7;

        let hit = enemies.find(e => Math.hypot(e.x - b.x, e.y - b.y) < 25);
        if (hit) {
            hit.health -= b.damage;
            hit.visibleHealth = true;
            if (hit.health <= 0) {
                dropItem(hit);
                enemies.splice(enemies.indexOf(hit), 1);
            }
            return false;
        }

        return b.life > 0;
    });
}

function updateEnemyBullets() {
    enemyBullets = enemyBullets.filter(b => {
        b.x += b.dx;
        b.y += b.dy;
        b.life -= 16.7;

        if (Math.hypot(player.x - b.x, player.y - b.y) < 20) {
            player.health -= b.damage;
            return false;
        }

        return b.life > 0;
    });
}

// =============================
// DRAW
// =============================
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 15, player.y - 15, 30, 30);
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = "red";
        ctx.fillRect(e.x - 15, e.y - 15, 30, 30);

        if (e.visibleHealth) {
            ctx.fillStyle = "black";
            ctx.fillRect(e.x - 20, e.y - 30, 40, 5);

            ctx.fillStyle = "lime";
            ctx.fillRect(e.x - 20, e.y - 30, 40 * (e.health / e.maxHealth), 5);
        }
    });
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 6, 3));

    ctx.fillStyle = "orange";
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 6, 3));
}

function drawDrops() {
    drops.forEach(d => {
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x - 10, d.y - 10, 20, 20);
    });
}

// UI
function drawUI() {
    // Health
    ctx.fillStyle = "red";
    ctx.fillRect(player.x - 20, player.y + 35, 40, 5);
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x - 20, player.y + 35, 40 * (player.health / player.maxHealth), 5);

    // Stamina
    ctx.fillStyle = "gray";
    ctx.fillRect(player.x - 20, player.y + 42, 40, 5);
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x - 20, player.y + 42, 40 * (player.stamina / player.maxStamina), 5);

    // Reload Bar
    if (player.reloading) {
        ctx.fillStyle = "black";
        ctx.fillRect(player.x - 20, player.y + 49, 40, 5);

        ctx.fillStyle = "yellow";
        ctx.fillRect(
            player.x - 20,
            player.y + 49,
            40 * (player.reloadProgress / player.reloadTime),
            5
        );
    }
}

// =============================
// MAIN LOOP
// =============================
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    updateReload();
    pickupCheck();

    moveEnemies();
    updateBullets();
    updateEnemyBullets();

    drawPlayer();
    drawEnemies();
    drawBullets();
    drawDrops();
    drawUI();

    requestAnimationFrame(loop);
}

// =============================
// START GAME
// =============================
spawnEnemy();
spawnEnemy();
spawnEnemy();
spawnEnemy();

loop();
