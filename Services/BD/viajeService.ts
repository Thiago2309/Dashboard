// viajeService.ts
import {supabase} from '../superbase.service';

export interface Viaje {
    id: number | null;
    id_cliente: number | null;
    fecha: string;
    folio_bco: string;
    folio: string;
    origen: string;
    destino: string;
    id_material: number | null;
    id_m3: number | null;
    CapHrsViajes: number | null;
    created_at: string;
}

export const fetchViajes = async (): Promise<Viaje[]> => {
    const { data, error } = await supabase
        .from('viajes')
        .select('*');

    if (error) {
        console.error('Error fetching viajes:', error);
        throw error;
    }

    return data || [];
};

export const createViaje = async (viaje: Omit<Viaje, 'id' | 'created_at'>): Promise<Viaje> => {
    const { data, error } = await supabase
        .from('Viajes')
        .insert([viaje])
        .single();

    if (error) {
        console.error('Error creating viaje:', error);
        throw error;
    }

    return data;
};

export const updateViaje = async (viaje: Viaje): Promise<Viaje> => {
    const { data, error } = await supabase
        .from('Viajes')
        .update(viaje)
        .eq('id', viaje.id)
        .single();

    if (error) {
        console.error('Error updating viaje:', error);
        throw error;
    }

    return data;
};

export const deleteViaje = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('Viajes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting viaje:', error);
        throw error;
    }
};