<script lang="ts">
	import type {Community} from '$lib/communities/community.js';
	import Modal from '$lib/ui/Modal.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {Member} from '$lib/members/member.js';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let members: Member[];
	export let community: Community;

	$: invitable_members = community
		? members.filter((x) => !community.members.some((y) => x.account_id == y.account_id))
		: [];
</script>

<!--TODO: Make an Icon_Button component in felt and use it here-->
<Modal>
	<span slot="trigger" let:open>
		<button
			aria-label="Invite users to {community.name}"
			type="button"
			class="button-emoji"
			on:click={() => open()}
		>
			✉️
		</button>
	</span>
	<div slot="content">
		<Markup>
			<h1>Invite users to {community.name}</h1>
			{#each invitable_members as member (member.account_id)}
				<p>
					<button
						type="button"
						class="button-join"
						on:click={() => api.invite_member(community.community_id, member.account_id)}
					>
						[[TODO persona name: {member.account_id}]]
					</button>
				</p>
			{:else}
				<p>There's no one new to invite</p>
			{/each}
		</Markup>
	</div>
</Modal>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
