class Player {
    constructor() {
        this.x = 1000;
        this.y = 1000;
        this.radius = 22;
        this.speed = 2.4;
        this.velX = 0;
        this.velY = 0;
        this.friction = 0.82;
        this.accel = 0.4;

        this.health = 100;
        this.maxHealth = 100;

        this.stamina = 100;
        this.maxStamina = 100;
        this.sprintCost = 20; 
        this.sprintBoost = 2;  

        this.inventory = [null, null, null];
        this.activeSlot = 0;

        this.reloadProgress = 0;
        this.reloadRequired = 0;

        this.bullets = [];
    }

    giveWeapon(weaponData) {
        this.inventory[this.activeSlot] = new Weapon(weaponData);
    }

    switchSlot(n) {
        this.activeSlot = n;
    }

    updateMovement() {
        let mx = 0, my = 0;
        if (keys.w) my -= 1;
        if (keys.s) my += 1;
        if (keys.a) mx -= 1;
        if (keys.d) mx += 1;

        if (mx || my) {
            const len = Math.hypot(mx, my);
            mx /= len;
            my /= len;

            this.velX += mx * this.accel;
            this.velY += my * this.accel;

            // stamina ONLY drains when sprinting
            if (keys.shift && this.stamina > 0) {
                this.velX *= this.sprintBoost;
                this.velY *= this.sprintBoost;
                this.stamina -= 0.5;
            }
        } else {
            // regen ONLY while walking or idle
            this.stamina += 0.3;
        }

        this.stamina = Math.max(0, Math.min(this.maxStamina, this.stamina));

        this.velX *= this.friction;
        this.velY *= this.friction;

        this.x += this.velX;
        this.y += this.velY;
    }

    updateWeapon() {
        const gun = this.inventory[this.activeSlot];
        if (!gun) return;

        gun.updateReload();

        if (mouse.clicked) gun.shoot(this);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update();

            if (b.life <= 0) this.bullets.splice(i, 1);
        }
    }
}

const player = new Player();
