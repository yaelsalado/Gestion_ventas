<script lang="ts">
    import { CreditCard, Banknote } from '@lucide/svelte'
    import { cart } from '$lib/cart.svelte'
    import { supabase } from '$lib/supabaseClient'

    let modalOpen = $state(false);
    let { class: className = '' } = $props();

    function toggleModal(){
        modalOpen = !modalOpen;
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

        if (metodoPago === 'tarjeta') {
            const canal=supabase
                .channel(`sale-${data}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'sale',
                    filter: `id=eq.${data}`},
                (payload) => {
                    console.log('🔔 Evento recibido, state =', JSON.stringify(payload.new.state));

                    if (payload.new.state === 'pagada') {
                        console.log('✅ Entrando al if de pagada, limpiando carrito...');
                        cart.cancelOrder();
                        supabase.removeChannel(canal);
                    }
                    else if (payload.new.state === 'cancelada') {
                        console.log('❌ Entrando al if de cancelada');
                        supabase.removeChannel(canal);
                    }
                    else {
                        console.log('⚠️ Ningún if coincidió, state real fue:', payload.new.state);
                    }
                })
                .subscribe((status)=> {
                    console.log('📡 Estado de la suscripción:', status);
                });

            const res = await fetch('/api/webhooks/pagos/crear-intento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sale_id: data })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error('Error al mandar el cobro a la terminal', body);
                return;
            }


        }
        
        else {
            cart.cancelOrder(); 
        }

        modalOpen = false;
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