import { Scene, GameObjects } from 'phaser';

export class Shop extends Scene {
    constructor() {
        super('Shop');
    }

    create() {
        this.add.text(512, 100, 'Shop', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
        }).setOrigin(0.5);

        const weaponsButton = this.add.text(512, 300, 'Weapons', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            console.log('Weapons shop not implemented yet');
        });

        const animalsButton = this.add.text(512, 400, 'Animals', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            const npub = localStorage.getItem('nostr_npub');
            if (npub) {
                this.scene.start('Animals');
            } else {
                console.log('User not logged in');
                // You can add a visual feedback here, like a popup message
                this.add.text(512, 500, 'Please log in to access the Animals shop', {
                    fontFamily: 'Arial',
                    fontSize: 24,
                    color: '#ff0000'
                }).setOrigin(0.5);
            }
        });

        const backButton = this.add.text(100, 50, 'Back', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}