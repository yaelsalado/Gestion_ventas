<script lang="ts">
	import ProductsCards from '$lib/components/ui/ProductsCards.svelte';
    import '../app.css';
    import { Menu } from '@lucide/svelte';
    import LoginCard from '$lib/components/ui/LoginCard.svelte';
    import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

    let modalOpen = $state(false);
    let isAdminUser = $state(false);

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

    {#if isAdminUser}
        <button class="admin-button" onclick={openModal}>
            <Menu size={25} color="white" strokeWidth={2.5} />
        </button>
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
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.product-block {
    flex: 1;
}

.admin-button {
    margin: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #342E2B;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 150ms ease;
}

.admin-button:active {
    transform: scale(0.92); 
    background-color: #F28C0F;
}

.overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0, 0, 0, .55);
    backdrop-filter: blur(6px);

    z-index: 100;
}

.modal {
    width: min(500px, 90vw);

    background: #201C19;
    border: 3px solid #342E2B;
    border-radius: 20px;

    padding: 2rem;

    color: white;

    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    box-shadow: 0 20px 50px rgba(0, 0, 0, .45);

    animation: modalIn .18s ease;
}

.modal h2 {
    margin: 0;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
}

.modal button {
    align-self: flex-end;

    background: #352F2C;
    color: white;

    border: none;
    border-radius: 12px;

    padding: .8rem 1.5rem;

    cursor: pointer;

    transition: background-color .2s ease,
                transform .15s ease;
}

@media (hover: hover) {
    .modal button:hover {
        background: #F28C0F;
    }
}

.modal button:active {
    transform: scale(.96);
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: translateY(15px) scale(.96);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

</style>
