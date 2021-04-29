import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toCommunitiesMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[communityMiddleware] account', req.accountSession); // TODO logging

		const findCommunitiesResult = await db.repos.communities.filterByAccount(
			req.accountSession?.account.account_id!,
		);
		if (findCommunitiesResult.ok) {
			return send(res, 200, {communities: findCommunitiesResult.value}); // TODO API types
		} else {
			console.log('[communityMiddleware] error while searching for communities');
			return send(res, 500, {reason: 'error while searching for communities'});
		}
	};
};

//Returns a single community object
export const toCommunityMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[communityMiddleware] account', req.accountSession?.account.account_id!); // TODO logging
		console.log('[communityMiddleware] community', req.params.community_id);

		const findCommunityResult = await db.repos.communities.findById(req.params.community_id);
		if (findCommunityResult.ok) {
			return send(res, 200, {community: findCommunityResult.value}); // TODO API types
		} else {
			console.log('no community found');
			const code = findCommunityResult.type === 'noCommunityFound' ? 404 : 500;
			return send(res, code, {reason: findCommunityResult.reason});
		}
	};
};