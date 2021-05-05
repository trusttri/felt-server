import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toPostsMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[postMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[postMiddleware] community', req.params.community);
		console.log('[postMiddleware] space', req.params.space);

		const findPostsResult = await db.repos.posts.filterBySpace('1');
		if (findPostsResult.ok) {
			return send(res, 200, {communities: findPostsResult.value}); // TODO API types
		} else {
			console.log('[postMiddleware] error while searching for posts');
			return send(res, 500, {reason: 'error while searching for posts'});
		}
	};
};
