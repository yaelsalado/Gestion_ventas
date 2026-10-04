<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    interface Resumen {
        desde: string;
        hasta: string;
        total_cash: number;
        total_card: number;
        total_general: number;
        num_sales: number;
        ventas_pendientes: number;
    }

    interface Cierre {
        id: number;
        close_date: string;
        total_cash: number;
        total_card: number;
        total_general: number;
        num_sales: number;
    }

    interface DetalleItem {
        product_name: string;
        cantidad: number;
        subtotal: number;
    }

    let resumen = $state<Resumen | null>(null);
    let historial = $state<Cierre[]>([]);
    let cargando = $state(true);
    let cerrando = $state(false);
    let confirmando = $state(false);
    let error = $state('');
    let ultimoCierre = $state<Cierre | null>(null);
    let detalleAbiertoId = $state<number | null>(null);
    let cargandoDetalleId = $state<number | null>(null);
    let detallePorCierre = $state<Record<number, DetalleItem[]>>({});

    function formatMoney(n: number) {
        return `$${Number(n).toFixed(2)}`;
    }

    function formatFecha(f: string) {
        return new Date(f).toLocaleString('es-MX');
    }

    async function cargarResumen() {
        error = '';
        const { data, error: err } = await supabase.rpc('resumen_corte_actual');

        if (err) {
            console.error('Error al cargar resumen', err);
            error = 'No se pudo cargar el resumen del periodo actual.';
            return;
        }

        resumen = data?.[0] ?? null;
    }

    async function cargarHistorial() {
        const { data, error: err } = await supabase
            .from('sale_closing')
            .select('*')
            .order('close_date', { ascending: false })
            .limit(7);

        if (err) {
            console.error('Error al cargar historial', err);
            return;
        }

        historial = data ?? [];
    }

    async function toggleDetalleCierre(cierreId: number) {
        if (detalleAbiertoId === cierreId) {
            detalleAbiertoId = null;
            return;
        }

        detalleAbiertoId = cierreId;

        if (detallePorCierre[cierreId]) {
            return;
        }

        cargandoDetalleId = cierreId;

        const { data, error: err } = await supabase.rpc('detalle_corte', { p_closing_id: cierreId });

        if (err) {
            console.error('Error al cargar detalle del corte', err);
            error = 'No se pudo cargar el detalle de ese corte.';
            cargandoDetalleId = null;
            return;
        }

        detallePorCierre[cierreId] = data ?? [];
        cargandoDetalleId = null;
    }

    async function cerrarCaja() {
        confirmando = false;
        cerrando = true;
        error = '';

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error(userError);
            error = 'No se pudo identificar al usuario para hacer el corte.';
            cerrando = false;
            return;
        }

        const { data, error: err } = await supabase.rpc('cerrar_caja', { p_admin_id: user.id });

        if (err) {
            console.error('Error al cerrar caja', err);
            error = 'No se pudo cerrar la caja.';
            cerrando = false;
            return;
        }

        ultimoCierre = data?.[0] ?? null;
        cerrando = false;

        await cargarResumen();
        await cargarHistorial();
    }

    onMount(async () => {
        cargando = true;
        await Promise.all([cargarResumen(), cargarHistorial()]);
        cargando = false;
    });
</script>

