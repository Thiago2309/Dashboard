import { supabase } from '../superbase.service';

export interface Gasto {
    id: number | null;
    id_viaje: number | null;
    fecha: string;
    id_proveedor: number | null;
    refaccion: string;
    importe: number | null;
    created_at: string;
    viaje_folio?: string;
    proveedor_nombre?: string;
}

// Helper function to transform Supabase response to Gasto interface
const transformGastoData = (data: any): Gasto => ({
    id: data.id,
    id_viaje: data.id_viaje,
    fecha: data.fecha,
    id_proveedor: data.id_proveedor,
    refaccion: data.refaccion,
    importe: data.importe,
    created_at: data.created_at,
    viaje_folio: data.viajes?.folio || '',
    proveedor_nombre: data.proveedores?.nombre || ''
});

export const fetchGastos = async (): Promise<Gasto[]> => {
    const { data, error } = await supabase
        .from('fetch_gastos')
        .select('*');

    if (error) {
        console.error('Error fetching gastos:', error);
        throw error;
    }

    return data || [];
};

export const createGasto = async (gasto: Omit<Gasto, 'id' | 'created_at' | 'viaje_folio' | 'proveedor_nombre'>): Promise<Gasto> => {
    const { data, error } = await supabase
        .from('gastos')
        .insert([gasto])
        .select(`
            id,
            id_viaje,
            fecha,
            id_proveedor,
            refaccion,
            importe,
            created_at,
            viajes:folio (viaje_folio),
            proveedores:nombre (proveedor_nombre)
        `)
        .single();

    if (error) {
        console.error('Error creating gasto:', error);
        throw error;
    }

    return transformGastoData(data);
};

export const updateGasto = async (gasto: Gasto): Promise<Gasto> => {
    const { data, error } = await supabase
        .from('gastos')
        .update({
            id_viaje: gasto.id_viaje,
            fecha: gasto.fecha,
            id_proveedor: gasto.id_proveedor,
            refaccion: gasto.refaccion,
            importe: gasto.importe
        })
        .eq('id', gasto.id)
        .select(`
            id,
            id_viaje,
            fecha,
            id_proveedor,
            refaccion,
            importe,
            created_at,
            viajes:folio (viaje_folio),
            proveedores:nombre (proveedor_nombre)
        `)
        .single();

    if (error) {
        console.error('Error updating gasto:', error);
        throw error;
    }

    return transformGastoData(data);
};

export const deleteGasto = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting gasto:', error);
        throw error;
    }
};

// New helper functions to fetch dropdown options
export const fetchViajes = async (): Promise<{ id: number; folio: string }[]> => {
    const { data, error } = await supabase.from('viajes').select('id, folio');
    if (error) throw error;
    return data || [];
};

export const fetchProveedores = async (): Promise<{ id: number; nombre: string }[]> => {
    const { data, error } = await supabase.from('proveedor').select('id, nombre');
    if (error) throw error;
    return data || [];
};