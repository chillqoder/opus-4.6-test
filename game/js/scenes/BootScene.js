class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // Generate all creature and player textures
        const allKeys = Object.keys(CREATURE_MAPS);
        for (const key of allKeys) {
            const data = CREATURE_MAPS[key];
            generateCreatureTexture(this, key, data.map, data.pixelSize, PALETTE);
        }

        // Generate food particle texture
        generateCreatureTexture(this, 'food', FOOD_MAP.map, FOOD_MAP.pixelSize, PALETTE);

        // Generate bubble particle texture
        const bubbleGfx = this.add.graphics();
        bubbleGfx.fillStyle(0xffffff, 0.15);
        bubbleGfx.fillCircle(3, 3, 3);
        bubbleGfx.generateTexture('bubble', 6, 6);
        bubbleGfx.destroy();

        // Generate background organic particles
        const dotGfx = this.add.graphics();
        dotGfx.fillStyle(0x3d7a33, 0.3);
        dotGfx.fillCircle(2, 2, 2);
        dotGfx.generateTexture('organic_dot', 4, 4);
        dotGfx.destroy();

        const speckGfx = this.add.graphics();
        speckGfx.fillStyle(0xc2e9ff, 0.4);
        speckGfx.fillCircle(1, 1, 1);
        speckGfx.generateTexture('speck', 2, 2);
        speckGfx.destroy();

        const moteGfx = this.add.graphics();
        moteGfx.fillStyle(0xa5ffce, 0.35);
        moteGfx.fillCircle(1.5, 1.5, 1.5);
        moteGfx.generateTexture('mote', 3, 3);
        moteGfx.destroy();

        const glowGfx = this.add.graphics();
        glowGfx.fillStyle(0x7fd9ff, 0.2);
        glowGfx.fillCircle(4, 4, 4);
        glowGfx.generateTexture('glow_orb', 8, 8);
        glowGfx.destroy();

        const streakGfx = this.add.graphics();
        streakGfx.fillStyle(0x5aa1c5, 0.25);
        streakGfx.fillRect(0, 1, 14, 2);
        streakGfx.generateTexture('current_streak', 14, 4);
        streakGfx.destroy();

        this.scene.start('StartScene');
    }
}
