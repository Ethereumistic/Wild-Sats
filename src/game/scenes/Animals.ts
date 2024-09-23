import { Scene, GameObjects } from 'phaser';
import axios from 'axios';

interface Animal {
    name: string;
    price: number;
    description: string;
    image: string;
    health: number;
    speed: number;
    jump: number;
    ability: string;
    abilityUses: number | 'infinite';
    cost: number;
}

export class Animals extends Scene {
    animals: Animal[] = [
        { name: 'Cat', price: 100, description: 'A cute and cuddly companion', image: 'cat_image', health: 80, speed: 7, jump: 5, ability: 'Night Vision', abilityUses: 'infinite', cost: 100 },
        { name: 'Dog', price: 150, description: 'A loyal and playful friend', image: 'dog_image', health: 100, speed: 8, jump: 4, ability: 'Bark', abilityUses: 5, cost: 150 },
        { name: 'Rabbit', price: 120, description: 'A quick and agile hopper', image: 'rabbit_image', health: 60, speed: 10, jump: 8, ability: 'Burrow', abilityUses: 3, cost: 120 },
    ];
    npub: string | null;
    ownedAnimals: string[] = [];
    currentAnimalIndex: number = 0;
    animalImage: GameObjects.Image;
    animalNameText: GameObjects.Text;
    animalInfoText: GameObjects.Text;
    actionButton: GameObjects.Text;

    constructor() {
        super('Animals');
    }

    init() {
        this.npub = localStorage.getItem('nostr_npub');
        if (!this.npub) {
            console.error('User not logged in');
            this.scene.start('Shop');
        }
    }

    async create() {
        await this.fetchOwnedAnimals();
        this.createUI();
        this.updateAnimalInfo();
    }

    createUI() {
        this.add.text(512, 50, 'Animal Shop', { fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff' }).setOrigin(0.5);
        this.animalImage = this.add.image(512, 250, this.animals[this.currentAnimalIndex].image).setScale(0.5);
        this.animalNameText = this.add.text(512, 350, '', { fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff' }).setOrigin(0.5);
        this.animalInfoText = this.add.text(512, 450, '', { fontFamily: 'Arial', fontSize: 16, color: '#ffffff', align: 'center' }).setOrigin(0.5);
        
        const leftArrow = this.add.text(412, 250, '<', { fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setInteractive();
        const rightArrow = this.add.text(612, 250, '>', { fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setInteractive();
        
        leftArrow.on('pointerdown', () => this.changeAnimal(-1));
        rightArrow.on('pointerdown', () => this.changeAnimal(1));

        this.actionButton = this.add.text(512, 600, '', { fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff', backgroundColor: '#008000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        this.actionButton.on('pointerdown', () => this.handleAction());

        const backButton = this.add.text(100, 50, 'Back', { fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff' }).setInteractive().on('pointerdown', () => this.scene.start('Shop'));
    }

    changeAnimal(direction: number) {
        this.currentAnimalIndex = (this.currentAnimalIndex + direction + this.animals.length) % this.animals.length;
        this.updateAnimalInfo();
    }

    updateAnimalInfo() {
        const animal = this.animals[this.currentAnimalIndex];
        this.animalImage.setTexture(animal.image);
        this.animalNameText.setText(animal.name);
        this.animalInfoText.setText(`Health: ${animal.health}\nSpeed: ${animal.speed} u/s\nJump: ${animal.jump} units\nAbility: ${animal.ability}\nUses: ${animal.abilityUses}\nCost: ${animal.cost} coins`);

        const isOwned = this.ownedAnimals.includes(animal.name);
        this.actionButton.setText(isOwned ? 'Owned' : 'Buy');
        this.actionButton.setInteractive(!isOwned);
        this.actionButton.setStyle({ backgroundColor: isOwned ? '#888888' : '#008000' });
    }

    async fetchOwnedAnimals() {
        if (!this.npub) {
            console.error('User not logged in');
            return;
        }
    
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
            const response = await axios.get(`${apiUrl}/users/${this.npub}/characters`);
            this.ownedAnimals = response.data.characters;
        } catch (error) {
            console.error('Error fetching owned animals:', error);
            this.ownedAnimals = [];
            this.showMessage('Failed to fetch owned animals. Please try again.', '#ff0000');
        }
    }
    
    async handleAction() {
        const animal = this.animals[this.currentAnimalIndex];
        if (this.ownedAnimals.includes(animal.name)) {
            return; // Do nothing if already owned
        }
    
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const url = `${apiUrl}/users/${this.npub}/buy-animal`;
        const data = { animal: animal.name };
    
        try {
            const response = await axios.post(url, data);
            if (response.data.success) {
                this.ownedAnimals.push(animal.name);
                this.showMessage(`Successfully bought ${animal.name}!`, '#00ff00');
            } else {
                this.showMessage(`Failed to buy ${animal.name}. ${response.data.message || 'Please try again.'}`, '#ff0000');
            }
        } catch (error: any) {
            this.showMessage(`Error buying ${animal.name}: ${error.message}`, '#ff0000');
        }
        this.updateAnimalInfo();
    }

    private showMessage(message: string, color: string) {
        const messageText = this.add.text(512, 700, message, { fontFamily: 'Arial', fontSize: 24, color: color }).setOrigin(0.5);
        this.time.delayedCall(2000, () => messageText.destroy());
    }
}