'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown'; // Import Dropdown
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useRef, useState } from 'react';
import { fetchViajes, createViaje, updateViaje, deleteViaje, Viaje, fetchClientes, fetchPreciosOrigenDestino, fetchMateriales, fetchM3, fetchOperadores } from '../../../../Services/BD/viajeService';
import { DataTableFilterMeta } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';

const Crud = () => {
    let emptyViaje: Viaje = {
        id_cliente: null,
        fecha: '',
        folio_bco: '',
        folio: '',
        id_precio_origen_destino: null,
        id_material: null,
        id_m3: null,
        caphrsviajes: null,
        id_operador: null,
        operador_nombre: '',
    };

    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [viajeDialog, setViajeDialog] = useState(false);
    const [deleteViajeDialog, setDeleteViajeDialog] = useState(false);
    const [deleteViajesDialog, setDeleteViajesDialog] = useState(false);
    const [viaje, setViaje] = useState<Viaje>(emptyViaje);
    const [selectedViajes, setSelectedViajes] = useState<Viaje[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
            global: { value: null, matchMode: 'contains' as const }
        });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // State for dropdown options
    const [clientes, setClientes] = useState<{ id: number; empresa: string }[]>([]);
    const [preciosOrigenDestino, setPreciosOrigenDestino] = useState<{ id: number; label: string; precio_unidad: number }[]>([]);
    const [m3Options, setM3Options] = useState<{ id: number; nombre: string; metros_cubicos: number }[]>([]);
    const [materiales, setMateriales] = useState<{ id: number; nombre: string }[]>([]);
    const [operadores, setOperadores] = useState<{id: number; nombre: string}[]>([]);

    // Función para calcular el total de horas de viaje
    const calcularTotalHorasViajes = (viajes: Viaje[]): number => {
        return viajes.reduce((total, item) => {
            const horas = item.caphrsviajes || 0; // Si horas_viaje es null, usa 0
            return total + horas;
        }, 0);
    };

    // Función para calcular el total de viajes
    const calcularTotalViajes = (viajes: Viaje[]): number => {
        return viajes.length;
    };

    // useEffect principal:
    useEffect(() => {
        fetchViajes().then(setViajes);
        fetchClientes().then(setClientes);
        fetchPreciosOrigenDestino().then(setPreciosOrigenDestino);
        fetchMateriales().then(setMateriales);
        fetchM3().then(setM3Options);
        fetchOperadores().then(setOperadores);
    }, []);

    useEffect(() => {
        const totalHoras = calcularTotalHorasViajes(viajes);
        const totalViajes = calcularTotalViajes(viajes);
        // Guardar los valores en el estado o mostrarlos directamente
    }, [viajes]);

    const openNew = () => {
        setViaje({
            ...emptyViaje,
            id: undefined, // Asegúrate de que no tenga un ID
        });
        setSubmitted(false);
        setViajeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setViajeDialog(false);
    };

    const hideDeleteViajeDialog = () => {
        setDeleteViajeDialog(false);
    };

    const hideDeleteViajesDialog = () => {
        setDeleteViajesDialog(false);
    };

    const saveViaje = async () => {
        setSubmitted(true);
    
        if (
            viaje.folio_bco.trim() &&
            viaje.folio.trim() &&
            viaje.id_cliente !== null &&
            viaje.id_material !== null &&
            viaje.id_m3 !== null &&
            viaje.id_precio_origen_destino !== null &&
            viaje.fecha
        ) {
            try {
                // Obtener el precio_unidad y metros_cubicos
                const precioOrigenDestino = preciosOrigenDestino.find(p => p.id === viaje.id_precio_origen_destino);
                const m3 = m3Options.find(m => m.id === viaje.id_m3);
    
                if (precioOrigenDestino && m3) {
                    const precio_unidad = precioOrigenDestino.precio_unidad;
                    const metros_cubicos = m3.metros_cubicos;
    
                    // Calcular caphrsviajes
                    const caphrsviajes = precio_unidad * metros_cubicos;
    
                    console.log('precio_unidad:', precio_unidad);
                    console.log('metros_cubicos:', metros_cubicos);
                    console.log('caphrsviajes:', caphrsviajes);
    
                    // Crear un objeto limpio solo con las columnas de la tabla viajes
                    const viajeLimpio = {
                        id_cliente: viaje.id_cliente,
                        fecha: viaje.fecha,
                        folio_bco: viaje.folio_bco,
                        folio: viaje.folio,
                        id_precio_origen_destino: viaje.id_precio_origen_destino,
                        id_material: viaje.id_material,
                        id_m3: viaje.id_m3,
                        caphrsviajes,
                        id_operador: viaje.id_operador
                    };
    
                    console.log('Objeto enviado a Supabase:', { ...viajeLimpio, id: viaje.id }); // Verifica que el id esté incluido
    
                    if (viaje.id) {
                        const updatedViaje = await updateViaje({ ...viajeLimpio, id: viaje.id });
                        setViajes(viajes.map(v => v.id === updatedViaje.id ? updatedViaje : v));
                        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viaje Actualizado', life: 3000 });
                    } else {
                        const newViaje = await createViaje(viajeLimpio);
                        setViajes([...viajes, newViaje]);
                        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viaje Creado', life: 3000 });
                    }
                    fetchViajes().then(setViajes); //MANDA A LLAMAR LA TABLA
                    setViajeDialog(false);
                    setViaje(emptyViaje);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error fetching precio_unidad or metros_cubicos', life: 3000 });
                }
            } catch (error) {
                console.error('Error saving viaje:', error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error saving viaje', life: 3000 });
            }
        }
    };
    

    const editViaje = (viaje: Viaje) => {
        setViaje({ ...viaje });
        setViajeDialog(true);
    };

    const confirmDeleteViaje = (viaje: Viaje) => {
        setViaje(viaje);
        setDeleteViajeDialog(true);
    };

    const deleteViajeConfirmado = async () => {
        try {
            await deleteViaje(viaje.id!);
            setViajes(viajes.filter(v => v.id !== viaje.id));
            setDeleteViajeDialog(false);
            setViaje(emptyViaje);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viaje Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting viaje', life: 3000 });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteViajesDialog(true);
    };

    const deleteSelectedViajes = async () => {
        try {
            await Promise.all(selectedViajes.map(v => deleteViaje(v.id!)));
            setViajes(viajes.filter(v => !selectedViajes.includes(v)));
            setDeleteViajesDialog(false);
            setSelectedViajes([]);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viajes Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting viajes', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="info" className="mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedViajes || !selectedViajes.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const IdBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const fechaBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Fecha</span>
                {rowData.fecha}
            </>
        );
    };

    const folioBcoBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Folio Banco</span>
                {rowData.folio_bco ?? '-'}
            </>
        );
    };

    const folioBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Folio</span>
                {rowData.folio ?? '-'}
            </>
        );
    };

    const clienteBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Cliente</span>
                {rowData.cliente_nombre}
            </>
        );
    };

    const operadorBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Operador</span>
                {rowData.operador_nombre ?? '-'}
            </>
        );
    };

    const origenBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Origen</span>
                {rowData.origen}
            </>
        );
    };

    const destinoBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Destino</span>
                {rowData.destino}
            </>
        );
    };

    const materialBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Material</span>
                {rowData.material_nombre}
            </>
        );
    };

    const m3BodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">M3</span>
                {rowData.m3_nombre}
            </>
        );
    };

    const caphrsviajesBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Cap. Hrs Viajes</span>
                ${' '}
                {rowData.caphrsviajes?.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) || '0.00'}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="info" className="mr-2" onClick={() => editViaje(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteViaje(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Viajes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) =>
                        setFilters({
                            ...filters,
                            global: { value: e.currentTarget.value, matchMode: 'contains' }
                        })
                    }
                    placeholder="Buscar..."
                />
            </span>
        </div>
    );

    const viajeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveViaje} />
        </>
    );
    const deleteViajeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteViajeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteViajeConfirmado} />
        </>
    );
    const deleteViajesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteViajesDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedViajes} />
        </>
    );

    return (
        <div className="grid crud-demo">
            {/* Mostrar el total de horas de viaje */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                    <div>
                        <span className="block text-500 font-medium mb-3">Sub Total</span>
                        <div className="text-900 font-medium text-xl">
                            $ {calcularTotalHorasViajes(viajes).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pesos
                        </div>
                    </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-clock text-black-500 text-xl" />
                        </div>
                    </div>Gestión de Notas de Viajes
                    <span className="text-500">Total sin IVA</span>
                </div>
            </div>

            {/* Mostrar el total de viajes */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total de Viajes</span>
                            <div className="text-900 font-medium text-xl">{calcularTotalViajes(viajes)}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-car text-black-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Total de viajes realizados</span>
                </div>
            </div>
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={viajes}
                        selection={selectedViajes}
                        onSelectionChange={(e) => setSelectedViajes(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} viajes"
                        filters={filters} // PARA EL DE BUSQUEDA
                        filterDisplay="menu"
                        emptyMessage="No viajes found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Id" sortable body={IdBodyTemplate} exportable={true}></Column>
                        <Column field="fecha" header="Fecha" sortable body={fechaBodyTemplate}></Column>
                        <Column field="folio_bco" header="Folio Banco" sortable body={folioBcoBodyTemplate}></Column>
                        <Column field="folio" header="Folio" sortable body={folioBodyTemplate}></Column>
                        <Column field="cliente_nombre" header="Cliente" sortable body={clienteBodyTemplate}></Column>
                        <Column field="operador_nombre" header="Operador" sortable body={operadorBodyTemplate}></Column>
                        <Column field="origen" header="Origen" sortable body={origenBodyTemplate}></Column>
                        <Column field="destino" header="Destino" sortable body={destinoBodyTemplate}></Column>
                        <Column field="material_nombre" header="Material" sortable body={materialBodyTemplate}></Column>
                        <Column field="m3_nombre" header="M3" sortable body={m3BodyTemplate}></Column>
                        <Column field="caphrsviajes" header="Precio" sortable body={caphrsviajesBodyTemplate} style={{ width: '150px', minWidth: '120px' }}></Column>
                        <Column header="Acción" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={viajeDialog} style={{ width: '550px' }} header="Viaje" modal className="p-fluid" footer={viajeDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="fecha">Fecha</label>
                            <Calendar
                                id="fecha"
                                value={
                                    viaje.fecha
                                        ? (() => {
                                            const [year, month, day] = viaje.fecha.split('-').map(Number);
                                            return new Date(year, month - 1, day);
                                        })()
                                        : null
                                }
                                onChange={(e) =>
                                    setViaje({
                                        ...viaje,
                                        fecha: e.value
                                            ? `${e.value.getFullYear()}-${String(e.value.getMonth() + 1).padStart(2, '0')}-${String(e.value.getDate()).padStart(2, '0')}`
                                            : ''
                                    })
                                }
                                dateFormat="yy-mm-dd"
                                showIcon
                                required
                                className={submitted && !viaje.fecha ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.fecha && <small className="p-invalid">Fecha es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="folio_bco">Folio Banco</label>
                            <InputText
                                id="folio_bco"
                                value={viaje.folio_bco}
                                onChange={(e) => setViaje({ ...viaje, folio_bco: e.target.value })}
                                required
                                autoFocus
                                className={submitted && !viaje.folio_bco ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.folio_bco && <small className="p-invalid">Folio Banco es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="folio">Folio</label>
                            <InputText
                                id="folio"
                                value={viaje.folio}
                                onChange={(e) => setViaje({ ...viaje, folio: e.target.value })}
                                required
                                className={submitted && !viaje.folio ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.folio && <small className="p-invalid">Folio es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_cliente">Cliente</label>
                            <Dropdown
                                id="id_cliente"
                                value={viaje.id_cliente}
                                options={clientes.map(c => ({ label: c.empresa, value: c.id }))}
                                onChange={(e) => setViaje({ ...viaje, id_cliente: e.value })}
                                placeholder="Selecciona un cliente"
                                required
                                className={submitted && !viaje.id_cliente ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_cliente && <small className="p-invalid">Cliente es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_precio_origen_destino">Origen - Destino</label>
                            <Dropdown
                                id="id_precio_origen_destino"
                                value={viaje.id_precio_origen_destino}
                                options={preciosOrigenDestino.map(p => ({
                                    label: `${p.label} - ($${p.precio_unidad?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00'})`,
                                    value: p.id,
                                    precio_unidad: p.precio_unidad
                                }))}
                                onChange={(e) => setViaje({ ...viaje, id_precio_origen_destino: e.value })}
                                placeholder="Selecciona un origen-destino"
                                required
                                className={submitted && !viaje.id_precio_origen_destino ? 'p-invalid' : ''}
                                itemTemplate={(option) => (
                                    <div>
                                        <span>{option.label}</span>
                                    </div>
                                )}
                            />
                            {submitted && !viaje.id_precio_origen_destino && <small className="p-invalid">Origen-Destino es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_material">Material</label>
                            <Dropdown
                                id="id_material"
                                value={viaje.id_material}
                                options={materiales.map(m => ({ label: m.nombre, value: m.id }))}
                                onChange={(e) => setViaje({ ...viaje, id_material: e.value })}
                                placeholder="Selecciona un material"
                                required
                                className={submitted && !viaje.id_material ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_material && <small className="p-invalid">Material es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_m3">M3</label>
                            <Dropdown
                                id="id_m3"
                                value={viaje.id_m3}
                                options={m3Options.map(m => ({ label: m.nombre, value: m.id }))}
                                onChange={(e) => setViaje({ ...viaje, id_m3: e.value })}
                                placeholder="Selecciona un M3"
                                required
                                className={submitted && !viaje.id_m3 ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_m3 && <small className="p-invalid">M3 es requerido.</small>}
                        </div>
                        <div className="operador">
                            <label htmlFor="id_operador">Operador</label>
                            <Dropdown
                                id="id_operador"
                                value={viaje.id_operador}
                                options={operadores.map(op => ({ label: op.nombre, value: op.id }))}
                                onChange={(e) => setViaje({ ...viaje, id_operador: e.value })}
                                placeholder="Selecciona un operador"
                                className={submitted && !viaje.id_operador ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_operador && <small className="p-invalid">Operador es requerido.</small>}
                        </div>
                        <div className="field">
                            {viaje.id && ( // Solo muestra el campo si viaje.id existe (modo update)
                                <>
                                    <label htmlFor="caphrsviajes">Cap. Hrs Viajes</label>
                                    <InputNumber
                                        id="caphrsviajes"
                                        value={viaje.caphrsviajes ?? null}
                                        onValueChange={(e) => setViaje({ ...viaje, caphrsviajes: e.value ?? null })}
                                        mode="decimal"
                                        minFractionDigits={0}   // mínimo de decimales
                                        maxFractionDigits={2}   // máximo de decimales permitidos
                                        required
                                        className={submitted && !viaje.caphrsviajes ? 'p-invalid' : ''}
                                    />
                                    {submitted && !viaje.caphrsviajes && <small className="p-invalid">Cap. Hrs Viajes es requerido.</small>}
                                </>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteViajeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteViajeDialogFooter} onHide={hideDeleteViajeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {viaje && (
                                <span>
                                    Estas seguro de Eliminar el Id <b>{viaje.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteViajesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteViajesDialogFooter} onHide={hideDeleteViajesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {viaje && <span>Estas seguro de Eliminar los seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;