class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.tier = 1;
        this.size = SIZE_STAGES[1].size;
        this.maxHp = SIZE_STAGES[1].hp;
        this.hp = this.maxHp;
        this.growth = 0;
        this.growthNeeded = SIZE_STAGES[1].growthNeeded;
        this.speed = SIZE_STAGES[1].speed;
        this.attackRange = SIZE_STAGES[1].attackRange;
        this.baseDamage = SIZE_STAGES[1].baseDamage;
        this.creaturesEaten = 0;
        this.timeSurvived = 0;
        this.maxTierReached = 1;
        this.hpRegenTimer = 0;
        this.invincibleTimer = 0;
        this.attackCooldown = 0;

        this.sprite = scene.physics.add.sprite(x, y, `player_t${this.tier}`);
        this.applySpriteScale();
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        this.sprite.setData('entity', this);
        this.sprite.setData('isPlayer', true);

        this.targetX = x;
        this.targetY = y;
        this.useMouseControl = true;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    tierUp() {
        if (this.tier >= MAX_TIER) return false;
        this.tier++;
        this.maxTierReached = Math.max(this.maxTierReached, this.tier);
        const cfg = SIZE_STAGES[this.tier];
        this.size = cfg.size;
        this.maxHp = cfg.hp;
        this.hp = this.maxHp;
        this.speed = cfg.speed;
        this.attackRange = cfg.attackRange;
        this.baseDamage = cfg.baseDamage;
        this.growthNeeded = cfg.growthNeeded;
        this.growth = 0;

        this.sprite.setTexture(`player_t${this.tier}`);
        this.applySpriteScale();

        // Flash effect on tier up
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.sprite.scaleX * 1.2,
            scaleY: this.sprite.scaleY * 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2',
        });

        return this.tier >= MAX_TIER;
    }

    addGrowth(amount) {
        this.growth += amount;
        if (this.growth >= this.growthNeeded) {
            return this.tierUp();
        }
        return false;
    }

    getAttackDamage(targetTier) {
        return calculateHitDamage(this.tier, targetTier, this.baseDamage);
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp = Math.max(0, this.hp - amount);
        this.invincibleTimer = 500;
        // Flash red
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.sprite.active) this.sprite.clearTint();
        });
    }

    isDead() {
        return this.hp <= 0;
    }

    update(time, delta) {
        this.timeSurvived += delta;

        // HP regen
        this.hpRegenTimer += delta;
        if (this.hpRegenTimer >= 2000 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + 1);
            this.hpRegenTimer = 0;
        }

        // Invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= delta;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }

        // Movement towards target
        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const vx = (dx / dist) * this.speed;
            const vy = (dy / dist) * this.speed;
            this.sprite.body.setVelocity(vx, vy);
            // Rotate to face direction
            this.sprite.rotation = Math.atan2(dy, dx) - Math.PI / 2;
        } else {
            this.sprite.body.setVelocity(0, 0);
        }
    }

    onKill() {
        this.creaturesEaten++;
        const won = this.addGrowth(1);
        this.hp = Math.min(this.maxHp, this.hp + 1);
        return won;
    }

    onFoodEaten() {
        this.hp = Math.min(this.maxHp, this.hp + 2);
    }

    applySpriteScale() {
        const baseSize = SIZE_STAGES[1].size;
        const scale = this.size / baseSize;
        this.sprite.setScale(scale);
        this.sprite.body.setCircle(this.sprite.displayWidth / 2);
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

const MAX_TIER = 5;

const SIZE_STAGES = {
    1: { size: 14, hp: 4, speed: 220, attackRange: 34, growthNeeded: 5, baseDamage: 1 },
    2: { size: 22, hp: 6, speed: 200, attackRange: 42, growthNeeded: 5, baseDamage: 1.5 },
    3: { size: 32, hp: 8, speed: 180, attackRange: 54, growthNeeded: 5, baseDamage: 2 },
    4: { size: 46, hp: 10, speed: 165, attackRange: 68, growthNeeded: 5, baseDamage: 2.5 },
    5: { size: 62, hp: 12, speed: 150, attackRange: 84, growthNeeded: Infinity, baseDamage: 3 },
};

function calculateHitDamage(attackerTier, targetTier, baseDamage) {
    const diff = attackerTier - targetTier;
    let multiplier = 1;
    if (diff >= 2) {
        multiplier = 4;
    } else if (diff === 1) {
        multiplier = 2;
    } else if (diff === -1) {
        multiplier = 0.75;
    } else if (diff <= -2) {
        multiplier = 0.5;
    }
    return Math.max(0.5, baseDamage * multiplier);
}
