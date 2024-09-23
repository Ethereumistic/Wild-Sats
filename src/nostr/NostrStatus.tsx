import { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import { subscribeToUserEvents, pubkeyToNpub, getUserProfile, logout, saveUserData } from './LoginWithNostr';

const NostrStatus: React.FC = () => {
    const [pubkey, setPubkey] = useState<string | null>(null);
    const [npub, setNpub] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userPicture, setUserPicture] = useState<string | null>(null);
    const [latestEvent, setLatestEvent] = useState<string | null>(null);

    useEffect(() => {
        const storedNpub = localStorage.getItem('nostr_npub');
        if (storedNpub) {
            setNpub(storedNpub);
            // You might want to fetch the user profile here as well
        }
        const handleLoginSuccess = async (key: string) => {
            
            setPubkey(key);
            const formattedNpub = pubkeyToNpub(key);
            setNpub(formattedNpub);
            const profile = await getUserProfile(key);
            setUserName(profile.name || null); // Set userName to null if not available
            setUserPicture(profile.picture || null);
            localStorage.setItem('nostr_npub', formattedNpub);
            subscribeToUserEvents(key, (event) => {
                setLatestEvent(JSON.stringify(event, null, 2));
            
            });

            // Save user data after fetching the profile
            await saveUserData(profile.name, key); // Pass the fetched name
        };

        const handleLogout = () => {
            localStorage.removeItem('nostr_npub');
            setPubkey(null);
            setNpub(null);
            setUserName(null);
            setUserPicture(null);
            setLatestEvent(null);
        };

        EventBus.on('nostr-login-success', handleLoginSuccess);
        EventBus.on('nostr-logout', handleLogout);

        return () => {
            EventBus.off('nostr-login-success', handleLoginSuccess);
            EventBus.off('nostr-logout', handleLogout);
        };
    }, []);

    return (
        <div className="nostr-status">
            {pubkey ? (
                <>
                    <p>Logged in as: {userName || 'Anonymous'}</p>
                    <p>NPUB: {npub}</p>
                    {userPicture && <img src={userPicture} alt="User avatar" className="user-avatar" />}
                    {latestEvent && (
                        <>
                            <p>Latest event:</p>
                            <pre>{latestEvent}</pre>
                        </>
                    )}
                </>
            ) : (
                <p>Not logged in</p>
            )}
            <style jsx>{`
                .nostr-status {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .user-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 25px;
                    margin-bottom: 10px;
                }
            `}</style>
        </div>
    );
};

export default NostrStatus;