import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { CLIP_AUTH_TOKEN } from '$env/static/private';

export async function POST({ request }) {
	const body = await request.json();
	const pinpadRequestId = body.id;

	const statusResponse = await fetch(
		`https://api.payclip.io/f2f/pinpad/v1/payment?pinpadRequestId=${pinpadRequestId}`,
		{ headers: { Authorization: CLIP_AUTH_TOKEN } }
	);

	const statusData = await statusResponse.json();
	const nuevoEstado = statusData.status === 'COMPLETED' ? 'pagado' : 'fallido';

	await supabaseAdmin
		.from('sale')
		.update({ payment_status: nuevoEstado })
		.eq('id', statusData.reference);

	return json({ received: true });
}
