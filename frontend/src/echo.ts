import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Keep Pusher reference available for Laravel Echo's internal use
// @ts-expect-error - Pusher must be globally available for Echo's reverb broadcaster
window.Pusher = Pusher;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const reverbHost = import.meta.env.VITE_REVERB_HOST || (isLocal ? 'localhost' : null);

export const echo = reverbHost ? new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'saborexpresskey',
    wsHost: reverbHost,
    wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
    forceTLS: isLocal ? ((import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https') : true,
    enabledTransports: ['ws', 'wss'],
}) : {
    channel() {
        return {
            listen() { return this; },
            stopListening() { return this; }
        };
    }
} as any;
