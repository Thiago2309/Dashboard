import { supabase } from '../superbase.service';

export interface PrecioOrigenDestino {
    id: number | null;
    nombreorigen: string;
    nombredestino: string;
    precio_unidad: number | null;
    created_at: Date;
}


export const fetchPrecioOrigenDestinoById = async (id: number) => {
    const { data, error } = await supabase
        .from('precio_origen_destino')
        .select('precio_unidad')
        .eq('id', id) // Asegúrate de que 'id' sea el nombre correcto de la columna
        .single();

    if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', error.details);
        console.error('Error message:', error.message);
        throw error;
    }

    return data;
};