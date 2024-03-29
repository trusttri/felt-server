import polka from 'polka';
import {suite} from 'uvu';
import * as t from 'uvu/assert';
import postgres from 'postgres';
import {createServer} from 'http';

import {Api_Server} from '$lib/server/Api_Server.js';
import {Database} from '$lib/db/Database.js';
import {default_postgres_options} from '$lib/db/postgres.js';
import {Websocket_Server} from '$lib/server/Websocket_Server.js';

const TEST_PORT = 3003; // TODO

/* test_api_server */
const test_api_server = suite('Api_Server');

test_api_server('init and close', async () => {
	const server = createServer();
	const api_server = new Api_Server({
		server,
		app: polka({server}),
		websocket_server: new Websocket_Server(server),
		db: new Database({sql: postgres(default_postgres_options)}),
		port: TEST_PORT,
	});
	t.is(api_server.port, TEST_PORT);
	await api_server.init();
	// TODO make API requests, and look into before/after
	await api_server.close();
});

test_api_server.run();
/* /test_api_server */
