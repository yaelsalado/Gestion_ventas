import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { user } = await locals.safeGetSession();

    if (!user) {
        throw redirect(303, '/');
    }

    const { data: profile, error } = await locals.supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (error || !profile?.is_admin) {
        throw redirect(303, '/');
    }

    return {};
};