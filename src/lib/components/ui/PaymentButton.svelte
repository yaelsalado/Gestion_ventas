<script lang="ts">
    import { CreditCard, Banknote, CircleCheckBig, ArrowLeft } from '@lucide/svelte'
    import { cart } from '$lib/cart.svelte'
    import { supabase } from '$lib/supabaseClient'

    let modalOpen = $state(false);
    let { class: className = '' } = $props();
    let falloPago = $state(false);
    let ventaIdActual = $state<number | null>(null);
    let canalActual: ReturnType<typeof supabase.channel> | null = null;
    let efectivoRecibido = $state(0);
    let cambio = $derived(obtenerCambio(efectivoRecibido, cart.total));
    let inputEfectivo = $state(false);
    let pagoExitoso = $state(false);

    function toggleModal(){
        modalOpen = !modalOpen;
    }

    function cerrarModal(){
        modalOpen = false;
        inputEfectivo = false;
        efectivoRecibido = 0;
    }

    function mostrarExito(){
        pagoExitoso = true;
        setTimeout(() => { pagoExitoso = false; }, 2500);
    }

    function formatMoney(n: number){
        return `$${n.toFixed(2)}`;
    }

    function suscribirseVenta(ventaId: number){
        canalActual = supabase
            .channel(`sale-${ventaId}`)
            .on('postgres_changes',{
                event: 'UPDATE',
                schema: 'public',
                table: 'sale',
                filter: `id=eq.${ventaId}`},
                (payload) => {
                    if (payload.new.state === 'pagada'){
                        cart.cancelOrder();
                        mostrarExito();
                        supabase.removeChannel(canalActual!);
                    }
                    else if (payload.new.state === 'cancelada'){

                        falloPago = true;
                        supabase.removeChannel(canalActual!);
                    }
            })
            .subscribe();
    }


    function confirmarEfectivo(){
        cart.cancelOrder();
        ventaIdActual = null;
        cerrarModal();
        mostrarExito();
    }

    async function mandarATerminal(ventaId: number){
        const res = await fetch('/api/webhooks/pagos/crear-intento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sale_id: ventaId })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            console.error('Error al mandar el cobro a la terminal', body);
            falloPago = true;
            return;
        }

        falloPago = false;
        suscribirseVenta(ventaId);
    }

    async function procesarPago(metodoPago: 'tarjeta' | 'efectivo') {
        const items = cart.items.map(p => ({
            producto_id: p.id,
            cantidad: p.quantity
        }));

        const { data, error } = await supabase.rpc('procesar_venta', {
            items: items,
            metodo_pago: metodoPago
        });

        if (error) {
            console.error("Error al procesar venta", error);
            alert('Error procesando la venta :(');
            return;
        }

        console.log('venta procesada con éxito', data);

        ventaIdActual = data;

        if (metodoPago === 'tarjeta') {
            await mandarATerminal(data);
            cerrarModal();
        }
        else {
            await confirmarEfectivo();
        }

        cerrarModal();
    }

    async function reintentaPago(ventaId: number) {
        if (ventaId) {
            await mandarATerminal(ventaId);
        }
    }

    function obtenerCambio(efectivo: number, total: number){
        const cambio = efectivo - total;

        if (cambio < 0){
            return null;
        }

        return Math.round(cambio * 100) / 100;
    }
</script>

