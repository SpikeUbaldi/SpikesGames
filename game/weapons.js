class Weapon {
    constructor(data) {
        this.name = data.name;
        this.damage = data.damage;
        this.cooldown = data.cooldown;
        this.ammo = data.mag;
        this.mag = data.mag;
        this.reloadTime = data.reload;
        this.bulletSpeed = data.bulletSpeed;
        this.automatic = data.automatic;
        this.spread = data.spread || 0;
        this.shotCount = data.shotCount || 1;   // shotgun support
        this.bulletLife = data.bulletLife || 40;
        this.type = data.type; // "gun", "flame", "item"

        this.onCooldown = 0;
        this.reloadProgress = 0;
        this.reloading = false;
    }

    updateReload() {
        if (!this.reloading) return;
        this.reloadProgress += 1;
        if (this.reloadProgress >= this.reloadTime) {
            this.reloading = false;
            this.reloadProgress = 0;
            this.ammo = this.mag;
        }
    }

    startReload() {
        if (this.reloading) return;
        this.reloading = true;
        this.reloadProgress = 0;
    }

    shoot(player) {
        if (this.type === "item") {
            this.useItem(player);
            return;
        }

        if (this.reloading) return;

        // Not enough ammo → reload
        if (this.ammo <= 0) {
            this.startReload();
            return;
        }

        // Still cooling down
        if (this.onCooldown > 0) return;

        this.ammo -= 1;
        this.onCooldown = this.cooldown;

        // FIRE BULLETS
        for (let i = 0; i < this.shotCount; i++) {
            const angle = Math.atan2(mouse.y - canvas.height / 2, mouse.x - canvas.width / 2);

            const spreadAngle = angle + (Math.random() * this.spread - this.spread / 2);

            player.bullets.push(new Bullet(
                player.x,
                player.y,
                spreadAngle,
                this.bulletSpeed,
                this.damage,
                this.bulletLife
            ));
        }
    }

    update() {
        if (this.onCooldown > 0) this.onCooldown--;
    }

    useItem(player) {
        if (this.name === "Medkit") {
            player.health = Math.min(player.maxHealth, player.health + 50);
        }
        else if (this.name === "Stamina Boost") {
            player.stamina = Math.min(player.maxStamina, player.stamina + 60);
        }

        // item disappears on use
        player.inventory[player.activeSlot] = null;
    }
}

class Bullet {
    constructor(x, y, angle, speed, dmg, life) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = dmg;
        this.life = life;
        this.radius = 4;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life--;
    }
}

// ===== WEAPON DEFINITIONS =====
const WeaponList = {

    pistol: {
        name: "Pistol",
        damage: 15,
        cooldown: 18,
        mag: 10,
        reload: 80,
        bulletSpeed: 8,
        automatic: false,
        spread: 0.08,
        type: "gun"
    },

    ak: {
        name: "AK-47",
        damage: 12,
        cooldown: 6,
        mag: 25,
        reload: 90,
        bulletSpeed: 7,
        automatic: true,
        spread: 0.15,
        type: "gun"
    },

    shotgun: {
        name: "Shotgun",
        damage: 8,
        cooldown: 32,
        mag: 6,
        reload: 110,
        bulletSpeed: 6,
        automatic: false,
        spread: 0.5,
        shotCount: 6,
        type: "gun"
    },

    flamethrower: {
        name: "Flamethrower",
        damage: 3,
        cooldown: 2,
        mag: 150,
        reload: 130,
        bulletSpeed: 3,
        automatic: true,
        spread: 0.6,
        shotCount: 1,
        bulletLife: 18,
        type: "gun"
    },

    medkit: {
        name: "Medkit",
        type: "item"
    },

    stamina: {
        name: "Stamina Boost",
        type: "item"
    }
};
