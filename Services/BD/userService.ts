import { supabase } from '../superbase.service';

export interface User {
    id: number | null;
    auth_id: string | null;
    nombre: string;
    apellido: string;
    ciudad: string;
    sueldo: number;
    email: string;
}

export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? null : data.user;
};
//elfokingregister
export const register = async (email: string, password: string, userData: Omit<User, 'id' | 'auth_id' | 'email'>) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    
    if (authError || !authData.user) {
        console.error('Error en registro:', authError?.message);
        return null;
    }

    const { data: userDataResponse, error: userError } = await supabase
        .from('user')
        .insert([{ 
            auth_id: authData.user.id,
            email,
            ...userData
        }])
        .single();

    return userError ? null : userDataResponse;
};

export const fetchUserData = async (authId: string) => {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('auth_id', authId)
        .single();

    return error ? null : data;
};