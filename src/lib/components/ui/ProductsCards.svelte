<script lang="ts">

    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { cart } from '$lib/cart.svelte';

    interface Product {
        id: number;
        product_name: string;
        price: number;
        category: string;
        photo_url: string;
    }

    let products: Product[] = $state([]);
    let errorMsg= $state('');
    let loading = $state(true);

    async function fetchProducts(){
        errorMsg = '';
        loading = true;

        const { data: productsData, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Error al traer los productos:', error);
            errorMsg = 'Error al traer la información de los productos';
            return;
        }   
        else {
            products = productsData as Product[];
        }

        loading = false;
    }

    onMount(() => {
        fetchProducts();
    });

</script>

<div class="main-block">
    <div class="products-container">
        {#if loading}
            <p>Cargando productos...</p>
        {:else if errorMsg}
            <p>{errorMsg}</p>
        {:else}
            {#each products as product (product.id)}
            <button class="button-product"  onclick={() => cart.addProduct(product)}>
                <div class="product-card">
                    <img src={product.photo_url} alt={product.product_name} class="product-image" />
                    <div class="product-info">
                        <h2 class="product-name">{product.product_name}</h2>
                        <p class="product-price">${product.price.toFixed(2)}</p>
                    </div>
                    
                </div>
            </button>

            {/each}
        {/if}
    </div>
    
</div>

<style>
    .products-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .product-card {
        border: 3px solid #342E2B;
        border-radius: 7px;
        padding: 0.7rem;
    }

    .product-image {
        width: 100%;
        height: 9rem;
        border-radius: 7px;
    }

    .product-info {
        text-align: center;
        margin-top: 10px;
        gap: 0.2rem;
    }

    .button-product {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    @media (max-width: 600px) {
        .products-container {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 12px;
            padding: 12px;
        }

        .product-image {
            height: 7rem;
        }

        .product-name {
            font-size: 0.95rem;
        }

        .product-price {
            font-size: 0.9rem;
        }
    }
</style>