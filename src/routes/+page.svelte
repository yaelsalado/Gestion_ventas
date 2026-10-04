<script lang="ts">
	import ProductsCards from '$lib/components/ui/ProductsCards.svelte';
    import '../app.css';



</script>

<div class="page">
    <div class="product-block">
        <ProductsCards />
    </div>



</div>



<style>

.page {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
    gap: 1rem;
}

.product-block {
    flex: 2;
    min-width: 0;
    overflow-y: auto;
    margin-top: 6rem;
}

@media (max-width: 420px) {
    .product-block {
        margin-top: 5.2rem;
    }
}


</style>
