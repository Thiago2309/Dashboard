import { supabase } from '../superbase.service';
import { PostgrestError } from '@supabase/supabase-js';

export type TipoEntidad = 'Proveedor' | 'Cliente' | 'Colaborador';

export interface CuentaPorPagarBase {
    id?: number;
    id_entidad: number | null;
    tipo_entidad: TipoEntidad;
    nombre_colaborador?: string;
    id_compra: number | null;
    fecha: string;
    monto: number;
    saldo: number;
    estatus: 'Pendiente' | 'Pagado' | 'Cancelado';
}

export interface CuentaPorPagar extends CuentaPorPagarBase {
    metodo_pago?: string;
    referencia?: string;
    fecha_pago?: string | null;
    fecha_pago_esperado?: string | null;
    notas?: string;
    entidad_nombre?: string;
    adeudo?: number;
}

export interface ResumenEntidad {
    id_entidad: number;
    entidad_nombre: string;
    total_adeudado: number;
    total_monto_pagado: number;
    cuentas_pendientes: number;
    tipo: TipoEntidad;
}

export interface PagoCxP {
    id?: number;
    id_cuenta: number;
    monto: number;
    metodo_pago: string;
    referencia?: string;
    fecha?: string;
}

const transformCuentaData = (data: any): CuentaPorPagar => {
    const cuenta: CuentaPorPagar = {
        id: data.id,
        id_entidad: data.id_entidad,
        tipo_entidad: data.tipo_entidad,
        nombre_colaborador: data.nombre_colaborador,
        id_compra: data.id_compra,
        fecha: data.fecha,
        monto: data.monto || 0,
        saldo: data.saldo || 0,
        adeudo: (data.saldo || 0) - (data.monto || 0),
        estatus: data.estatus || 'Pendiente'
    };

    if (data.metodo_pago) cuenta.metodo_pago = data.metodo_pago;
    if (data.referencia) cuenta.referencia = data.referencia;
    if (data.fecha_pago) cuenta.fecha_pago = data.fecha_pago;
    if (data.fecha_pago_esperado) cuenta.fecha_pago_esperado = data.fecha_pago_esperado;
    if (data.notas) cuenta.notas = data.notas;
    
    cuenta.entidad_nombre = data.tipo_entidad === 'Colaborador' 
        ? data.nombre_colaborador 
        : data.proveedor?.nombre || data.cliente?.empresa || 'Desconocido';

    return cuenta;
};

export const fetchTodosProveedores = async (): Promise<{id: number, nombre: string}[]> => {
    const { data, error } = await supabase
        .from('proveedor')
        .select('id, nombre')
        .order('nombre', { ascending: true });

    if (error) throw error;
    
    // Mapear manualmente los resultados
    return data?.map(proveedor => ({
        id: proveedor.id,
        nombre: proveedor.nombre
    })) || [];
};

export const fetchEntidadesConCuentas = async (tipo?: TipoEntidad): Promise<ResumenEntidad[]> => {
    if (tipo === 'Colaborador') {
        const { data, error } = await supabase
            .from('cuentas_por_pagar')
            .select('id, nombre_colaborador, monto, saldo, estatus')
            .eq('tipo_entidad', 'Colaborador')
            .order('nombre_colaborador', { ascending: true });

        if (error) throw error;

        return data?.map(cuenta => ({
            id_entidad: cuenta.id,
            entidad_nombre: cuenta.nombre_colaborador || 'Colaborador sin nombre',
            total_adeudado: (cuenta.saldo || 0) - (cuenta.monto || 0),
            total_monto_pagado: cuenta.monto || 0,
            cuentas_pendientes: cuenta.estatus === 'Pendiente' ? 1 : 0,
            tipo: 'Colaborador'
        })) || [];
    }

    // Consulta para proveedores
    if (tipo === 'Proveedor' || !tipo) {
        const { data: proveedoresData, error: errorProveedores } = await supabase
            .from('proveedor')
            .select(`
                id,
                nombre,
                cuentas_por_pagar (
                    id,
                    monto,
                    saldo,
                    estatus
                )
            `)
            .eq('cuentas_por_pagar.tipo_entidad', 'Proveedor');

        if (errorProveedores) throw errorProveedores;

        const resumenProveedores = proveedoresData?.map(proveedor => ({
            id_entidad: proveedor.id,
            entidad_nombre: proveedor.nombre,
            total_adeudado: proveedor.cuentas_por_pagar?.reduce(
                (sum: number, cuenta: any) => sum + (cuenta.saldo - cuenta.monto), 0) || 0,
            total_monto_pagado: proveedor.cuentas_por_pagar?.reduce(
                (sum: number, cuenta: any) => sum + (cuenta.monto || 0), 0) || 0,
            cuentas_pendientes: proveedor.cuentas_por_pagar?.filter(
                (c: any) => c.estatus === 'Pendiente').length || 0,
            tipo: 'Proveedor' as TipoEntidad
        })) || [];

        if (tipo === 'Proveedor') return resumenProveedores;
    }

    // Consulta para clientes
    const { data: clientesData, error: errorClientes } = await supabase
        .from('clientes')
        .select(`
            id,
            empresa,
            cuentas_por_pagar (
                id,
                monto,
                saldo,
                estatus
            )
        `)
        .eq('cuentas_por_pagar.tipo_entidad', 'Cliente');

    if (errorClientes) throw errorClientes;

    const resumenClientes = clientesData?.map(cliente => ({
        id_entidad: cliente.id,
        entidad_nombre: cliente.empresa,
        total_adeudado: cliente.cuentas_por_pagar?.reduce(
            (sum: number, cuenta: any) => sum + (cuenta.saldo - cuenta.monto), 0) || 0,
        total_monto_pagado: cliente.cuentas_por_pagar?.reduce(
            (sum: number, cuenta: any) => sum + (cuenta.monto || 0), 0) || 0,
        cuentas_pendientes: cliente.cuentas_por_pagar?.filter(
            (c: any) => c.estatus === 'Pendiente').length || 0,
        tipo: 'Cliente' as TipoEntidad
    })) || [];

    return tipo === 'Cliente' ? resumenClientes : [
        ...(await fetchEntidadesConCuentas('Proveedor')),
        ...resumenClientes
    ];
};

