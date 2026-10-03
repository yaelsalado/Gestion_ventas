<script lang="ts">
    import { CreditCard, Banknote } from '@lucide/svelte'
    import { cart } from '$lib/cart.svelte'
    import { supabase } from '$lib/supabaseClient'

    let modalOpen = $state(false);
    let { class: className = '' } = $props();
    let falloPago = $state(false);
    let ventaIdActual = $state<number | null>(null);
    let canalActual: ReturnType<typeof supabase.channel> | null = null;

    function toggleModal(){
        modalOpen = !modalOpen;
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
                        supabase.removeChannel(canalActual!);
                    }
                    else if (payload.new.state === 'cancelada'){

                        falloPago = true;
                        supabase.removeChannel(canalActual!);
                    }
            })
            .subscribe();
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
        }

        else {
            cart.cancelOrder(); 
        }

        modalOpen = false;
    }

    async function reintentaPago(ventaId: number) {
        if (ventaId) {
            await mandarATerminal(ventaId);
        }
    }
</script>

<div class={className}>
    <button type='button' class='payment-button' onclick={toggleModal}>
        Pagar
    </button>

    {#if modalOpen}
        <div class="overlay" onclick={toggleModal}>
            <h2 class="overlay-title">Método de pago</h2>
            <div class="modal" onclick={(e) => e.stopPropagation()}>
                <button type='button' class="payment-option" onclick={()=> procesarPago('tarjeta')}>
                    <CreditCard/>
                    Tarjeta
                </button>
                <button type='button' class="payment-option" onclick={()=> procesarPago('efectivo')}>
                    <Banknote/>
                    Efectivo
                </button>
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
    width: 30%;
    height: 20%;
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
</style>