import { supabase } from '../superbase.service';

export interface Combustible {
    id?: number;
    id_viaje: number | null;
    fecha: string;
    id_operador: number | null;
    litros: number | null;
    importe: number | null;
    viaje_folio?: string;
    operador_nombre?: string;
}

// Helper function to transform Supabase response to Combustible interface
const transformCombustibleData = (data: any): Combustible => ({
    id: data.id,
    id_viaje: data.id_viaje,
    fecha: data.fecha,
    id_operador: data.id_operador,
    litros: data.litros,
    importe: data.importe,
    viaje_folio: data.viajes?.folio || '',
    operador_nombre: data.operadores?.nombre || ''
});

export const fetchCombustible = async (): Promise<Combustible[]> => {
    const { data, error } = await supabase
        .from('fetch_combustible')
        .select('*');

    if (error) {
        console.error('Error fetching combustibles:', error);
        throw error;
    }

    return data || [];
};

export const createCombustible = async (combustible: Omit<Combustible, 'id' | 'created_at' | 'viaje_folio' | 'operador_nombre'>): Promise<Combustible> => {
    console.log("Datos enviados a Supabase:", combustible);
    const { data, error } = await supabase
        .from('combustible')
        .insert([combustible])
        .select('*')
        .single();

    if (error) {
        console.error('Error creating combustible:', error);
        throw error;
    }

    return transformCombustibleData(data);
};

export const updateCombustible = async (combustible: Combustible): Promise<Combustible> => {
    const { data, error } = await supabase
        .from('combustible')
        .update({
            id_viaje: combustible.id_viaje,
            fecha: combustible.fecha,
            id_operador: combustible.id_operador,
            litros: combustible.litros,
            importe: combustible.importe
        })
        .eq('id', combustible.id)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating combustible:', error);
        throw error;
    }

    return transformCombustibleData(data);
};

export const deleteCombustible = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('combustible')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting combustible:', error);
        throw error;
    }
};

// New helper functions to fetch dropdown options
export const fetchViajes = async (): Promise<{ id: number; folio: string }[]> => {
    const { data, error } = await supabase.from('viajes').select('id, folio');
    if (error) throw error;
    return data || [];
};

export const fetchOperadores = async (): Promise<{ id: number; nombre: string }[]> => {
    const { data, error } = await supabase.from('operador').select('id, nombre');
    if (error) throw error;
    return data || [];
};