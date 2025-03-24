import { supabase } from '../superbase.service';

export interface Cliente {
    id?: number; // Opcional para nuevos registros
    nombre: string;
    contacto: string;
}

// Helper function to transform Supabase response to Cliente interface
const transformClienteData = (data: any): Cliente => ({
    id: data.id,
    nombre: data.nombre,
    contacto: data.contacto,
});

// Obtener todos los registros de Clientes
export const fetchClientes = async (): Promise<Cliente[]> => {
    const { data, error } = await supabase
        .from('clientes') // Nombre de la tabla
        .select('*');

    if (error) {
        console.error('Error fetching Clientes:', error);
        throw error;
    }

    return data || [];
};

// Crear un nuevo registro de Cliente
export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select('*')
        .single();

    if (error) {
        console.error('Error creating Cliente:', error);
        throw error;
    }

    return transformClienteData(data);
};

// Actualizar un registro de Cliente
export const updateCliente = async (cliente: Cliente): Promise<Cliente> => {
    const { data, error } = await supabase
        .from('clientes')
        .update({
            nombre: cliente.nombre,
            contacto: cliente.contacto,
        })
        .eq('id', cliente.id)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating Cliente:', error);
        throw error;
    }

    return transformClienteData(data);
};

// Eliminar un registro de Cliente
export const deleteCliente = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting Cliente:', error);
        throw error;
    }
};