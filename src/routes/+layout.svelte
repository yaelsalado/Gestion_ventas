<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SideBar from '$lib/components/ui/SideBar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="layout-container">
	<div class="content">
		{@render children()}
	</div>
	<SideBar />
</div>

<style>
	
	.layout-container {
		display: flex;
		min-height: 100vh;
	}

	.content {
		flex: 1;
		overflow-y: auto;
	}
</style>