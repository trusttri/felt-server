import type {Async_Status} from '@feltcoop/felt';
import type {Json} from '@feltcoop/felt/util/json.js';
import {writable} from 'svelte/store';

import {messages} from '$lib/ui/messages_store';
import {posts} from '$lib/ui/post_store';

// This store wraps a browser `WebSocket` connection with all of the Sveltey goodness.

// TODO rename? Connection? SocketConnection?
// TODO consider xstate, looks like a good usecase

export interface SocketState {
	url: string | null;
	ws: WebSocket | null;
	connected: boolean;
	status: Async_Status; // rename? `connectionStatus`? `connection`?
	error: string | null;
	sendCount: number;
}

// TODO is this the preferred type definition?
export type SocketStore = ReturnType<typeof createSocketStore>;

export const createSocketStore = () => {
	const {subscribe, update} = writable<SocketState>(toDefaultSocketState(), () => {
		console.log('[socket] listen store');
		return () => {
			console.log('[socket] unlisten store');
			unsubscribe();
		};
	});
	const unsubscribe = subscribe((value) => {
		console.log('[socket] store subscriber', value);
	});

	const disconnect = (code = 1000): void => {
		update(($socket) => {
			console.log('[socket] disconnect', code, $socket.url);
			if (!$socket.ws) return $socket;
			$socket.ws.close(code);
			return {...$socket, status: 'pending', connected: false, ws: null, url: null};
		});
	};

	const connect = (url: string): void => {
		console.log('[socket] connect', url);
		update(($socket) => {
			if ($socket.connected || $socket.ws || $socket.status !== 'initial') {
				throw Error('socket already connected'); // TODO return errors instead?
			}
			return {
				...$socket,
				url,
				connected: false,
				status: 'pending',
				ws: createWebSocket(url),
				error: null,
			};
		});
	};

	const createWebSocket = (url: string): WebSocket => {
		const ws = new WebSocket(url);
		ws.onopen = (e) => {
			console.log('[socket] open', e);
			//send('hello world, this is client speaking');
			update(($socket) => ({...$socket, status: 'success', connected: true}));
		};
		ws.onclose = (e) => {
			console.log('[socket] close', e);
			update(($socket) => ({...$socket, status: 'initial', connected: false, ws: null, url: null}));
		};
		ws.onmessage = (e) => {
			console.log('[socket] on message!');
			let message: any; // TODO types
			try {
				message = JSON.parse(e.data);
			} catch (err) {
				console.error('bad payload', e, err);
				return;
			}
			console.log('[socket] message', message);
			if (message.type === 'Create') {
				messages.update(($messages) => [message, ...$messages]);
			} else {
				console.log('[socket] post', message.posts);
				posts.update(($posts) => [...$posts, message.posts]);
			}
		};
		ws.onerror = (e) => {
			console.log('[socket] error', e);
			update(($socket) => ({...$socket, status: 'failure', error: 'unknown websocket error'}));
			status = 'failure';
		};
		console.log('[socket] ws', ws);

		return ws;
	};

	const send = (data: Json) => {
		console.log('[ws] sending ', data);
		update(($socket) => {
			if (!$socket.ws) return $socket;
			$socket.ws.send(JSON.stringify(data));
			return {...$socket, sendCount: $socket.sendCount + 1};
		});
	};

	return {subscribe, disconnect, connect, send};
};

const toDefaultSocketState = (): SocketState => ({
	url: null,
	ws: null,
	connected: false,
	status: 'initial',
	error: null,
	sendCount: 0,
});