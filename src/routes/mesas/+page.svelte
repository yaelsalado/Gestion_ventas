<script lang="ts">
    import { Dice1, Dice2, Dice3, Dice4, Dice5 } from '@lucide/svelte'
    import { goto } from '$app/navigation';
    import { cart } from '$lib/cart.svelte';

    function contextoDe(numero: number) {
        return `mesa-${numero}`;
    }

    function ocupada(numero: number) {
        return (cart.carts[contextoDe(numero)]?.length ?? 0) > 0;
    }

    function abrirMesa(numero: number) {
        cart.setContext(contextoDe(numero));
        goto('/');
    }
</script>

<div class="tables">
    <div class="button-container">
        <button class="table-button" class:ocupada={ocupada(4)} onclick={() => abrirMesa(4)}>
            <Dice4 strokeWidth={2} size={80}/>
            <span>Mesa 4</span>
            <span class="mesa-estado">{ocupada(4) ? `$${cart.totalDe(contextoDe(4)).toFixed(2)}` : 'Libre'}</span>
        </button>

        <button class="table-button" class:ocupada={ocupada(5)} onclick={() => abrirMesa(5)}>
            <Dice5 strokeWidth={2} size={80}/>
            <span>Mesa 5</span>
            <span class="mesa-estado">{ocupada(5) ? `$${cart.totalDe(contextoDe(5)).toFixed(2)}` : 'Libre'}</span>
        </button>
    </div>

    <div class="button-container">
        <button class="table-button" class:ocupada={ocupada(2)} onclick={() => abrirMesa(2)}>
            <Dice2 strokeWidth={2} size={80}/>
            <span>Mesa 2</span>
            <span class="mesa-estado">{ocupada(2) ? `$${cart.totalDe(contextoDe(2)).toFixed(2)}` : 'Libre'}</span>
        </button>

        <button class="table-button" class:ocupada={ocupada(3)} onclick={() => abrirMesa(3)}>
            <Dice3 strokeWidth={2} size={80}/>
            <span>Mesa 3</span>
            <span class="mesa-estado">{ocupada(3) ? `$${cart.totalDe(contextoDe(3)).toFixed(2)}` : 'Libre'}</span>
        </button>
    </div>

    <div class="button-container">
        <button class="table-button" class:ocupada={ocupada(1)} onclick={() => abrirMesa(1)}>
            <Dice1 strokeWidth={2} size={80}/>
            <span>Mesa 1</span>
            <span class="mesa-estado">{ocupada(1) ? `$${cart.totalDe(contextoDe(1)).toFixed(2)}` : 'Libre'}</span>
        </button>
    </div>
</div>


<style>

.tables{
    margin: 8rem 1.5rem 0 1.5rem;
}

.button-container{
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 2rem;
}

.table-button{
    padding: 2.5rem 0 2.5rem 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #201C19;
    border: 2px solid #342E2B;
    border-radius: 15px;
    font-size: 1.2rem;
    gap: 1rem;
    color: #7d7570;
    transition: border-color 0.2s ease, color 0.2s ease;
}

.table-button.ocupada{
    border-color: #F28C0F;
    color: #F28C0F;
}

.mesa-estado{
    font-size: 0.9rem;
    font-weight: bolder;
}

@media (max-width: 600px) {
    .tables {
        margin: 6.5rem 1rem 0 1rem;
    }

    .button-container {
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .table-button {
        padding: 1.5rem 0;
        font-size: 1rem;
        gap: 0.5rem;
    }

    .table-button :global(svg) {
        width: 48px;
        height: 48px;
    }
}
</style>