import { supabase } from '../../superbase.service';

export interface Prestamo {
  id?: number;
  id_operador: number;
  monto: number;
  saldo_pendiente: number;
  fecha_prestamo: string;
  descripcion?: string;
  tipo: string;
  tasa_interes: number;
  plazo_meses: number;
  estatus: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos relacionales
  operador_nombre?: string;
}

export const fetchPrestamos = async (estatus?: string): Promise<Prestamo[]> => {
  let query = supabase
    .from('prestamos')
    .select(`
      *,
      operador:id_operador(nombre)
    `)
    .order('fecha_prestamo', { ascending: false });

  if (estatus) {
    query = query.eq('estatus', estatus);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.map(item => ({
    ...item,
    operador_nombre: item.operador?.nombre
  })) || [];
};

export const fetchPrestamosActivos = async (): Promise<Prestamo[]> => {
  return fetchPrestamos('Pendiente');
};

export const createPrestamo = async (prestamo: Omit<Prestamo, 'id'>): Promise<Prestamo> => {
  const { data, error } = await supabase
    .from('prestamos')
    .insert([{
      ...prestamo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select(`
      *,
      operador:id_operador(nombre)
    `)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    operador_nombre: data.operador?.nombre
  };
};

export const updatePrestamo = async (prestamo: Prestamo): Promise<Prestamo> => {
  const { data, error } = await supabase
    .from('prestamos')
    .update({
      ...prestamo,
      updated_at: new Date().toISOString()
    })
    .eq('id', prestamo.id)
    .select(`
      *,
      operador:id_operador(nombre)
    `)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    operador_nombre: data.operador?.nombre
  };
};

export const aplicarPagoPrestamo = async (id: number, montoPago: number): Promise<void> => {
  const { data: prestamo, error: fetchError } = await supabase
    .from('prestamos')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const nuevoSaldo = prestamo.saldo_pendiente - montoPago;
  const nuevoEstatus = nuevoSaldo <= 0 ? 'Pagado' : prestamo.estatus;

  const { error: updateError } = await supabase
    .from('prestamos')
    .update({
      saldo_pendiente: Math.max(0, nuevoSaldo),
      estatus: nuevoEstatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (updateError) throw updateError;
};

export const deletePrestamo = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('prestamos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};