import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { CLIP_AUTH_TOKEN } from '$env/static/private';

export async function POST({ request }) {
    const payload = await request.json();
    console.log('[clip webhook] payload recibido:', JSON.stringify(payload));
	const pinpadRequestId = payload.id;

	const statusResponse = await fetch(
        `https://api.payclip.io/f2f/pinpad/v1/payment?pinpadRequestId=${pinpadRequestId}`,
		{
            headers: {
                Authorization: `${CLIP_AUTH_TOKEN}`
            }
        }
	);

    if(!statusResponse.ok){
        const errBody = await statusResponse.text().catch(() => '');
        console.log('[clip webhook] consulta de status fallo:', statusResponse.status, errBody);
        return json({error: 'Error en consulta'}, {status: 500});
    }

    const payment=await statusResponse.json();
    console.log('[clip webhook] respuesta de status:', JSON.stringify(payment));

	const ESTADOS_FINALES: Record<string, 'pagada' | 'cancelada'> = {
        'APPROVED': 'pagada',
        'DECLINED': 'cancelada',
        'ERROR': 'cancelada',
        'EXPIRED': 'cancelada'
    };

    const newState = ESTADOS_FINALES[payment.status];

    if (!newState) {
        return json({ ok: true, ignored: true });
    }

    const { data, error } = await supabaseAdmin
        .from('sale')
        .update({ state: newState, payment_status: payload.status })
        .eq('pinpad_request_id', pinpadRequestId)
        .select();

        if (error){
            console.log('[clip webhook] error de update:', error.message);
            return json({error: error.message}, {status: 500})
        }
    console.log('[clip webhook] filas actualizadas:', data?.length ?? 0);
    return json({ ok: true });
}
