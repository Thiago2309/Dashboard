import { supabase } from '../superbase.service';

export interface User {
    id: number | null;
    nombre: string;
    apellido: string;
    ciudad: string;
    sueldo: number;
}


export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Error perra: ', error.message);
        return null; 
    }

    return data.user;
};