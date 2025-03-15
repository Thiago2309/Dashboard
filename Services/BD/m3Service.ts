import { supabase } from '../superbase.service';


export interface M3 {
    id: number | null;
    nombre: string;
    metros_cubicos: number | null;
    created_at: Date;
}


export const fetchMetrosCubicos = async (id: number) => {
    const { data, error } = await supabase
        .from('m3')
        .select('metros_cubicos')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', error.details);
        console.error('Error message:', error.message);
        throw error;
    }

    return data;
};