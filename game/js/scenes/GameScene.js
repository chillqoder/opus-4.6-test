class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.startingLives = (data && data.lives) ? data.lives : 3;
    }

    create() {
        this.WORLD_WIDTH = 4000;
        this.WORLD_HEIGHT = 4000;
        this.MAX_CREATURES = 70;
        this.FOOD_COUNT = 140;
        this.FOOD_RESPAWN_MS = 6000;
        this.gameOver = false;
        this.gameWon = false;
        this.lifeLost = false;
        this.lives = this.startingLives;

        // World bounds
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Background
        this.createBackground();

        // Player
        this.player = new Player(this, this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2);

        // Camera
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor('#0a1628');

        // Creatures
        this.creatures = [];
        this.spawnInitialCreatures();

        // Food
        this.foods = [];
        this.spawnInitialFood();

        // Respawn handled on death

        // Input: mouse
        this.input.on('pointermove', (pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.player.setTarget(worldPoint.x, worldPoint.y);
        });

        // Input: click to attack
        this.input.on('pointerdown', (pointer) => {
            if (this.gameOver || this.gameWon || this.lifeLost) return;
            this.handleAttack(pointer);
        });

        // Input: WASD/arrows as alternative
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Floating particles
        this.createParticles();

        // Launch UI scene
        this.scene.launch('UIScene');
    }

    createBackground() {
        // Dark gradient water background tiles
        const bgGfx = this.add.graphics();
        const tileSize = 200;
        for (let x = 0; x < this.WORLD_WIDTH; x += tileSize) {
            for (let y = 0; y < this.WORLD_HEIGHT; y += tileSize) {
                const shade = 0.02 + 0.02 * Math.sin(x * 0.001) * Math.cos(y * 0.001);
                bgGfx.fillStyle(0x0a1628, 1);
                bgGfx.fillRect(x, y, tileSize, tileSize);
                // Subtle variation
                bgGfx.fillStyle(0x122a4a, shade);
                bgGfx.fillRect(x, y, tileSize, tileSize);
            }
        }
        bgGfx.setDepth(-10);

        // Grid of subtle dots for depth
        const dotGfx = this.add.graphics();
        dotGfx.setDepth(-9);
        for (let i = 0; i < 300; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const alpha = Phaser.Math.FloatBetween(0.03, 0.08);
            const radius = Phaser.Math.FloatBetween(1, 3);
            dotGfx.fillStyle(0x2d6a4f, alpha);
            dotGfx.fillCircle(x, y, radius);
        }
    }

    createParticles() {
        // Floating bubbles using simple sprite-based approach
        this.bubbles = this.add.group();
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const bubble = this.add.sprite(x, y, 'bubble');
            bubble.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            bubble.setScale(Phaser.Math.FloatBetween(0.5, 2));
            bubble.setDepth(-5);
            bubble.speedY = Phaser.Math.FloatBetween(-5, -15);
            bubble.drift = Phaser.Math.FloatBetween(-3, 3);
            this.bubbles.add(bubble);
        }

        // Micro specks
        this.specks = this.add.group();
        for (let i = 0; i < 140; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const speck = this.add.sprite(x, y, 'speck');
            speck.setAlpha(Phaser.Math.FloatBetween(0.08, 0.2));
            speck.setScale(Phaser.Math.FloatBetween(0.8, 1.8));
            speck.setDepth(-8);
            speck.speedY = Phaser.Math.FloatBetween(-2, -6);
            speck.drift = Phaser.Math.FloatBetween(-1.5, 1.5);
            this.specks.add(speck);
        }

        // Soft glows
        this.glows = this.add.group();
        for (let i = 0; i < 24; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const glow = this.add.sprite(x, y, 'glow_orb');
            glow.setAlpha(Phaser.Math.FloatBetween(0.05, 0.15));
            glow.setScale(Phaser.Math.FloatBetween(2, 5));
            glow.setDepth(-9);
            glow.speedY = Phaser.Math.FloatBetween(-1, -3);
            glow.drift = Phaser.Math.FloatBetween(-0.8, 0.8);
            this.glows.add(glow);
        }

        // Current streaks
        this.currents = this.add.group();
        for (let i = 0; i < 32; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const streak = this.add.sprite(x, y, 'current_streak');
            streak.setAlpha(Phaser.Math.FloatBetween(0.04, 0.12));
            streak.setScale(Phaser.Math.FloatBetween(1.2, 2.4));
            streak.setDepth(-7);
            streak.speedX = Phaser.Math.FloatBetween(-4, -10);
            streak.drift = Phaser.Math.FloatBetween(-0.5, 0.5);
            streak.rotation = Phaser.Math.FloatBetween(-0.4, 0.4);
            this.currents.add(streak);
        }

        // Plankton motes
        this.motes = this.add.group();
        for (let i = 0; i < 90; i++) {
            const x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            const mote = this.add.sprite(x, y, 'mote');
            mote.setAlpha(Phaser.Math.FloatBetween(0.08, 0.22));
            mote.setScale(Phaser.Math.FloatBetween(0.8, 1.6));
            mote.setDepth(-6);
            mote.speedY = Phaser.Math.FloatBetween(-3, -7);
            mote.drift = Phaser.Math.FloatBetween(-2, 2);
            this.motes.add(mote);
        }
    }

    spawnInitialCreatures() {
        const spawnPlan = {
            1: { green: 20, red: 6 },
            2: { green: 14, red: 4 },
            3: { green: 10, red: 3 },
            4: { green: 6, red: 2 },
            5: { green: 2, red: 1 },
        };

        for (const [tier, counts] of Object.entries(spawnPlan)) {
            for (let i = 0; i < counts.green; i++) {
                this.spawnCreature(parseInt(tier), CREATURE_TYPES.GREEN);
            }
            for (let i = 0; i < counts.red; i++) {
                this.spawnCreature(parseInt(tier), CREATURE_TYPES.RED);
            }
        }
    }

    spawnCreature(tier, type, nearEdge = false) {
        if (this.creatures.length >= this.MAX_CREATURES) return;

        let x, y;
        if (nearEdge) {
            // Spawn at world edges
            const edge = Phaser.Math.Between(0, 3);
            switch (edge) {
                case 0: x = Phaser.Math.Between(50, this.WORLD_WIDTH - 50); y = 50; break;
                case 1: x = Phaser.Math.Between(50, this.WORLD_WIDTH - 50); y = this.WORLD_HEIGHT - 50; break;
                case 2: x = 50; y = Phaser.Math.Between(50, this.WORLD_HEIGHT - 50); break;
                case 3: x = this.WORLD_WIDTH - 50; y = Phaser.Math.Between(50, this.WORLD_HEIGHT - 50); break;
            }
        } else {
            // Random position, but not too close to player start
            do {
                x = Phaser.Math.Between(100, this.WORLD_WIDTH - 100);
                y = Phaser.Math.Between(100, this.WORLD_HEIGHT - 100);
            } while (
                Phaser.Math.Distance.Between(x, y, this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2) < 200
            );
        }

        const creature = new Creature(this, x, y, tier, type);
        this.creatures.push(creature);
    }

    onCreatureDeath(creature) {
        if (this.gameOver || this.gameWon) return;

        this.creatures = this.creatures.filter(c => c !== creature);

        const spawnTier = 1;
        this.spawnCreature(spawnTier, creature.type, false);
    }

    spawnInitialFood() {
        for (let i = 0; i < this.FOOD_COUNT; i++) {
            const food = this.spawnFood();
            this.foods.push(food);
        }
    }

    spawnFood(x = null, y = null) {
        const fx = x !== null ? x : Phaser.Math.Between(80, this.WORLD_WIDTH - 80);
        const fy = y !== null ? y : Phaser.Math.Between(80, this.WORLD_HEIGHT - 80);
        const sprite = this.add.sprite(fx, fy, 'food');
        sprite.setDepth(2);
        const food = { sprite, active: true, respawnAt: 0 };
        return food;
    }

    updateFoodRespawns(time) {
        for (const food of this.foods) {
            if (!food.active && time >= food.respawnAt) {
                food.active = true;
                food.sprite.setVisible(true);
                food.sprite.x = Phaser.Math.Between(80, this.WORLD_WIDTH - 80);
                food.sprite.y = Phaser.Math.Between(80, this.WORLD_HEIGHT - 80);
            }
        }
    }

    consumeFood(food, consumer) {
        if (!food.active) return;
        food.active = false;
        food.sprite.setVisible(false);
        food.respawnAt = this.time.now + this.FOOD_RESPAWN_MS;

        if (consumer && consumer.onFoodEaten) {
            consumer.onFoodEaten();
        }
    }

    handlePlayerContactAttacks() {
        if (this.player.attackCooldown > 0) return;

        for (const creature of this.creatures) {
            if (!creature.alive) continue;
            const dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                creature.sprite.x, creature.sprite.y
            );
            const contactDist = (this.player.size + creature.size) * 0.55;
            if (dist <= contactDist) {
                const damage = this.player.getAttackDamage(creature.tier);
                const killed = creature.takeDamage(damage, this.player);
                if (killed) {
                    const won = this.player.onKill();
                    if (won) this.triggerWin();
                }
                this.player.attackCooldown = 350;
                break;
            }
        }
    }

    handlePlayerFood() {
        for (const food of this.foods) {
            if (!food.active) continue;
            const dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                food.sprite.x, food.sprite.y
            );
            if (dist <= this.player.size + 8) {
                this.consumeFood(food, this.player);
                break;
            }
        }
    }

    handleAttack(pointer) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

        // Find closest creature within attack range
        let closestCreature = null;
        let closestDist = Infinity;

        for (const creature of this.creatures) {
            if (!creature.alive) continue;
            const dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                creature.sprite.x, creature.sprite.y
            );
            if (dist < this.player.attackRange + creature.size && dist < closestDist) {
                // Check if player clicked near this creature
                const clickDist = Phaser.Math.Distance.Between(
                    worldPoint.x, worldPoint.y,
                    creature.sprite.x, creature.sprite.y
                );
                if (clickDist < creature.size + 20) {
                    closestCreature = creature;
                    closestDist = dist;
                }
            }
        }

        if (!closestCreature) return;

        const damage = this.player.getAttackDamage(closestCreature.tier);
        const killed = closestCreature.takeDamage(damage, this.player);
        if (killed) {
            const won = this.player.onKill();
            if (won) this.triggerWin();
        }
    }

    triggerWin() {
        this.gameWon = true;
        this.scene.get('UIScene').showWinScreen(this.player);
    }

    triggerGameOver() {
        this.gameOver = true;
        this.scene.get('UIScene').showGameOverScreen(this.player);
    }

    restartAfterLifeLost() {
        this.scene.stop('UIScene');
        this.scene.restart({ lives: this.lives });
    }

    restartGame() {
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { lives: 3 });
    }

    update(time, delta) {
        if (this.gameOver || this.gameWon || this.lifeLost) return;

        // WASD override
        let kbX = 0, kbY = 0;
        if (this.cursors.left.isDown || this.wasd.left.isDown) kbX = -1;
        if (this.cursors.right.isDown || this.wasd.right.isDown) kbX = 1;
        if (this.cursors.up.isDown || this.wasd.up.isDown) kbY = -1;
        if (this.cursors.down.isDown || this.wasd.down.isDown) kbY = 1;

        if (kbX !== 0 || kbY !== 0) {
            const len = Math.sqrt(kbX * kbX + kbY * kbY);
            this.player.sprite.body.setVelocity(
                (kbX / len) * this.player.speed,
                (kbY / len) * this.player.speed
            );
            this.player.sprite.rotation = Math.atan2(kbY, kbX) - Math.PI / 2;
        } else {
            this.player.update(time, delta);
        }

        // Update creatures
        for (const creature of this.creatures) {
            creature.update(time, delta, this.player, this.creatures, this.foods);
        }

        // Update food respawns
        this.updateFoodRespawns(time);

        // Player contact attack + food
        this.handlePlayerContactAttacks();
        this.handlePlayerFood();

        // Death check
        if (this.player.isDead()) {
            this.lives -= 1;
            if (this.lives > 0) {
                this.lifeLost = true;
                this.scene.get('UIScene').showLifeLostScreen(this.lives);
                return;
            }
            this.triggerGameOver();
            return;
        }

        // Update bubbles
        this.bubbles.getChildren().forEach(bubble => {
            bubble.y += bubble.speedY * (delta / 1000);
            bubble.x += bubble.drift * (delta / 1000);
            if (bubble.y < -10) {
                bubble.y = this.WORLD_HEIGHT + 10;
                bubble.x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            }
        });

        // Update specks
        this.specks.getChildren().forEach(speck => {
            speck.y += speck.speedY * (delta / 1000);
            speck.x += speck.drift * (delta / 1000);
            if (speck.y < -10) {
                speck.y = this.WORLD_HEIGHT + 10;
                speck.x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            }
        });

        // Update glows
        this.glows.getChildren().forEach(glow => {
            glow.y += glow.speedY * (delta / 1000);
            glow.x += glow.drift * (delta / 1000);
            if (glow.y < -20) {
                glow.y = this.WORLD_HEIGHT + 20;
                glow.x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            }
        });

        // Update currents
        this.currents.getChildren().forEach(streak => {
            streak.x += streak.speedX * (delta / 1000);
            streak.y += streak.drift * (delta / 1000);
            if (streak.x < -40) {
                streak.x = this.WORLD_WIDTH + 40;
                streak.y = Phaser.Math.Between(0, this.WORLD_HEIGHT);
            }
        });

        // Update motes
        this.motes.getChildren().forEach(mote => {
            mote.y += mote.speedY * (delta / 1000);
            mote.x += mote.drift * (delta / 1000);
            if (mote.y < -10) {
                mote.y = this.WORLD_HEIGHT + 10;
                mote.x = Phaser.Math.Between(0, this.WORLD_WIDTH);
            }
        });

        // Update UI
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateUI) {
            uiScene.updateUI(this.player, this.lives);
        }
    }
}
