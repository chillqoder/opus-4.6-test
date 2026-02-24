class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillStyle(0x071224, 1);
        bg.fillRect(0, 0, width, height);
        bg.fillStyle(0x0f2b4b, 0.7);
        bg.fillRect(0, height * 0.45, width, height * 0.55);

        const title = this.add.text(width / 2, height / 2 - 120, 'CELL STAGE SURVIVAL', {
            fontSize: '36px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#e8f0ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 78, 'Grow, hunt, and become the apex', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#94a9c9',
        }).setOrigin(0.5);

        const button = this.add.rectangle(width / 2, height / 2 + 20, 220, 56, 0x1f6f50, 1);
        button.setStrokeStyle(2, 0x9af0d3, 0.6);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(width / 2, height / 2 + 20, 'START', {
            fontSize: '18px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#e8fff5',
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0x2d865f, 1);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x1f6f50, 1);
        });

        button.on('pointerdown', () => {
            this.scene.start('GameScene', { lives: 3 });
        });

        this.add.text(width / 2, height - 40, 'Mouse to move  |  Click to strike  |  WASD also works', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#5a6f8a',
        }).setOrigin(0.5);
    }
}
