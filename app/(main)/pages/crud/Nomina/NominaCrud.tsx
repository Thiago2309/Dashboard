'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { fetchOperadores, Operador as Empleado } from '../../../../../Services/BD/operadoresService';
import { fetchPrestamosActivos, Prestamo } from '../../../../../Services/BD/Nomina/prestamosService';
import { fetchViajes, Viaje } from '../../../../../Services/BD/viajeService';
import { createNomina, Nomina, updateNomina, fetchNominasPorSemana } from '../../../../../Services/BD/Nomina/nominasService';
import { fetchBonosActivos } from '../../../../../Services/BD/Nomina/bonosService';
import * as XLSX from 'xlsx';
import { useCallback } from 'react';
import { ReciboNomina } from '../../../../../app/(main)/pages/crud/Nomina/reciboNomina';

const NominaModule = () => {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
    const [nominasCalculadas, setNominasCalculadas] = useState<any[]>([]);
    const [viajesSemana, setViajesSemana] = useState<Viaje[]>([]);
    const [cargando, setCargando] = useState(false);
    const [verificando, setVerificando] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showPagoDialog, setShowPagoDialog] = useState(false);
    const [nominaSeleccionada, setNominaSeleccionada] = useState<any>(null);
    const [metodoPago, setMetodoPago] = useState('');
    const [referenciaPago, setReferenciaPago] = useState('');
    const [nominaGuardada, setNominaGuardada] = useState(false);
    const [semanaActual, setSemanaActual] = useState<number>(0);
    const [anioActual, setAnioActual] = useState<number>(0);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const metodosPago = [
        { label: 'Efectivo', value: 'efectivo' },
        { label: 'Transferencia', value: 'transferencia' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Depósito', value: 'deposito' }
    ];

    const exportCSV = () => {
        dt.current?.exportCSV();
    };


    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        verificarNominaExistente();
    }, [fechaSeleccionada]);

    const getStartOfWeek = (date: Date) => {
        const day = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 4 = Jueves
        const diff = date.getDate() - day + (day < 4 ? -2 : 4); // Ajustar para que jueves sea el inicio
        const newDate = new Date(date);
        newDate.setDate(diff);
        return newDate;
    };

    const getEndOfWeek = (date: Date) => {
        const start = getStartOfWeek(new Date(date));
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // 7 días después del jueves = jueves
        return end;
    };

    const getWeekNumber = (date: Date) => {
        // Clonar fecha para no modificar la original
        const tempDate = new Date(date.valueOf());
        
        // Encontrar el jueves de esta semana
        const day = tempDate.getDay();
        const diff = tempDate.getDate() - day + (day < 4 ? -2 : 4);
        tempDate.setDate(diff);
        
        // Primer jueves del año
        const firstThursday = new Date(tempDate.getFullYear(), 0, 1);
        const firstDay = firstThursday.getDay();
        const firstDiff = firstThursday.getDate() - firstDay + (firstDay < 4 ? -2 : 4);
        firstThursday.setDate(firstDiff);
        
        // Calcular diferencia en semanas
        const diffTime = Math.abs(tempDate.getTime() - firstThursday.getTime());
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        
        return diffWeeks + 1;
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(fechaSeleccionada);
        newDate.setDate(newDate.getDate() - 7);
        setFechaSeleccionada(newDate);
        setShowResults(false);
        setNominaGuardada(false);
    };

    const goToNextWeek = () => {
        const newDate = new Date(fechaSeleccionada);
        newDate.setDate(newDate.getDate() + 7);
        setFechaSeleccionada(newDate);
        setShowResults(false);
        setNominaGuardada(false);
    };

    const cerrarResultados = () => {
        setShowResults(false);
        setNominasCalculadas([]);
        setViajesSemana([]);
    };

    const cargarDatos = async () => {
        try {
            const [empleadosData, prestamosData, viajesData] = await Promise.all([
                fetchOperadores(),
                fetchPrestamosActivos(),
                fetchViajes()
            ]);
            
            setEmpleados(empleadosData);
            setPrestamos(prestamosData);
            setViajes(viajesData);
            
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los datos',
                life: 3000
            });
        }
    };

    const verificarNominaExistente = async () => {
        setVerificando(true);
        try {
            const semana = getWeekNumber(fechaSeleccionada);
            const anio = fechaSeleccionada.getFullYear();
            
            setSemanaActual(semana);
            setAnioActual(anio);

            const nominasExistentes = await fetchNominasPorSemana(semana, anio);
            
            if (nominasExistentes.length > 0) {
                setNominasCalculadas(nominasExistentes);
                setShowResults(true);
                setNominaGuardada(true);
                
                toast.current?.show({
                    severity: 'info',
                    summary: 'Nómina encontrada',
                    detail: `Ya existe nómina guardada para la semana ${semana} del ${anio}`,
                    life: 3000
                });
            } else {
                setNominaGuardada(false);
            }
        } catch (error) {
            console.error('Error al verificar nómina:', error);
        } finally {
            setVerificando(false);
        }
    };

    // const calcularNomina = async () => {
    //     setCargando(true);
    //     try {
    //         const semana = getWeekNumber(fechaSeleccionada);
    //         const anio = fechaSeleccionada.getFullYear();
    //         const fechaInicio = getStartOfWeek(new Date(fechaSeleccionada));
    //         const fechaFin = getEndOfWeek(new Date(fechaSeleccionada));

    //         const fechaInicioStr = formatDate(fechaInicio);
    //         const fechaFinStr = formatDate(fechaFin);

    //         const todosViajesSemana = viajes.filter(viaje => {
    //             return viaje.fecha >= fechaInicioStr && viaje.fecha <= fechaFinStr;
    //         });
    //         setViajesSemana(todosViajesSemana);

    //         const nominas = empleados
    //             .filter(empleado => empleado.estatus)
    //             .map(empleado => {
    //                 const viajesEmpleado = viajes.filter(viaje => {
    //                     const perteneceAlOperador = viaje.operador_nombre === empleado.nombre;
    //                     const estaEnRango = viaje.fecha >= fechaInicioStr && viaje.fecha <= fechaFinStr;
    //                     return perteneceAlOperador && estaEnRango;
    //                 });

    //                 const totalViajes = viajesEmpleado.reduce((sum, viaje) => {
    //                     return sum + (viaje.caphrsviajes || 0);
    //                 }, 0);

    //                 const salarioBase = empleado.salario_base || 0;
                    
    //                 // Lógica de pago por alcance de meta
    //                 let pagoAlcanceMeta = 0;
    //                 let rebaso = false;
                    
    //                 if (totalViajes > 40000) {
    //                     // Pago del 10% sobre el total generado (47,850 * 0.1 = 4,785)
    //                     pagoAlcanceMeta = totalViajes * 0.1;
    //                     rebaso = true;
    //                 } else {
    //                     // Si no rebasa los 40K, se paga el 10% de 40K (4,000)
    //                     pagoAlcanceMeta = 4000;
    //                     rebaso = false;
    //                 }
                    
    //                 // Bono adicional (inicializado en 0, puedes editarlo después)
    //                 const bonoAdicional = 0;
                    
    //                 // Pago bruto =  Pago por alcance de meta + Bono adicional
    //                 const pagoBruto = pagoAlcanceMeta + bonoAdicional;
                    
    //                 const prestamosEmpleado = prestamos.filter(p => p.id_operador === empleado.id);
    //                 const totalPrestamos = prestamosEmpleado.reduce((sum, p) => sum + p.saldo_pendiente, 0);
                    
    //                 const pagoNeto = pagoBruto - totalPrestamos;

    //                 return {
    //                     id_operador: empleado.id,
    //                     empleado_nombre: empleado.nombre,
    //                     semana,
    //                     anio,
    //                     fecha_inicio: fechaInicioStr,
    //                     fecha_fin: fechaFinStr,
    //                     total_viajes: totalViajes,
    //                     cantidad_viajes: viajesEmpleado.length,
    //                     salario_base: salarioBase,
    //                     pago_alcance_meta: pagoAlcanceMeta, // Pago por alcanzar la meta
    //                     bono: bonoAdicional, // Bono que puedes agregar manualmente
    //                     pago_bruto: pagoBruto,
    //                     rebaso: rebaso,
    //                     prestamos: totalPrestamos,
    //                     pago_neto: pagoNeto > 0 ? pagoNeto : 0,
    //                     estatus: 'Pendiente',
    //                     viajes: viajesEmpleado
    //                 };
    //             });

    //         setNominasCalculadas(nominas);
    //         setShowResults(true);
    //         setNominaGuardada(false);
            
    //         toast.current?.show({
    //             severity: 'success',
    //             summary: 'Éxito',
    //             detail: 'Nómina calculada correctamente',
    //             life: 3000
    //         });
    //     } catch (error) {
    //         console.error('Error al calcular nómina:', error);
    //         toast.current?.show({
    //             severity: 'error',
    //             summary: 'Error',
    //             detail: 'No se pudo calcular la nómina',
    //             life: 3000
    //         });
    //     } finally {
    //         setCargando(false);
    //     }
    // };

    const calcularNomina = async () => {
        setCargando(true);
        try {
            const semana = getWeekNumber(fechaSeleccionada);
            const anio = fechaSeleccionada.getFullYear();
            const fechaInicio = getStartOfWeek(new Date(fechaSeleccionada));
            const fechaFin = getEndOfWeek(new Date(fechaSeleccionada));

            // Ajustar para que la fecha de fin sea el mismo día de la semana que inicio + 6 días (semana completa)
            const fechaInicioStr = formatDate(fechaInicio);
            const fechaFinAjustada = new Date(fechaInicio);
            fechaFinAjustada.setDate(fechaInicio.getDate() + 6); // 6 días después del inicio
            const fechaFinStr = formatDate(fechaFinAjustada);

            const todosViajesSemana = viajes.filter(viaje => {
                return viaje.fecha >= fechaInicioStr && viaje.fecha <= fechaFinStr;
            });
            setViajesSemana(todosViajesSemana);

            // Obtener bonos activos
            const bonosActivos = await fetchBonosActivos();
            // Obtener préstamos activos (Pendientes)
            const prestamosActivos = await fetchPrestamosActivos();

            const nominas = empleados
                .filter(empleado => empleado.estatus)
                .map(empleado => {
                    const viajesEmpleado = viajes.filter(viaje => {
                        const perteneceAlOperador = viaje.operador_nombre === empleado.nombre;
                        const estaEnRango = viaje.fecha >= fechaInicioStr && viaje.fecha <= fechaFinStr;
                        return perteneceAlOperador && estaEnRango;
                    });

                    const totalViajes = viajesEmpleado.reduce((sum, viaje) => {
                        return sum + (viaje.caphrsviajes || 0);
                    }, 0);

                    const salarioBase = empleado.salario_base || 0;
                    
                    // Lógica de pago por alcance de meta
                    let pagoAlcanceMeta = 0;
                    let rebaso = false;
                    
                    if (totalViajes > 40000) {
                        // Pago del 10% sobre el total generado (47,850 * 0.1 = 4,785)
                        pagoAlcanceMeta = totalViajes * 0.1;
                        rebaso = true;
                    } else {
                        // Si no rebasa los 40K, se paga el 10% de 40K (4,000)
                        pagoAlcanceMeta = salarioBase;
                        rebaso = false;
                    }
                    
                    // Calcular bonos del empleado (bonos activos)
                    const bonosEmpleado = bonosActivos.filter(bono => 
                        bono.id_operador === empleado.id
                    );
                    const totalBonos = bonosEmpleado.reduce((sum, bono) => sum + bono.monto, 0);
                    
                    // Pago bruto = Pago por alcance de meta + Bonos activos
                    const pagoBruto = pagoAlcanceMeta + totalBonos;
                    
                    // Calcular préstamos del empleado (solo préstamos pendientes)
                    const prestamosEmpleado = prestamosActivos.filter(p => p.id_operador === empleado.id);
                    const totalPrestamos = prestamosEmpleado.reduce((sum, p) => sum + p.saldo_pendiente, 0);
                    
                    const pagoNeto = pagoBruto - totalPrestamos;

                    return {
                        id_operador: empleado.id,
                        empleado_nombre: empleado.nombre,
                        semana,
                        anio,
                        fecha_inicio: fechaInicioStr,
                        fecha_fin: fechaFinStr,
                        total_viajes: totalViajes,
                        cantidad_viajes: viajesEmpleado.length,
                        salario_base: salarioBase,
                        pago_alcance_meta: pagoAlcanceMeta, // Pago por alcanzar la meta
                        bono: totalBonos, // Bonos activos del empleado
                        pago_bruto: pagoBruto,
                        rebaso: rebaso,
                        prestamos: totalPrestamos,
                        pago_neto: pagoNeto > 0 ? pagoNeto : 0,
                        estatus: 'Pendiente',
                        viajes: viajesEmpleado,
                    };
                });

            setNominasCalculadas(nominas);
            setShowResults(true);
            setNominaGuardada(false);
            
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Nómina calculada correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al calcular nómina:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo calcular la nómina',
                life: 3000
            });
        } finally {
            setCargando(false);
        }
    };

    const guardarNominas = async () => {
        try {
            await Promise.all(nominasCalculadas.map(nomina => createNomina(nomina)));
            
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Nóminas guardadas correctamente',
                life: 3000
            });
            
            setNominasCalculadas([]);
            setShowResults(false);
            setViajesSemana([]);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron guardar las nóminas',
                life: 3000
            });
        }
    };

    const abrirDialogoPago = (nomina: any) => {
        setNominaSeleccionada(nomina);
        setMetodoPago(nomina.metodo_pago || '');
        setReferenciaPago(nomina.referencia_pago || '');
        setShowPagoDialog(true);
    };

    const procesarPago = async () => {
        try {
            if (!metodoPago) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: 'Seleccione un método de pago',
                    life: 3000
                });
                return;
            }

            const nominasActualizadas = nominasCalculadas.map(n => 
                n.id_operador === nominaSeleccionada.id_operador ? 
                { 
                    ...n, 
                    estatus: 'Pagado', 
                    metodo_pago: metodoPago, 
                    referencia_pago: referenciaPago,
                    fecha_pago: new Date().toISOString().split('T')[0]
                } : n
            );

            setNominasCalculadas(nominasActualizadas);

            if (nominaSeleccionada.id) {
                const nominaActualizada = {
                    ...nominaSeleccionada,
                    estatus: 'Pagado',
                    metodo_pago: metodoPago,
                    referencia_pago: referenciaPago,
                    fecha_pago: new Date().toISOString().split('T')[0]
                };
                await updateNomina(nominaActualizada);
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Pago procesado para ${nominaSeleccionada.empleado_nombre}`,
                life: 3000
            });

            setShowPagoDialog(false);
            setNominaSeleccionada(null);
            
        } catch (error) {
            console.error('Error al procesar pago:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo procesar el pago',
                life: 3000
            });
        }
    };

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button 
                label="Verificar Nómina" 
                icon="pi pi-search" 
                loading={verificando}
                onClick={verificarNominaExistente}
                className="p-button-info"
                tooltip="Verificar si ya existe nómina para esta semana"
            />
            <Button 
                label="Calcular Nómina" 
                icon="pi pi-calculator" 
                loading={cargando}
                onClick={calcularNomina}
                className="p-button-success"
                disabled={nominaGuardada}
            />
            {showResults && !nominaGuardada && (
                <Button 
                    label="Guardar Nóminas" 
                    icon="pi pi-save" 
                    severity="help"
                    onClick={guardarNominas}
                    className="p-button-warning"
                />
            )}
            {nominaGuardada && (
                <Button 
                    label="Nómina Guardada" 
                    icon="pi pi-check" 
                    className="p-button-success"
                    disabled
                />
            )}
        </div>
    );

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button 
                    label="Exportar Excel" 
                    icon="pi pi-file-excel" 
                    severity="success" 
                    onClick={exportToExcel} 
                    className="ml-2"
                    tooltip="Exportar nómina completa con viajes a Excel"
                />
            </React.Fragment>
        );
    };

    const headerTemplate = () => (
        <div className="flex justify-content-between align-items-center">
            <span>
                Resultados de la Pre Nomina - Semana {semanaActual} del {anioActual}
                {nominaGuardada && <i className="pi pi-check-circle text-green-500 ml-2" style={{ fontSize: '1.2rem' }}></i>}
            </span>
            <Button 
                icon="pi pi-times" 
                className="p-button-text p-button-danger" 
                onClick={cerrarResultados}
                tooltip="Cerrar resultados"
            />
        </div>
    );

    const pagoBrutoBodyTemplate = (rowData: any) => {
        return formatCurrency(rowData.pago_bruto);
    };

    const pagoNetoBodyTemplate = (rowData: any) => {
        return (
            <span className={`font-bold ${rowData.pago_neto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(rowData.pago_neto)}
            </span>
        );
    };

    const viajesCountBodyTemplate = (rowData: any) => {
        return (
            <div>
                <div className="font-semibold">{rowData.cantidad_viajes} viajes</div>
                <div className="text-sm text-gray-600">{formatCurrency(rowData.total_viajes)} total</div>
            </div>
        );
    };

    const salarioBaseBodyTemplate = (rowData: any) => {
        return formatCurrency(rowData.salario_base);
    };

    // Exportacion de Excel con viajes incluidos
    const exportToExcel = () => {
        try {
            // Crear libro de Excel
            const wb = XLSX.utils.book_new();
            
            // Hoja 1: Datos de nómina (similar a lo que muestra el DataTable)
            const datosNomina = nominasCalculadas.map(nomina => ({
                'Empleado': nomina.empleado_nombre,
                'Estado': nomina.estatus,
                'Método Pago': nomina.metodo_pago || 'N/A',
                'Referencia': nomina.referencia_pago || 'N/A',
                'Viajes': nomina.cantidad_viajes,
                'Total Viajes': formatCurrency(nomina.total_viajes),
                'Salario Base': formatCurrency(nomina.salario_base),
                'Rebasó 40K': nomina.rebaso ? 'Sí' : 'No',
                'Bono': formatCurrency(nomina.bono),
                'Pago Bruto': formatCurrency(nomina.pago_bruto),
                'Préstamos': formatCurrency(nomina.prestamos),
                'Pago Neto': formatCurrency(nomina.pago_neto),
                'Semana': nomina.semana,
                'Año': nomina.anio
            }));
            
            const wsNomina = XLSX.utils.json_to_sheet(datosNomina);
            XLSX.utils.book_append_sheet(wb, wsNomina, 'Nómina');
            
            // Hoja 2: Viajes de los operadores (detallados)
            const datosViajes = [];
            
            // Recopilar viajes de cada operador en la nómina
            for (const nomina of nominasCalculadas) {
                if (nomina.viajes && nomina.viajes.length > 0) {
                    for (const viaje of nomina.viajes) {
                        datosViajes.push({
                            'Operador': nomina.empleado_nombre,
                            'ID Viaje': viaje.id,
                            'Fecha': viaje.fecha,
                            'Folio': viaje.folio,
                            'Folio BCO': viaje.folio_bco,
                            'Monto Viaje': formatCurrency(viaje.caphrsviajes || 0),
                            'Origen': viaje.origen,
                            'Destino': viaje.destino,
                            'Semana Nómina': nomina.semana
                        });
                    }
                }
            }
            
            // Si no hay viajes en los objetos de nómina, usar viajesSemana
            if (datosViajes.length === 0 && viajesSemana.length > 0) {
                for (const viaje of viajesSemana) {
                    datosViajes.push({
                        'Operador': viaje.operador_nombre,
                        'ID Viaje': viaje.id,
                        'Fecha': viaje.fecha,
                        'Folio': viaje.folio,
                        'Folio BCO': viaje.folio_bco,
                        'Monto Viaje': formatCurrency(viaje.caphrsviajes || 0),
                        'Origen': viaje.origen,
                        'Destino': viaje.destino,
                        'Semana Nómina': semanaActual
                    });
                }
            }
            
            if (datosViajes.length > 0) {
                const wsViajes = XLSX.utils.json_to_sheet(datosViajes);
                XLSX.utils.book_append_sheet(wb, wsViajes, 'Viajes');
            }
            
            // Generar nombre de archivo
            const fileName = `Nomina_Semana_${semanaActual}_${anioActual}.xlsx`;
            
            // Descargar archivo
            XLSX.writeFile(wb, fileName);
            
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo Excel exportado correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo exportar el archivo Excel',
                life: 3000
            });
        }
    };

    const estadoBodyTemplate = (rowData: any) => {
        return (
            <span className={`p-tag ${rowData.estatus === 'Pagado' ? 'p-tag-success' : 'p-tag-warning'}`}>
                {rowData.estatus}
                {rowData.estatus === 'Pagado' && <i className="pi pi-check ml-1"></i>}
            </span>
        );
    };

    const metodoPagoBodyTemplate = (rowData: any) => {
        if (!rowData.metodo_pago) return '-';
        
        const metodo = metodosPago.find(m => m.value === rowData.metodo_pago);
        return metodo ? metodo.label : rowData.metodo_pago;
    };

    const rebasoBodyTemplate = (rowData: any) => {
        // Asegurarse de manejar tanto boolean como string
        const rebasoValue = typeof rowData.rebaso === 'boolean' 
            ? rowData.rebaso 
            : rowData.rebaso === 'true';
        
        return rebasoValue ? 'Sí' : 'No';
    };

    const bonoBodyTemplate = (rowData: any) => {
        return rowData.bono !== undefined && rowData.bono !== null
            ? formatCurrency(rowData.bono)
            : '-';
    };

    const actionBodyTemplate = (rowData: any) => {
        const componentRef = useRef<HTMLDivElement>(null);
        
        const handlePrint = useReactToPrint({
            content: () => componentRef.current,
            documentTitle: `Recibo_Nomina_${rowData.empleado_nombre}_Semana_${rowData.semana}_${rowData.anio}`,
        });

        return (
            <div className="flex gap-1">
                <Button 
                    icon="pi pi-dollar" 
                    rounded 
                    severity="success"
                    tooltip="Procesar pago"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => abrirDialogoPago(rowData)}
                    disabled={rowData.estatus === 'Pagado' || !nominaGuardada}
                    className="p-button-sm"
                />
                <Button 
                    icon="pi pi-file-pdf" 
                    rounded 
                    severity="info"
                    tooltip="Generar recibo"
                    tooltipOptions={{ position: 'top' }}
                    onClick={handlePrint}
                    className="p-button-sm"
                    disabled={!rowData.empleado_nombre}
                />
                
                {/* Componente de recibo (oculto) */}
                <div style={{ display: 'none' }}>
                    <ReciboNomina ref={componentRef} nomina={rowData} />
                </div>
            </div>
        );
    };

    const footerPagoDialog = (
        <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowPagoDialog(false)} className="p-button-text" />
            <Button label="Procesar Pago" icon="pi pi-check" onClick={procesarPago} autoFocus />
        </div>
    );

    const fechaInicio = getStartOfWeek(new Date(fechaSeleccionada));
    const fechaFin = getEndOfWeek(new Date(fechaSeleccionada));

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Módulo de Nómina</h2>
                            <p className="text-gray-600 m-0">Calcula y gestiona los pagos semanales</p>
                        </div>
                        
                        <div className="flex align-items-center gap-2">
                            <Button 
                                icon="pi pi-chevron-left" 
                                onClick={goToPreviousWeek}
                                tooltip="Semana anterior"
                                tooltipOptions={{ position: 'top' }}
                            />
                            
                            <div className="text-center bg-gray-100 p-2 border-round">
                                <div className="font-semibold">
                                    {formatDateDisplay(fechaInicio)} - {formatDateDisplay(fechaFin)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Semana {getWeekNumber(fechaSeleccionada)} - {fechaSeleccionada.getFullYear()}
                                </div>
                            </div>
                            
                            <Button 
                                icon="pi pi-chevron-right" 
                                onClick={goToNextWeek}
                                tooltip="Semana siguiente"
                                tooltipOptions={{ position: 'top' }}
                            />
                        </div>
                    </div>

                    <Card title="Configuración de Nómina" className="mb-4">
                        <div className="p-fluid grid">
                            <div className="field col-12 md:col-12 flex items-end justify-content-end gap-2">
                                <Button 
                                    label="Verificar" 
                                    icon="pi pi-search" 
                                    loading={verificando}
                                    onClick={verificarNominaExistente}
                                    className="p-button-info w-full md:w-auto"
                                />
                                <Button 
                                    label="Calcular" 
                                    icon="pi pi-calculator" 
                                    loading={cargando}
                                    onClick={calcularNomina}
                                    className="p-button-success w-full md:w-auto"
                                    disabled={nominaGuardada}
                                />
                            </div>
                        </div>
                    </Card>

                    {showResults && nominasCalculadas.length > 0 && (
                        <>
                            <Card title={headerTemplate} className="mb-4">
                                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                                
                                <DataTable
                                    ref={dt}
                                    value={nominasCalculadas}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    className="datatable-responsive"
                                    emptyMessage="No se encontraron resultados"
                                >
                                    <Column field="empleado_nombre" header="Empleado" sortable />
                                    <Column field="estatus" header="Estado" body={estadoBodyTemplate} style={{ width: '150px', minWidth: '120px' }} />
                                    <Column field="metodo_pago" header="Método Pago" body={metodoPagoBodyTemplate} />
                                    <Column field="referencia_pago" header="Referencia" />
                                    <Column field="cantidad_viajes" header="Viajes" body={viajesCountBodyTemplate} />
                                    <Column field="salario_base" header="Salario Base" body={salarioBaseBodyTemplate} />
                                    <Column field="rebaso" header="Rebasó 40K" body={rebasoBodyTemplate} />
                                    <Column field="bono" header="Bono" body={bonoBodyTemplate} />
                                    <Column field="pago_bruto" header="Pago Bruto" body={pagoBrutoBodyTemplate} />
                                    <Column field="prestamos" header="Préstamos" body={(row) => formatCurrency(row.prestamos)} />
                                    <Column field="pago_neto" header="Pago Neto" body={pagoNetoBodyTemplate} />
                                    <Column header="Acciones" body={actionBodyTemplate} />
                                </DataTable>
                            </Card>

                            {viajesSemana.length > 0 && (
                                <Card title="Viajes de la Semana" className="mb-4">
                                    <DataTable
                                        value={viajesSemana}
                                        paginator
                                        rows={5}
                                        emptyMessage="No se encontraron viajes"
                                        className="p-datatable-sm"
                                    >
                                        <Column field="id" header="ID Viaje" />
                                        <Column field="operador_nombre" header="Operador" />
                                        <Column 
                                            field="fecha" 
                                            header="Fecha" 
                                            body={(row) => {
                                                if (!row.fecha) return '-';
                                                // Mostrar la fecha exactamente como viene, pero formateada a dd-mm-aaaa sin modificar la zona horaria
                                                const [year, month, day] = row.fecha.split('T')[0].split('-');
                                                return `${day}-${month}-${year}`;
                                            }} 
                                        />
                                        <Column field="folio" header="Folio" />
                                        <Column field="folio_bco" header="Folio BCO" />
                                        <Column field="caphrsviajes" header="Monto Viaje" body={(row) => formatCurrency(row.caphrsviajes || 0)} />
                                        <Column field="origen" header="Origen" />
                                        <Column field="destino" header="Destino" />
                                    </DataTable>
                                </Card>
                            )}
                        </>
                    )}

                    <Dialog 
                        visible={showPagoDialog} 
                        style={{ width: '500px' }} 
                        header="Procesar Pago" 
                        modal 
                        footer={footerPagoDialog}
                        onHide={() => setShowPagoDialog(false)}
                    >
                        {nominaSeleccionada && (
                            <div className="p-fluid">
                                <div className="field">
                                    <label>Empleado</label>
                                    <InputText value={nominaSeleccionada.empleado_nombre} readOnly />
                                </div>
                                <div className="field">
                                    <label>Monto a Pagar</label>
                                    <InputText value={formatCurrency(nominaSeleccionada.pago_neto)} readOnly />
                                </div>
                                <div className="field">
                                    <label>Método de Pago *</label>
                                    <Dropdown 
                                        value={metodoPago} 
                                        options={metodosPago} 
                                        onChange={(e) => setMetodoPago(e.value)} 
                                        placeholder="Seleccione método"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field">
                                    <label>Referencia/Comprobante</label>
                                    <InputText 
                                        value={referenciaPago} 
                                        onChange={(e) => setReferenciaPago(e.target.value)} 
                                        placeholder="Número de referencia"
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

function useReactToPrint({ content, documentTitle }: { content: () => any; documentTitle: string; }) {
    return useCallback(() => {
        const printContent = content();
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${documentTitle}</title>
                </head>
                <body>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }, [content, documentTitle]);
}

export default NominaModule;
