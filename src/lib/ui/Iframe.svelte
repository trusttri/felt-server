<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';
	import Pending_Animation_Overlay from '$lib/ui/Pending_Animation_Overlay.svelte';

	export let space: Space;
	export let url: string; // TODO type

	let loaded = false;
</script>

<!-- TODO figure out sandboxing -- allow-same-origin? -->

<div class="iframe-wrapper">
	<iframe
		sandbox="allow-scripts allow-pointer-lock"
		frameborder="0"
		title={space.name}
		src={url}
		on:load={() => (loaded = true)}
	/>
	{#if !loaded}
		<Pending_Animation_Overlay />
	{/if}
</div>

<style>
	.iframe-wrapper {
		flex: 1;
		display: flex;
		position: relative; /* for the absolute positioned pending animation */
	}
	iframe {
		flex: 1;
	}
</style>