export const fetchCuentasPorEntidad = async (tipo: TipoEntidad, id_entidad?: number): Promise<CuentaPorPagar[]> => {
    let query = supabase
        .from('cuentas_por_pagar')
        .select('*, proveedor:proveedor(nombre), cliente:clientes(empresa)');

    if (tipo === 'Colaborador') {
        query = query.eq('tipo_entidad', 'Colaborador');
    } else if (id_entidad) {
        query = query
            .eq('tipo_entidad', tipo)
            .eq('id_entidad', id_entidad);
    }

    const { data, error } = await query.order('fecha', { ascending: false });

    if (error) throw error;
    return data?.map(transformCuentaData) || [];
};

export const crearCuentaPorPagar = async (cuenta: Omit<CuentaPorPagar, 'id'>): Promise<CuentaPorPagar> => {
    const { data, error } = await supabase
        .from('cuentas_por_pagar')
        .insert([{
            id_entidad: cuenta.tipo_entidad === 'Colaborador' ? null : cuenta.id_entidad,
            tipo_entidad: cuenta.tipo_entidad,
            nombre_colaborador: cuenta.tipo_entidad === 'Colaborador' ? cuenta.nombre_colaborador : null,
            id_compra: cuenta.id_compra,
            fecha: cuenta.fecha,
            saldo: cuenta.saldo,
            monto: 0,
            estatus: 'Pendiente',
            notas: cuenta.notas,
            fecha_pago_esperado: cuenta.fecha_pago_esperado,
            metodo_pago: cuenta.tipo_entidad === 'Colaborador' ? 'Efectivo' : null
        }])
        .select('*')
        .single();

    if (error) throw error;
    return transformCuentaData(data);
};

export const registrarPagoCxP = async (
    id_cuenta: number,
    monto: number,
    metodo_pago: string = 'Efectivo',
    referencia?: string
): Promise<void> => {
    const { error: errorPago } = await supabase
        .from('pagos_cxp')
        .insert({
            id_cuenta,
            monto,
            metodo_pago,
            referencia
        });

    if (errorPago) throw errorPago;

    const { data: pagos, error: errorPagos } = await supabase
        .from('pagos_cxp')
        .select('monto')
        .eq('id_cuenta', id_cuenta);

    if (errorPagos) throw errorPagos;

    const totalAbonado = pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;

    const { data: cuenta, error: errorCuenta } = await supabase
        .from('cuentas_por_pagar')
        .select('saldo')
        .eq('id', id_cuenta)
        .single();

    if (errorCuenta) throw errorCuenta;

    const nuevoEstatus = totalAbonado >= cuenta.saldo ? 'Pagado' : 'Pendiente';

    const { error } = await supabase
        .from('cuentas_por_pagar')
        .update({
            monto: totalAbonado,
            estatus: nuevoEstatus,
            metodo_pago: metodo_pago,
            fecha_pago: nuevoEstatus === 'Pagado' ? new Date().toISOString() : null
        })
        .eq('id', id_cuenta);

    if (error) throw error;
};

export const actualizarFechaPagoEsperadoCxP = async (
    id_cuenta: number, 
    fecha: string | null
): Promise<void> => {
    const { error } = await supabase
        .from('cuentas_por_pagar')
        .update({ fecha_pago_esperado: fecha })
        .eq('id', id_cuenta);

    if (error) throw error;
};

export const fetchHistorialPagosCxP = async (id_cuenta: number): Promise<PagoCxP[]> => {
    const { data, error } = await supabase
        .from('pagos_cxp')
        .select('*')
        .eq('id_cuenta', id_cuenta)
        .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const actualizarPagoCxP = async (
    id_pago: number,
    nuevoMonto: number,
    metodo_pago: string
): Promise<void> => {
    const { error: errorPago } = await supabase
        .from('pagos_cxp')
        .update({ 
            monto: nuevoMonto,
            metodo_pago,
            fecha: new Date().toISOString()
        })
        .eq('id', id_pago);

    if (errorPago) throw errorPago;

    const { data: pago, error: errorGetPago } = await supabase
        .from('pagos_cxp')
        .select('id_cuenta')
        .eq('id', id_pago)
        .single();

    if (errorGetPago) throw errorGetPago;

    const { data: pagos, error: errorPagos } = await supabase
        .from('pagos_cxp')
        .select('monto')
        .eq('id_cuenta', pago.id_cuenta);

    if (errorPagos) throw errorPagos;

    const totalAbonado = pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;

    const { data: cuenta, error: errorCuenta } = await supabase
        .from('cuentas_por_pagar')
        .select('saldo')
        .eq('id', pago.id_cuenta)
        .single();

    if (errorCuenta) throw errorCuenta;

    const nuevoEstatus = totalAbonado >= cuenta.saldo ? 'Pagado' : 'Pendiente';

    const { error } = await supabase
        .from('cuentas_por_pagar')
        .update({
            monto: totalAbonado,
            estatus: nuevoEstatus,
            fecha_pago: nuevoEstatus === 'Pagado' ? new Date().toISOString() : null
        })
        .eq('id', pago.id_cuenta);

    if (error) throw error;
};