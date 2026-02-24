const CREATURE_TYPES = {
    GREEN: 'green',
    RED: 'red',
};

const AI_STATE = {
    WANDER: 'wander',
    SEEK_FOOD: 'seek_food',
    CHASE: 'chase',
    FLEE: 'flee',
};

class Creature {
    constructor(scene, x, y, tier, type) {
        this.scene = scene;
        this.tier = tier;
        this.type = type;
        this.alive = true;

        const cfg = SIZE_STAGES[this.tier];
        this.size = cfg.size;
        this.speed = cfg.speed + Phaser.Math.Between(-10, 6);
        this.maxHp = cfg.hp;
        this.hp = cfg.hp;
        this.baseDamage = cfg.baseDamage;
        this.attackRange = cfg.attackRange * 0.7;

        this.sprite = scene.physics.add.sprite(x, y, `creature_t${this.tier}`);
        this.applySpriteScale();
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.setData('entity', this);
        this.sprite.setData('isPlayer', false);
        this.sprite.setData('type', this.type);
        if (this.type === CREATURE_TYPES.RED) {
            this.sprite.setTint(0xe74c3c);
        }

        this.state = AI_STATE.WANDER;
        this.stateTimer = 0;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.detectionRange = this.size * 7 + 120;
        this.attackCooldown = 0;

        this.foodEaten = 0;
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(20);
    }

    update(time, delta, player, creatures, foods) {
        if (!this.alive || !this.sprite.active) return;

        this.stateTimer -= delta;
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);

        if (this.stateTimer <= 0) {
            this.evaluateState(player, creatures, foods);
        }

        switch (this.state) {
            case AI_STATE.SEEK_FOOD:
                this.doSeekFood(foods);
                break;
            case AI_STATE.CHASE:
                this.doChase();
                break;
            case AI_STATE.FLEE:
                this.doFlee();
                break;
            default:
                this.doWander(delta);
                break;
        }

        const vel = this.sprite.body.velocity;
        if (vel.x !== 0 || vel.y !== 0) {
            this.sprite.rotation = Math.atan2(vel.y, vel.x) - Math.PI / 2;
        }

