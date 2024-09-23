import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { loginWithNostr, logout, saveUserData } from '../../nostr/LoginWithNostr';
import React from 'react';
import { createRoot } from 'react-dom/client';
import NostrStatus from '../../nostr/NostrStatus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    loginButton: GameObjects.Text;
    joinGameButton: GameObjects.Text;
    shopButton: GameObjects.Text;
    logoutButton: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.loginButton = this.add.text(512, 520, 'Login with Nostr', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        this.loginButton.on('pointerdown', async () => {
            const pubkey = await loginWithNostr();
            if (pubkey) {
                EventBus.emit('nostr-login-success', pubkey);
                // Call saveUserData after successful login
                const nostrName = 'Anonymous'; // You can change this to get the actual name if needed
                const result = await saveUserData(nostrName, pubkey);
                console.log('User data saved:', result); // Log the result
                
            }
        });

        EventBus.on('nostr-login-success', this.onLoginSuccess, this);
        EventBus.on('nostr-logout', this.onLogout, this);

        EventBus.emit('current-scene-ready', this);

        // Render NostrStatus component
        const container = document.getElementById('nostr-status-container');
        if (container) {
            const root = createRoot(container);
            root.render(React.createElement(NostrStatus));
        }
    }

    onLoginSuccess(pubkey: string) {
        this.loginButton.setVisible(false);
    
        this.joinGameButton = this.add.text(512, 580, 'Join Game', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        this.shopButton = this.add.text(512, 640, 'Shop', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        this.shopButton.on('pointerdown', () => {
            this.scene.start('Shop'); // Start the Shop scene
        });
    
        this.logoutButton = this.add.text(512, 700, 'Log Out', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
    
        this.joinGameButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
    
        this.logoutButton.on('pointerdown', async () => {
            await logout();
            EventBus.emit('nostr-logout');
        });
    }

    onLogout()
    {
        this.loginButton.setVisible(true);

        if (this.joinGameButton) this.joinGameButton.destroy();
        if (this.shopButton) this.shopButton.destroy();
        if (this.logoutButton) this.logoutButton.destroy();
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}