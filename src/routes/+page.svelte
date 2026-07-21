<script lang="ts">
	import ProductsCards from '$lib/components/ui/ProductsCards.svelte';
    import '../app.css';
    import { Menu, Ellipsis } from '@lucide/svelte';
    import LoginCard from '$lib/components/ui/LoginCard.svelte';
    import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

    let modalOpen = $state(false);
    let isAdminUser = $state(false);
    let showButtons = $state(false);

    function toggle(){
        showButtons = !showButtons;
    }

    function closeModal(){
        modalOpen = false;
    }

    function openModal(){
        modalOpen = true;
    }

    async function isAdmin(): Promise<boolean> {
        const {data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        const { data:profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            alert('Error al verificar el rol de administrador: ' + error?.message);
            return false;
        }

        return profile.is_admin;
    }

    onMount(async () => {
        isAdminUser = await isAdmin();
    });

</script>

<div class="page">
    <div class="product-block">
        <ProductsCards />
    </div>


    <button class="show-menu-button" onclick={toggle}>
        <Ellipsis size={25} color="white" strokeWidth={2.5} />
    </button>

    {#if showButtons}
        <div class="menu-buttons">
            {#if isAdminUser}
                <button class="admin-button" style="--i: 0" onclick={openModal}>
                    <Menu size={25} color="white" strokeWidth={2.5}/>
                </button>
            {/if}

            <button class="menu-button" style="--i: {isAdminUser ? 1 : 0}">
                Registrarse
            </button>
        </div>
    {/if}

    {#if modalOpen}
        <div class="overlay" onclick={closeModal}>
            <div class="modal" onclick={(e) => e.stopPropagation()}>
                <LoginCard />
                <button onclick={closeModal}>Cerrar</button>
            </div>
        </div>
    {/if}

</div>

<style>

.page {
    position: relative;

    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.product-block {
    flex: 1;
}

.menu-buttons {
    position: fixed;
    left: 1.5rem;
    bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: .75rem;
    z-index: 20;
    pointer-events: none;
}

.show-menu-button {
    position: fixed;
    left: 1.5rem;
    bottom: 1.5rem;
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #F28C0F;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 21;
    transition:
        transform .15s ease,
        background-color .15s ease;
}

.show-menu-button:hover {
    background-color: #ff9d22;
}

.admin-button,
.menu-button {
    position: absolute;
    pointer-events: auto;
    left: 0;
    bottom: 0;
    --angle: calc(90deg - (var(--i) * 40deg));
    transform: translate(
        calc(cos(var(--angle)) * 5rem),
        calc(-1 * sin(var(--angle)) * 5rem)
    );
    width: 3rem;
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #342E2B;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition:
        transform .2s ease,
        background-color .15s ease;
}

.admin-button:hover,
.menu-button:hover {
    background-color: #403936;
}

.menu-button {
    padding: 0 1rem;
    width: auto;
    min-width: 3rem;
    border-radius: 999px;
}

</style>
