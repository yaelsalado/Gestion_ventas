<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SideBar from '$lib/components/ui/SideBar.svelte';
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { DollarSign, HandPlatter, UserStar } from '@lucide/svelte'


	let { children } = $props();
	let rol = $state(false);

	async function traerRol() {
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user){
			console.error(userError);
			return;
		}
		const { data, error } = await supabase
			.from("profiles")
			.select("is_admin")
			.eq("id", user.id)
			.single();

			if (error || !data){
				console.error(error)
				return;
			}

			rol = data.is_admin; 
	}

	onMount( async () => {
		cart.load();
		await traerRol();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="layout-container">

	<div class="main">
		<div class="content">
			{@render children()}
		</div>

		<div class="menu-container">
			<a href="/" onclick={() => cart.setContext('caja')}>
				<button class="menu-button">
					<DollarSign strokeWidth={3}/>
					<span>Caja</span>
				</button>
			</a>
			<a href="/mesas">
				<button class="menu-button">
					<HandPlatter strokeWidth={3}/>
					<span>Mesas</span>
				</button>
			</a>
			{#if rol || !rol}
				<a href="/admin">
					<button class="menu-button">
						<UserStar strokeWidth={3}/>
						<span>Admin</span>
					</button>
				</a>
			{/if}			

		</div>
	</div>
	<div class="sidebar-container">
			<SideBar/>
	</div>
</div>

<style>
	
.layout-container {
	display: flex;

}

.content {
	flex: 2;
	overflow-y: auto;
}

.sidebar-container {
	flex:1;
    width: 30rem;
}

.menu-container{
	display: flex;
	flex: 1;
	position:absolute;
	top: 0;
    left: 0;
    right: 0;
	height: 5rem;
	width: 100%;
	border: solid 3px 0 0 0;
	border-color: #342E2B;
	background-color: #201C19;
	border-radius: 0 0 0 7px;
}

.menu-container > a {
    flex: 1;
    display: flex;
    text-decoration: none;
}

.menu-button{
	flex:1;
	display: flex;
	border: solid 2px;
	border-color: #342E2B;;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	gap: 4px;
	color: #6b5e59;
}

.main{
	flex: 2;
	position: relative;
}

@media (max-width: 768px) {
	.layout-container {
		flex-direction: column;
	}

	.main {
		width: 100%;
		padding-bottom: 42vh;
	}

	.sidebar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		flex: none;
		z-index: 500;
	}
}

@media (max-width: 420px) {
	.menu-container {
		height: 4.2rem;
	}

	.menu-button {
		font-size: 0.7rem;
		gap: 2px;
	}
}

</style>