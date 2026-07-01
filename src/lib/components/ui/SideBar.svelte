<script>
    import { ShoppingCart } from '@lucide/svelte';

</script>

<div class="main-block">
    <div class="sideBar">
        <div class="header">
            <h1>Orden actual</h1>
        </div>
        <div class="info-container">
            <h2 class="info-text">
                Agrega productos a la orden para ver el total
            </h2>
            <ShoppingCart
                size={80}
                color="#403936" 
            />
        </div>

        <div class="footer">
            <div class="total-text-container">
                <p class="total-text">
                    Total
                </p>

            </div>

            <div class="total-amount-container">
                <p class="total-amount">
                    $0.00
                </p>
            </div>

        </div>

        <div class="payment-container">
            <button class="payment-button">
                Pagar
            </button>

            <button class="cancel-button">
                Cancelar
            </button>

        </div>

    </div>
</div>

<style>
.main-block {
    display: flex;
    min-height: 100vh;
}

.sideBar {
    margin-left: auto;
    width: 33%;
    background-color: #201C19;
    border-radius: 20px 0 0 20px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.header {
    color: #ffffff;
    display: flex;
    padding: 1rem;
    font-size: 1.7rem;
    font-weight: bolder;
    border: 3px solid #342E2B;
    border-radius: 20px 0 0 0;
}

.info-container {
    flex: 4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 3px solid #342E2B;
    margin-top: -3px;
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

.payment-button {
    background-color: #F28C0F;
    padding: 1rem;
    flex: 2;
    border: none;
    border-radius: 15px;
}

.cancel-button {
    background-color: #352F2C;
    padding: 1rem;
    flex: 1;
    border: none;
    border-radius: 15px;
}
</style>