        this.tryAttack(player, creatures);
        this.tryEatFood(foods);
        this.drawHpBar();
    }

    evaluateState(player, creatures, foods) {
        const threat = this.findNearestLargerThreat(player, creatures);
        if (threat && this.type === CREATURE_TYPES.GREEN) {
            this.state = AI_STATE.FLEE;
            this.fleeTarget = threat;
            this.stateTimer = 400;
            return;
        }

        if (this.type === CREATURE_TYPES.RED) {
            const target = this.findNearestChaseTarget(player, creatures);
            if (target) {
                this.state = AI_STATE.CHASE;
                this.chaseTarget = target;
                this.stateTimer = 300;
                return;
            }
        }

        if (this.type === CREATURE_TYPES.GREEN) {
            const food = this.findNearestFood(foods);
            if (food) {
                this.state = AI_STATE.SEEK_FOOD;
                this.foodTarget = food;
                this.stateTimer = 400;
                return;
            }
        }

        this.state = AI_STATE.WANDER;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.stateTimer = Phaser.Math.Between(800, 1800);
    }

    doWander(delta) {
        this.wanderAngle += (Math.random() - 0.5) * 0.08;
        const vx = Math.cos(this.wanderAngle) * this.speed * 0.45;
        const vy = Math.sin(this.wanderAngle) * this.speed * 0.45;
        this.sprite.body.setVelocity(vx, vy);

        const margin = 120;
        const bounds = this.scene.physics.world.bounds;
        if (this.sprite.x < bounds.x + margin) this.wanderAngle = 0;
        if (this.sprite.x > bounds.right - margin) this.wanderAngle = Math.PI;
        if (this.sprite.y < bounds.y + margin) this.wanderAngle = Math.PI / 2;
        if (this.sprite.y > bounds.bottom - margin) this.wanderAngle = -Math.PI / 2;
    }

    doSeekFood(foods) {
        const target = this.foodTarget && this.foodTarget.active ? this.foodTarget : this.findNearestFood(foods);
        if (!target) {
            this.state = AI_STATE.WANDER;
            return;
        }
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, target.sprite.x, target.sprite.y
        );
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed * 0.9,
            Math.sin(angle) * this.speed * 0.9
        );
    }

    doChase() {
        const target = this.isTargetAlive(this.chaseTarget) ? this.chaseTarget : null;
        if (!target) {
            this.state = AI_STATE.WANDER;
            return;
        }
        const targetSprite = target.sprite || target;
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, targetSprite.x, targetSprite.y
        );
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    doFlee() {
        const threat = this.isTargetAlive(this.fleeTarget) ? this.fleeTarget : null;
        if (!threat) {
            this.state = AI_STATE.WANDER;
            return;
        }
        const threatSprite = threat.sprite || threat;
        const angle = Phaser.Math.Angle.Between(
            threatSprite.x, threatSprite.y, this.sprite.x, this.sprite.y
        );
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.speed * 1.15,
            Math.sin(angle) * this.speed * 1.15
        );
    }

    tryAttack(player, creatures) {
        if (this.attackCooldown > 0) return;

        const targets = [];
        if (player && !player.isDead()) targets.push(player);

        for (const creature of creatures) {
            if (!creature.alive || creature === this) continue;
            targets.push(creature);
        }

        let bestTarget = null;
        let bestDist = Infinity;
        for (const target of targets) {
            const targetSprite = target.sprite || target;
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y, targetSprite.x, targetSprite.y
            );
            if (dist < this.attackRange + (target.size || 0) * 0.3 && dist < bestDist) {
                if (this.type === CREATURE_TYPES.RED) {
                    if (this.canChaseTarget(target)) {
                        bestTarget = target;
                        bestDist = dist;
                    }
                } else if (this.type === CREATURE_TYPES.GREEN) {
                    if ((target.tier || 0) <= this.tier) {
                        bestTarget = target;
                        bestDist = dist;
                    }
                }
            }
        }

        if (!bestTarget) return;

        const damage = calculateHitDamage(this.tier, bestTarget.tier || 1, this.baseDamage);
        if (bestTarget.takeDamage) {
            const killed = bestTarget.takeDamage(damage, this);
            if (this.type === CREATURE_TYPES.RED) {
                this.hp = Math.min(this.maxHp, this.hp + damage * 0.25);
                if (killed) this.onKill();
            }
        }
        this.attackCooldown = 600;
    }

    tryEatFood(foods) {
        if (this.type !== CREATURE_TYPES.GREEN) return;
        const target = this.foodTarget && this.foodTarget.active ? this.foodTarget : null;
        if (!target) return;
        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, target.sprite.x, target.sprite.y
        );
        if (dist < this.size + 8) {
            this.scene.consumeFood(target, this);
            this.foodTarget = null;
        }
    }

    findNearestFood(foods) {
        let closest = null;
        let closestDist = Infinity;
        for (const food of foods) {
            if (!food.active) continue;
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y, food.sprite.x, food.sprite.y
            );
            if (dist < closestDist && dist < this.detectionRange) {
                closest = food;
                closestDist = dist;
            }
        }
        return closest;
    }

    findNearestLargerThreat(player, creatures) {
        let closest = null;
        let closestDist = Infinity;

        const pool = [];
        if (player && !player.isDead()) pool.push(player);
        for (const creature of creatures) {
            if (!creature.alive || creature === this) continue;
            pool.push(creature);
        }

        for (const target of pool) {
            if ((target.tier || 0) <= this.tier) continue;
            const targetSprite = target.sprite || target;
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y, targetSprite.x, targetSprite.y
            );
            if (dist < this.detectionRange && dist < closestDist) {
                closest = target;
                closestDist = dist;
            }
        }
        return closest;
    }

    findNearestChaseTarget(player, creatures) {
        let closest = null;
        let closestDist = Infinity;

        const pool = [];
        if (player && !player.isDead()) pool.push(player);
        for (const creature of creatures) {
            if (!creature.alive || creature === this) continue;
            pool.push(creature);
        }

        for (const target of pool) {
            if (!this.canChaseTarget(target)) continue;
            const targetSprite = target.sprite || target;
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y, targetSprite.x, targetSprite.y
            );
            if (dist < closestDist && dist < this.detectionRange * 1.2) {
                closest = target;
                closestDist = dist;
            }
        }
        return closest;
    }

    canChaseTarget(target) {
        const targetTier = target.tier || 0;
        return targetTier <= this.tier;
    }

    isTargetAlive(target) {
        if (!target) return false;
        if (typeof target.isDead === 'function') return !target.isDead();
        if (typeof target.alive === 'boolean') return target.alive;
        return true;
    }

    onFoodEaten() {
        this.foodEaten += 1;
        if (this.foodEaten % 5 === 0) {
            this.tryTierUp();
        }
    }

    onKill() {
        if (this.type !== CREATURE_TYPES.RED) return;
        this.tryTierUp(true);
    }

    tryTierUp(force = false) {
        if (this.tier >= MAX_TIER) return;
        if (this.type === CREATURE_TYPES.GREEN && !force) {
            this.tier += 1;
        } else if (this.type === CREATURE_TYPES.RED && force) {
            this.tier += 1;
        } else {
            return;
        }

        const cfg = SIZE_STAGES[this.tier];
        this.size = cfg.size;
        this.speed = cfg.speed + Phaser.Math.Between(-8, 4);
        this.maxHp = cfg.hp;
        this.hp = Math.min(this.maxHp, this.hp + 1);
        this.baseDamage = cfg.baseDamage;
        this.attackRange = cfg.attackRange * 0.7;
        this.detectionRange = this.size * 7 + 120;
        this.sprite.setTexture(`creature_t${this.tier}`);
        this.applySpriteScale();
    }

    takeDamage(amount, attacker) {
        this.hp -= amount;
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite.active) {
                if (this.type === CREATURE_TYPES.RED) {
                    this.sprite.setTint(0xe74c3c);
                } else {
                    this.sprite.clearTint();
                }
            }
        });
        if (this.hp <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    applySpriteScale() {
        const baseSize = SIZE_STAGES[1].size;
        const scale = this.size / baseSize;
        this.sprite.setScale(scale);
        this.sprite.body.setCircle(this.sprite.displayWidth / 2);
    }

    drawHpBar() {
        const barWidth = Math.max(18, this.size * 1.3);
        const barHeight = 4;
        const x = this.sprite.x - barWidth / 2;
        const y = this.sprite.y - this.size - 10;
        const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
        const color = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf39c12 : 0xe74c3c;

        this.hpBar.clear();
        this.hpBar.fillStyle(0x111111, 0.7);
        this.hpBar.fillRect(x, y, barWidth, barHeight);
        this.hpBar.fillStyle(color, 0.9);
        this.hpBar.fillRect(x, y, barWidth * ratio, barHeight);
    }

    die() {
        this.alive = false;
        this.hpBar.destroy();
        if (this.scene && this.scene.onCreatureDeath) {
            this.scene.onCreatureDeath(this);
        }
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 220,
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }

    destroy() {
        this.alive = false;
        if (this.hpBar) this.hpBar.destroy();
        if (this.sprite && this.sprite.active) this.sprite.destroy();
    }
}
