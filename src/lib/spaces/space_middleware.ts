import send from '@polka/send-type';

import type {Api_Server, Middleware} from '$lib/server/Api_Server.js';

//Returns a single space object
export const to_space_middleware = (server: Api_Server): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] space', req.params.space_id);

		const find_space_result = await db.repos.spaces.find_by_id(req.params.space_id);
		if (find_space_result.ok) {
			return send(res, 200, {community: find_space_result.value}); // TODO API types
		} else {
			console.log('no space found');
			const code = find_space_result.type === 'no_space_found' ? 404 : 500;
			return send(res, code, {reason: find_space_result.reason});
		}
	};
};

//Returns all spaces in a given community
export const to_spaces_middleware = (server: Api_Server): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] retrieving spaces for community', req.params.community_id);

		const find_spaces_result = await db.repos.spaces.filter_by_community(req.params.community_id);
		if (find_spaces_result.ok) {
			return send(res, 200, {community: find_spaces_result.value}); // TODO API types
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return send(res, 500, {reason: 'error searching for community spaces'});
		}
	};
};

//Creates a new space for a given community
export const to_create_space_middleware = (server: Api_Server): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] creating space for community', req.params.community_id);
		console.log('[post_middleware] body', req.body);

		const create_space_result = await db.repos.spaces.insert(
			req.params.community_id,
			req.body.url,
			req.body.media_type,
			req.body.content,
		);
		if (create_space_result.ok) {
			return send(res, 200, {space: create_space_result.value}); // TODO API types
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return send(res, 500, {reason: 'error searching for community spaces'});
		}
	};
};