<div class={className}>
    <button type='button' class='payment-button' onclick={toggleModal} disabled = {cart.items.length === 0}>
        Pagar
    </button>

    {#if modalOpen}
        <div class="overlay" onclick={toggleModal}>
            <h2 class="overlay-title">{inputEfectivo ? 'Cobro en efectivo' : 'Método de pago'}</h2>
            <div class="modal" onclick={(e) => e.stopPropagation()}>
                {#if !inputEfectivo}
                    <button type='button' class="payment-option" onclick={()=> procesarPago('tarjeta')}>
                        <CreditCard/>
                        Tarjeta
                    </button>
                    <button type='button' class="payment-option" onclick={()=> { inputEfectivo = true; }}>
                        <Banknote/>
                        Efectivo
                    </button>
                {:else}
                    <div class="cash-panel">
                        <button type="button" class="cash-back" onclick={() => { inputEfectivo = false; efectivoRecibido = 0; }}>
                            <ArrowLeft size={16}/>
                            Volver
                        </button>

                        <p class="cash-total">Total a pagar: <strong>{formatMoney(cart.total)}</strong></p>

                        <label class="cash-label" for="efectivo-input">Efectivo recibido</label>
                        <div class="cash-input-wrapper">
                            <span class="cash-currency">$</span>
                            <input
                                id="efectivo-input"
                                class="cash-input"
                                type="number"
                                placeholder="0.00"
                                bind:value={efectivoRecibido}
                                min={0}
                                step={0.01}
                            />
                        </div>

                        {#if cambio === null}
                            <p class="cash-insuficiente">Falta {formatMoney(cart.total - efectivoRecibido)}</p>
                        {:else}
                            <p class="cash-cambio">Cambio: {formatMoney(cambio)}</p>
                        {/if}

                        <button type='button' class="confirmar-efectivo-button" onclick={()=> procesarPago('efectivo') } disabled={cambio === null}>
                            Confirmar efectivo
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    {#if pagoExitoso}
        <div class="overlay success-overlay" onclick={() => (pagoExitoso = false)}>
            <div class="success-banner">
                <CircleCheckBig size={64}/>
                <p>¡Pago confirmado!</p>
            </div>
        </div>
    {/if}

    {#if falloPago}
    <div class="overlay">
        <div class="modal">
            <p>El pago no se completó correctamente.</p>
            <button onclick={() => { if (ventaIdActual) reintentaPago(ventaIdActual); }}>Reintentar</button>
            <button onclick={() => { falloPago = false; cart.cancelOrder(); }}>Cancelar venta</button>
        </div>
    </div>
{/if}
</div>

<style>
.overlay{
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.overlay-title{
    font-weight: bolder;
    font-size:2rem;
    padding: 1rem;
}

.modal{
    background: #201C19;
    border: 3px solid #342E2B;
    padding: 2rem;
    border-radius: 12px;
    min-width: 320px;
    max-width: 90vw;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    justify-content: center;
    align-items: center;
}

.payment-option{
    background: #352F2C;
    padding: 0.75rem 2.5rem 0.75rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.payment-option:active{
    background-color: darkorange;
    transform: translateY(-8px);
}

.payment-button{
    background-color: #F28C0F;
    padding: 1rem;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    flex: 1;
}

.payment-button:disabled{
    opacity: 0.5;
    cursor: not-allowed;
}

.cash-panel {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    width: 280px;
}

.cash-back {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: none;
    color: #9a8f8a;
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0;
    align-self: flex-start;
}

.cash-total {
    color: #9a8f8a;
    font-size: 0.9rem;
}

.cash-total strong {
    color: #ffffff;
}

.cash-label {
    color: #9a8f8a;
    font-size: 0.85rem;
}

.cash-input-wrapper {
    display: flex;
    align-items: center;
    background: #352F2C;
    border: 2px solid #342E2B;
    border-radius: 12px;
    padding: 0.6rem 1rem;
    transition: border-color 0.2s ease;
}

.cash-input-wrapper:focus-within {
    border-color: #F28C0F;
}

.cash-currency {
    color: #9a8f8a;
    font-size: 1.4rem;
    font-weight: bolder;
    margin-right: 0.25rem;
}

.cash-input {
    flex: 1;
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 1.4rem;
    font-weight: bolder;
    -moz-appearance: textfield;
}

.cash-input::-webkit-outer-spin-button,
.cash-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.cash-cambio {
    color: #5fd98a;
    font-size: 1.2rem;
    font-weight: bolder;
    text-align: center;
}

.cash-insuficiente {
    color: #e05d5d;
    font-size: 1rem;
    text-align: center;
}

.confirmar-efectivo-button {
    background-color: #F28C0F;
    color: #201C19;
    padding: 0.9rem;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-weight: bolder;
    font-size: 1rem;
}

.confirmar-efectivo-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.success-overlay {
    background: rgba(0, 0, 0, 0.65);
}

.success-banner {
    background: #1f9d55;
    color: #ffffff;
    padding: 3rem 4rem;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
    font-weight: bolder;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

@media (max-width: 600px) {
    .modal {
        flex-direction: column;
        min-width: unset;
        width: 85vw;
        padding: 1.5rem;
        gap: 1rem;
    }

    .payment-option {
        width: 100%;
        flex-direction: row;
        justify-content: center;
        padding: 0.9rem 1rem;
    }

    .cash-panel {
        width: 100%;
    }

    .overlay-title {
        font-size: 1.4rem;
        text-align: center;
    }

    .success-banner {
        padding: 2rem 2.5rem;
        font-size: 1.4rem;
        text-align: center;
    }
}
</style>