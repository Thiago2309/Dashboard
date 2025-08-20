import { supabase } from '../superbase.service';

export interface Operador {
    id?: number;
    nombre: string;
    descripcion?: string;
    created_at?: string;
}

export const fetchOperadores = async (): Promise<Operador[]> => {
    const { data, error } = await supabase
        .from('operador')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createOperador = async (operador: Omit<Operador, 'id'>): Promise<Operador> => {
    const { data, error } = await supabase
        .from('operador')
        .insert([operador])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateOperador = async (operador: Operador): Promise<Operador> => {
    const { data, error } = await supabase
        .from('operador')
        .update(operador)
        .eq('id', operador.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteOperador = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('operador')
        .delete()
        .eq('id', id);

    if (error) throw error;
};