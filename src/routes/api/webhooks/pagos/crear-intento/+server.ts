import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase'; 
import { CLIP_AUTH_TOKEN, CLIP_TERMINAL_SERIAL } from '$env/static/private';

export async function POST({ request }) {
	const { sale_id } = await request.json();

	const { data: venta, error } = await supabaseAdmin
		.from('sale')
		.select('total')
		.eq('id', sale_id)
		.single();

	if (error || !venta) {
		return json({ error: 'Venta no encontrada' }, { status: 404 });
	}

	const clipResponse = await fetch('https://api.payclip.io/f2f/pinpad/v1/payment', {
		method: 'POST',
		headers: {
			Authorization: CLIP_AUTH_TOKEN,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			amount: venta.total.toFixed(2),
			reference: sale_id, 
			serial_number_pos: CLIP_TERMINAL_SERIAL,
			webhook_url: 'https://jasmine-woozy-zoologist.ngrok-free.dev'
		})
	});

	if (!clipResponse.ok) {
		return json({ error: 'No se pudo conectar con la terminal' }, { status: 502 });
	}

	const clipData = await clipResponse.json();

	await supabaseAdmin
		.from('sale')
		.update({
			payment_status: 'pendiente_tarjeta',
			pinpad_request_id: clipData.pinpad_request_id
		})
		.eq('id', sale_id);

	return json({ pinpad_request_id: clipData.pinpad_request_id });
}
