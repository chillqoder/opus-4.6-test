class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.barWidth = 180;
        this.barHeight = 16;
        this.padding = 16;

        // HP Bar
        this.hpBarBg = this.add.graphics();
        this.hpBarFill = this.add.graphics();
        this.hpLabel = this.add.text(this.padding, this.padding - 2, 'HP', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
        });

        // Growth Bar
        this.growthBarBg = this.add.graphics();
        this.growthBarFill = this.add.graphics();
        this.growthLabel = this.add.text(this.padding, this.padding + this.barHeight + 8, 'GROWTH', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
        });

        // Tier display
        this.tierText = this.add.text(this.padding, this.padding + (this.barHeight + 8) * 2 + 4, 'TIER 1', {
            fontSize: '16px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#6ab04c',
        });

        // Score
        this.scoreText = this.add.text(this.padding, this.padding + (this.barHeight + 8) * 2 + 28, 'Eaten: 0', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#78e08f',
        });

        // Size indicator
        this.sizeText = this.add.text(this.padding, this.padding + (this.barHeight + 8) * 2 + 48, '', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#888888',
        });

        // Lives
        this.livesText = this.add.text(this.padding, this.padding + (this.barHeight + 8) * 2 + 66, '', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#cccccc',
        });

        // Overlay containers for game over / win
        this.overlayBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0
        );
        this.overlayBg.setDepth(100);

        this.overlayText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 60,
            '', {
                fontSize: '32px',
                fontFamily: 'monospace',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center',
            }
        ).setOrigin(0.5).setDepth(101).setAlpha(0);

        this.overlaySubtext = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 10,
            '', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#cccccc',
                align: 'center',
            }
        ).setOrigin(0.5).setDepth(101).setAlpha(0);

        this.restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 70,
            '', {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#6ab04c',
            }
        ).setOrigin(0.5).setDepth(101).setAlpha(0);

        // Controls hint (bottom)
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 20,
            'Mouse to move  |  Click to strike  |  WASD also works',
            {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#555555',
            }
        ).setOrigin(0.5);
    }

    updateUI(player, lives) {
        if (!player) return;

        const barX = this.padding + 60;
        const hpY = this.padding;
        const growthY = this.padding + this.barHeight + 8;

        // HP bar
        this.hpBarBg.clear();
        this.hpBarBg.fillStyle(0x333333, 1);
        this.hpBarBg.fillRect(barX, hpY, this.barWidth, this.barHeight);

        const hpRatio = player.hp / player.maxHp;
        const hpColor = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf39c12 : 0xe74c3c;
        this.hpBarFill.clear();
        this.hpBarFill.fillStyle(hpColor, 1);
        this.hpBarFill.fillRect(barX, hpY, this.barWidth * hpRatio, this.barHeight);
        // Border
        this.hpBarBg.lineStyle(1, 0x555555, 1);
        this.hpBarBg.strokeRect(barX, hpY, this.barWidth, this.barHeight);

        // Growth bar
        this.growthBarBg.clear();
        this.growthBarBg.fillStyle(0x333333, 1);
        this.growthBarBg.fillRect(barX, growthY, this.barWidth, this.barHeight);

        const growthRatio = player.tier >= MAX_TIER ? 1 : player.growth / player.growthNeeded;
        this.growthBarFill.clear();
        this.growthBarFill.fillStyle(0x3498db, 1);
        this.growthBarFill.fillRect(barX, growthY, this.barWidth * growthRatio, this.barHeight);
        this.growthBarBg.lineStyle(1, 0x555555, 1);
        this.growthBarBg.strokeRect(barX, growthY, this.barWidth, this.barHeight);

        // Tier
        const tierColors = ['#6ab04c', '#78e08f', '#fdcb6e', '#e17055', '#c0392b'];
        this.tierText.setText(`TIER ${player.tier}`);
        this.tierText.setColor(tierColors[player.tier - 1] || '#ffffff');

        // Score
        this.scoreText.setText(`Eaten: ${player.creaturesEaten}`);

        // Size
        this.sizeText.setText(`Size: ${player.size}`);

        // Lives
        if (typeof lives === 'number') {
            this.livesText.setText(`Lives: ${lives}`);
        }
    }

    showGameOverScreen(player) {
        const timeStr = (player.timeSurvived / 1000).toFixed(1);

        this.overlayBg.setAlpha(0);
        this.tweens.add({
            targets: this.overlayBg,
            fillAlpha: 0.7,
            duration: 500,
        });
        // Manually animate alpha since fillAlpha doesn't work on rectangles
        this.overlayBg.setAlpha(0.7);

        this.overlayText.setText('GAME OVER');
        this.overlayText.setColor('#e74c3c');
        this.overlayText.setAlpha(1);

        this.overlaySubtext.setText(
            `Creatures eaten: ${player.creaturesEaten}\n` +
            `Time survived: ${timeStr}s\n` +
            `Max tier reached: ${player.maxTierReached}`
        );
        this.overlaySubtext.setAlpha(1);

        this.restartText.setText('Click anywhere to restart');
        this.restartText.setAlpha(1);

        this.input.once('pointerdown', () => {
            this.scene.get('GameScene').restartGame();
        });
    }

    showLifeLostScreen(livesLeft) {
        this.overlayBg.setAlpha(0.7);

        this.overlayText.setText('LIFE LOST');
        this.overlayText.setColor('#f39c12');
        this.overlayText.setAlpha(1);

        this.overlaySubtext.setText(
            `Lives remaining: ${livesLeft}\n` +
            'Click to restart this life'
        );
        this.overlaySubtext.setAlpha(1);

        this.restartText.setText('Click anywhere to continue');
        this.restartText.setAlpha(1);

        this.input.once('pointerdown', () => {
            this.scene.get('GameScene').restartAfterLifeLost();
        });
    }

    showWinScreen(player) {
        const timeStr = (player.timeSurvived / 1000).toFixed(1);

        this.overlayBg.setAlpha(0.7);

        this.overlayText.setText('YOU ARE THE APEX!');
        this.overlayText.setColor('#f1c40f');
        this.overlayText.setAlpha(1);

        this.overlaySubtext.setText(
            `Congratulations! You reached Tier ${player.tier}!\n` +
            `Creatures eaten: ${player.creaturesEaten}\n` +
            `Time: ${timeStr}s`
        );
        this.overlaySubtext.setAlpha(1);

        this.restartText.setText('Click anywhere to play again');
        this.restartText.setAlpha(1);

        this.input.once('pointerdown', () => {
            this.scene.get('GameScene').restartGame();
        });
    }
}
