import { supabase } from '../superbase.service';

export interface Material {
    Id?: number;
    nombre: string;
    descripcion?: string;
    created_at?: string;
}

export const fetchMateriales = async (): Promise<Material[]> => {
    const { data, error } = await supabase
        .from('material')  
        .select('*')
        .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createMaterial = async (material: Omit<Material, 'Id'>): Promise<Material> => {
    const { data, error } = await supabase
        .from('material')  
        .insert([{
            ...material,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateMaterial = async (material: Material): Promise<Material> => {
    const { data, error } = await supabase
        .from('material')  
        .update(material)
        .eq('Id', material.Id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteMaterial = async (Id: number): Promise<void> => {
    const { error } = await supabase
        .from('material')  
        .delete()
        .eq('Id', Id);

    if (error) throw error;
};