<div class="admin-container">
    <h1>Corte de caja</h1>

    {#if cargando}
        <p class="info-text">Cargando...</p>
    {:else}
        {#if error}
            <p class="error-text">{error}</p>
        {/if}

        {#if resumen}
            <div class="card">
                <h2>Periodo actual</h2>
                <p class="periodo">Desde {formatFecha(resumen.desde)} hasta {formatFecha(resumen.hasta)}</p>

                {#if resumen.ventas_pendientes > 0}
                    <p class="warning-text">
                        Hay {resumen.ventas_pendientes} venta(s) con pago de tarjeta sin resolver.
                        Revísalas antes de cerrar caja, o no se contarán en este corte.
                    </p>
                {/if}

                <div class="totales-grid">
                    <div class="total-item">
                        <span class="total-label">Efectivo</span>
                        <span class="total-value">{formatMoney(resumen.total_cash)}</span>
                    </div>
                    <div class="total-item">
                        <span class="total-label">Tarjeta</span>
                        <span class="total-value">{formatMoney(resumen.total_card)}</span>
                    </div>
                    <div class="total-item destacado">
                        <span class="total-label">Total</span>
                        <span class="total-value">{formatMoney(resumen.total_general)}</span>
                    </div>
                    <div class="total-item">
                        <span class="total-label">Ventas</span>
                        <span class="total-value">{resumen.num_sales}</span>
                    </div>
                </div>

                <button class="cerrar-button" onclick={() => (confirmando = true)} disabled={cerrando || resumen.num_sales === 0}>
                    {cerrando ? 'Cerrando...' : 'Cerrar caja'}
                </button>
            </div>
        {/if}

        {#if ultimoCierre}
            <div class="card ticket">
                <h2>Último corte realizado</h2>
                <p class="periodo">{formatFecha(ultimoCierre.close_date)}</p>
                <p>Efectivo: {formatMoney(ultimoCierre.total_cash)}</p>
                <p>Tarjeta: {formatMoney(ultimoCierre.total_card)}</p>
                <p class="destacado-texto">Total: {formatMoney(ultimoCierre.total_general)}</p>
                <p>Ventas incluidas: {ultimoCierre.num_sales}</p>
            </div>
        {/if}

        <div class="card">
            <h2>Historial de cortes</h2>
            <p class="periodo">Haz clic en un corte para ver cuánto se vendió de cada producto.</p>
            {#if historial.length === 0}
                <p class="info-text">Todavía no hay cortes registrados.</p>
            {:else}
                <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Efectivo</th>
                            <th>Tarjeta</th>
                            <th>Total</th>
                            <th>Ventas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each historial as cierre (cierre.id)}
                            <tr class="fila-clickeable" onclick={() => toggleDetalleCierre(cierre.id)}>
                                <td>{formatFecha(cierre.close_date)}</td>
                                <td>{formatMoney(cierre.total_cash)}</td>
                                <td>{formatMoney(cierre.total_card)}</td>
                                <td>{formatMoney(cierre.total_general)}</td>
                                <td>{cierre.num_sales}</td>
                            </tr>
                            {#if detalleAbiertoId === cierre.id}
                                <tr>
                                    <td colspan="5">
                                        <div class="detalle-container">
                                            {#if cargandoDetalleId === cierre.id}
                                                <p class="info-text">Cargando detalle...</p>
                                            {:else if (detallePorCierre[cierre.id] ?? []).length === 0}
                                                <p class="info-text">No se vendió ningún producto en este corte.</p>
                                            {:else}
                                                <div class="table-scroll">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Producto</th>
                                                            <th>Cantidad</th>
                                                            <th>Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {#each detallePorCierre[cierre.id] as item (item.product_name)}
                                                            <tr>
                                                                <td>{item.product_name}</td>
                                                                <td>{item.cantidad}</td>
                                                                <td>{formatMoney(item.subtotal)}</td>
                                                            </tr>
                                                        {/each}
                                                    </tbody>
                                                </table>
                                                </div>
                                            {/if}
                                        </div>
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if confirmando}
    <div class="overlay" onclick={() => (confirmando = false)}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <p>¿Seguro que quieres cerrar la caja? Esta acción no se puede deshacer.</p>
            <div class="modal-actions">
                <button onclick={cerrarCaja}>Confirmar corte</button>
                <button onclick={() => (confirmando = false)}>Cancelar</button>
            </div>
        </div>
    </div>
{/if}

<style>
.admin-container {
    margin-top: 6rem;
    padding: 0 2rem 2rem;
    color: #ffffff;
}

h1 {
    margin-bottom: 1.5rem;
}

.card {
    background: #201C19;
    border: 3px solid #342E2B;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.card h2 {
    margin: 0 0 0.5rem 0;
}

.periodo {
    color: #9a8f8a;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.info-text {
    color: #9a8f8a;
}

.error-text {
    color: #e05d5d;
    margin-bottom: 1rem;
}

.warning-text {
    color: #F28C0F;
    background: #352F2C;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.totales-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.total-item {
    background: #352F2C;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.total-item.destacado {
    background: #40352a;
}

.total-label {
    font-size: 0.85rem;
    color: #9a8f8a;
}

.total-value {
    font-size: 1.3rem;
    font-weight: bolder;
    color: #F28C0F;
}

.cerrar-button {
    background-color: #F28C0F;
    color: #201C19;
    padding: 1rem 2rem;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-weight: bolder;
}

.cerrar-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.detalle-container {
    margin-top: 1.5rem;
    border-top: 1px solid #342E2B;
    padding-top: 1.5rem;
}

.ticket {
    border-color: #F28C0F;
}

.destacado-texto {
    font-weight: bolder;
    color: #F28C0F;
}

.table-scroll {
    width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 1px solid #342E2B;
}

th {
    color: #9a8f8a;
    font-size: 0.85rem;
}

.fila-clickeable {
    cursor: pointer;
}

.fila-clickeable:hover {
    background: #2a2421;
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #201C19;
    border: 3px solid #342E2B;
    padding: 2rem;
    border-radius: 12px;
    max-width: 30%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

.modal-actions button {
    background: #352F2C;
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .admin-container {
        margin-top: 5.2rem;
        padding: 0 1rem 1.5rem;
    }

    .totales-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .modal {
        max-width: 90vw;
    }

    table {
        min-width: 480px;
    }
}
</style>
