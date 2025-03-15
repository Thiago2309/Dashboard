import { supabase } from '../superbase.service';

export interface Viaje {
    id: number | null;
    id_cliente: number | null;
    cliente_nombre: string;
    fecha: string;
    folio_bco: string;
    folio: string;
    origen: string;
    destino: string;
    id_precio_origen_destino: number | null;
    id_material: number | null;
    material_nombre: string;
    id_m3: number | null;
    m3_nombre: string;
    CapHrsViajes: number | null;
    created_at: string;
}

// Helper function to transform Supabase response to Viaje interface
const transformViajeData = (data: any): Viaje => ({
    id: data.id,
    id_cliente: data.id_cliente,
    cliente_nombre: data.clientes?.cliente_nombre || '',
    fecha: data.fecha,
    folio_bco: data.folio_bco,
    folio: data.folio,
    origen: data.precio_origen_destino?.origen || '',
    destino: data.precio_origen_destino?.destino || '',
    id_precio_origen_destino: data.id_precio_origen_destino,
    id_material: data.id_material,
    material_nombre: data.material?.material_nombre || '',
    id_m3: data.id_m3,
    m3_nombre: data.m3?.m3_nombre || '',
    CapHrsViajes: data.CapHrsViajes,
    created_at: data.created_at
});

export const fetchViajes = async (): Promise<Viaje[]> => {
    const { data, error } = await supabase
        .from('fetch_viajes')
        .select('*');

    if (error) {
        console.error('Error fetching viajes:', error);
        throw error;
    }

    return data || [];
};

export const createViaje = async (viaje: Omit<Viaje, 'id' | 'created_at' | 'cliente_nombre' | 'material_nombre' | 'm3_nombre' | 'origen' | 'destino'>): Promise<Viaje> => {
    const { data, error } = await supabase
        .from('viajes')
        .insert([viaje])
        .select(`
            id,
            id_cliente,
            fecha,
            folio_bco,
            folio,
            id_precio_origen_destino,
            id_material,
            id_m3,
            CapHrsViajes,
            created_at,
            clientes:nombre (cliente_nombre),
            material:nombre (material_nombre),
            m3:nombre (m3_nombre),
            precio_origen_destino (origen:NombreOrigen, destino:NombreDestino)
        `)
        .single();

    if (error) {
        console.error('Error creating viaje:', error);
        throw error;
    }

    return transformViajeData(data);
};

export const updateViaje = async (viaje: Viaje): Promise<Viaje> => {
    const { data, error } = await supabase
        .from('viajes')
        .update({
            id_cliente: viaje.id_cliente,
            fecha: viaje.fecha,
            folio_bco: viaje.folio_bco,
            folio: viaje.folio,
            id_precio_origen_destino: viaje.id_precio_origen_destino,
            id_material: viaje.id_material,
            id_m3: viaje.id_m3,
            CapHrsViajes: viaje.CapHrsViajes
        })
        .eq('id', viaje.id)
        .select(`
            id,
            id_cliente,
            fecha,
            folio_bco,
            folio,
            id_precio_origen_destino,
            id_material,
            id_m3,
            CapHrsViajes,
            created_at,
            clientes:nombre (cliente_nombre),
            material:nombre (material_nombre),
            m3:nombre (m3_nombre),
            precio_origen_destino (origen:NombreOrigen, destino:NombreDestino)
        `)
        .single();

    if (error) {
        console.error('Error updating viaje:', error);
        throw error;
    }

    return transformViajeData(data);
};

export const deleteViaje = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('viajes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting viaje:', error);
        throw error;
    }
};

// New helper functions to fetch dropdown options
export const fetchClientes = async (): Promise<{ id: number; nombre: string }[]> => {
    const { data, error } = await supabase.from('clientes').select('id, nombre');
    if (error) throw error;
    return data || [];
};

export const fetchPreciosOrigenDestino = async (): Promise<{ id: number; label: string; precio_unidad:number }[]> => {
    const { data, error } = await supabase.from('precio_origen_destino').select('id, nombreorigen, nombredestino, precio_unidad');
    if (error) throw error;
    return data?.map(item => ({
        id: item.id,
        label: `${item.nombreorigen} - ${item.nombredestino}`,
        precio_unidad: item.precio_unidad
    })) || [];
};

export const fetchMateriales = async (): Promise<{ id: number; nombre: string }[]> => {
    const { data, error } = await supabase.from('material').select('id, nombre');
    if (error) throw error;
    return data || [];
};

export const fetchM3 = async (): Promise<{ id: number; nombre: string; metros_cubicos: number}[]> => {
    const { data, error } = await supabase.from('m3').select('id, nombre, metros_cubicos');
    if (error) throw error;
    return data || [];
};