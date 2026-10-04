<script>
    import { ShoppingCart } from '@lucide/svelte';
    import { cart } from '$lib/cart.svelte';
    import PaymentButton from './PaymentButton.svelte';
</script>

<div class="sideBar">
    <div class="header">
        <h1>{cart.activeContext === 'caja' ? 'Caja' : `Mesa ${cart.activeContext.replace('mesa-', '')}`}</h1>
    </div>
    <div class="info-container">
        {#if cart.items.length === 0}
            <h2 class="info-text">
                Agrega productos a la orden para ver el total
            </h2>
            <ShoppingCart size={80} color="#403936" />
        {:else}
            {#each cart.items as item (item.id)}
                <div class="cart-item">
                    <p class="cart-item-name">{item.product_name}</p>
                    <p class="cart-item-price">${(item.price).toFixed(2)}</p>

                    <div class="quantity-controls">
                        <button onclick={() => cart.decreaseQuantity(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onclick={() => cart.increaseQuantity(item.id)}>+</button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    <div class="footer">
        <div class="total-text-container">
            <p class="total-text">Total</p>
        </div>
        <div class="total-amount-container">
            <p class="total-amount">${cart.total.toFixed(2)}</p>
        </div>
    </div>

    <div class="payment-container">
        <PaymentButton class="payment-wrapper"/>
        <button class="cancel-button" onclick={() => cart.cancelOrder()}>Cancelar</button>
    </div>
</div>

<style>
.sideBar {
    margin-left: auto;
    width: 100%;
    background-color: #201C19;
    border-radius: 20px 0 0 20px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
}

.header {
    color: #ffffff;
    display: flex;
    padding: 1rem;
    font-size: 1.7rem;
    font-weight: bolder;
    border: 3px solid #342E2B;
}

.info-container {
    flex: 4;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    border: 3px solid #342E2B;
    margin-top: -3px;
    overflow-y: auto;
    overflow-x: hidden;
}

.info-text {
    color: #403936;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 1000;
}

.footer {
    border-left: 3px solid #342E2B;
    border-right: 3px solid #342E2B;
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 5px 20px;

}

.total-text {
    font-size: 1.1rem;
    font-weight: bolder;
    margin-top: 1.5rem;
}

.total-amount {
    color: #F28C0F;
    font-size: 1.5rem;
    font-weight: bolder;
    margin-top: 1.5rem;
}

.payment-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
    border: 3px solid #342E2B;
    border-top: none;
    border-radius: 0 0 0 20px;
    margin-top: -3px;
    padding: 1rem;
}

.payment-container :global(.payment-wrapper) {
    flex: 2;
    display: flex;
}

.cancel-button {
    background-color: #352F2C;
    padding: 1rem;
    flex: 1;
    border: none;
    border-radius: 15px;
    cursor: pointer;
}

.cart-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #ffffff;
    width: 100%;
    padding: 1rem;
    border-top: solid 0.5px #57524f;
    border-bottom: solid 0.5px #57524f;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.quantity-controls button {
    background-color: #352F2C;
    color: #F28C0F;
    border: none;
    border-radius: 5px;
    width: 25px;
    height: 25px;
    cursor: pointer;
    font-weight: bolder;
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .sideBar {
        position: static;
        height: auto;
        max-height: 42vh;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.45);
    }

    .info-container {
        min-height: 0;
    }

    .header {
        font-size: 1.3rem;
        padding: 0.75rem 1rem;
    }

    .payment-container {
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }
}
</style>