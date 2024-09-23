import * as nostr from 'nostr-tools';
import NDK, { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import axios from 'axios';

let ndk: NDK;

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize NDK with specified relay URLs
export async function initializeNDK() {
    if (!ndk) {
        ndk = new NDK({
            explicitRelayUrls: [
                'wss://relay.damus.io',
                'wss://relay.snort.social',
                'wss://nostr.build',
                'wss://nostr.wine',
                'wss://nostr.mom',
                'wss://nostr.guru',
                'wss://nostr.zebedee.cloud',
                'wss://nostr.mutiny.nz',
                'wss://nostr.openchain.fr',
                'wss://nostr.nostr.build',
                'wss://nostr.nostr.land',
                'wss://nostr.nostr.re',
            ],
        });
        await ndk.connect();
    }
}

// Log in with Nostr and return the public key
export async function loginWithNostr(): Promise<string | null> {
    if (!window.nostr) {
        console.error('No NOSTR provider found');
        return null;
    }

    try {
        const pubkey = await window.nostr.getPublicKey();
        return pubkey;
    } catch (error) {
        console.error('Error logging in with NOSTR:', error);
        return null;
    }
}

// Subscribe to user events
export function subscribeToUserEvents(pubkey: string, callback: (event: NDKEvent) => void) {
    const sub = ndk.subscribe(
        {
            kinds: [1],
            authors: [pubkey],
        },
        { closeOnEose: false }
    );

    sub.on('event', (event: NDKEvent) => {
        callback(event);
    });

    return sub;
}

// Convert pubkey to NIP-19 format
export function pubkeyToNpub(pubkey: string): string {
    return nostr.nip19.npubEncode(pubkey);
}

// Fetch user profile information
export async function getUserProfile(pubkey: string): Promise<{ name?: string; picture?: string }> {
    await initializeNDK(); // Ensure NDK is initialized
    const user = ndk.getUser({ pubkey });
    await user.fetchProfile();
    return {
        name: user.profile?.name,
        picture: user.profile?.image,
    };
}

// Save user data to the database
export async function saveUserData(nostrName: string | undefined, pubkey: string) {
    await delay(3000);

    const formattedPubkey = pubkeyToNpub(pubkey);
    const nameToSave = nostrName || "Anonymous";

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nostrName: nameToSave, npub: formattedPubkey }),
        });

        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('Error response:', errorResponse);
            throw new Error(`Failed to save user data: ${errorResponse}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}

// Logout function (implement if needed)
export function logout() {
    // Implement logout logic here if needed
    // For now, we'll just return a resolved promise
    return Promise.resolve();
}