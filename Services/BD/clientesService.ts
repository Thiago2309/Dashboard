import { supabase } from '../superbase.service';

export interface Cliente {
    id?: number;
    empresa: string;
    contacto: string;
    telefono?: string;
    tipo_cliente?: 'Efectivo' | 'Facturado';
    rfc?: string;
    direccion?: string;
    metodo_pago?: 'Efectivo' | 'Transferencia';
    uso_cfdi?: string;
    regimen_fiscal?: string;
    obra?: string;
    estatus?: number; // 1 = Activo, 0 = Inactivo
}

// Helper function to transform Supabase response to Cliente interface
const transformClienteData = (data: any): Cliente => ({
    id: data.id,
    empresa: data.empresa,
    contacto: data.contacto,
    telefono: data.telefono || '-',
    tipo_cliente: data.tipo_cliente || '-',
    rfc: data.rfc || '-',
    direccion: data.direccion || '-',
    metodo_pago: data.metodo_pago || '-',
    uso_cfdi: data.uso_cfdi || '-',
    regimen_fiscal: data.regimen_fiscal || '-',
    obra: data.obra || '-',
    estatus: data.estatus ?? 1, // Default to 0 if not provided
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
            empresa: cliente.empresa,
            contacto: cliente.contacto,
            telefono: cliente.telefono,
            tipo_cliente: cliente.tipo_cliente,
            rfc: cliente.rfc,
            direccion: cliente.direccion,
            metodo_pago: cliente.metodo_pago,
            uso_cfdi: cliente.uso_cfdi,
            regimen_fiscal: cliente.regimen_fiscal,
            obra: cliente.obra,
            estatus: cliente.estatus
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