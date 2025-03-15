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
import { fetchViajes, createViaje, updateViaje, deleteViaje, Viaje, fetchClientes, fetchPreciosOrigenDestino, fetchMateriales, fetchM3 } from '../../../../Services/BD/viajeService';
import { fetchPrecioOrigenDestinoById } from '../../../../Services/BD/precioOrigenDestinoService';
import { fetchMetrosCubicos } from '@/Services/BD/m3Service';

const Crud = () => {
    let emptyViaje: Viaje = {
        id: null,
        id_cliente: null,
        cliente_nombre: '',
        fecha: '',
        folio_bco: '',
        folio: '',
        origen: '',
        destino: '',
        id_precio_origen_destino: null,
        id_material: null,
        material_nombre: '',
        id_m3: null,
        m3_nombre: '',
        CapHrsViajes: null,
        created_at: ''
    };

    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [viajeDialog, setViajeDialog] = useState(false);
    const [deleteViajeDialog, setDeleteViajeDialog] = useState(false);
    const [deleteViajesDialog, setDeleteViajesDialog] = useState(false);
    const [viaje, setViaje] = useState<Viaje>(emptyViaje);
    const [selectedViajes, setSelectedViajes] = useState<Viaje[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // State for dropdown options
    const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([]);
    const [preciosOrigenDestino, setPreciosOrigenDestino] = useState<{ id: number; label: string; }[]>([]);
    const [materiales, setMateriales] = useState<{ id: number; nombre: string }[]>([]);
    const [m3Options, setM3Options] = useState<{ id: number; nombre: string }[]>([]);
    const [precioUnitario, setPrecioUnitario] = useState<number | null>(null);
    const [metrosCubicos, setMetrosCubicos] = useState<number | null>(null);

    useEffect(() => {
        fetchViajes().then(setViajes);
        fetchClientes().then(setClientes);
        fetchPreciosOrigenDestino().then(setPreciosOrigenDestino);
        fetchMateriales().then(setMateriales);
        fetchM3().then(setM3Options);
    }, []);

    const openNew = () => {
        setViaje(emptyViaje);
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
            viaje.CapHrsViajes !== null &&
            viaje.fecha
        ) {
            try {
                if (viaje.id) {
                    const updatedViaje = await updateViaje(viaje);
                    setViajes(viajes.map(v => v.id === updatedViaje.id ? updatedViaje : v));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viaje Updated', life: 3000 });
                } else {
                    const newViaje = await createViaje(viaje);
                    setViajes([...viajes, newViaje]);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Viaje Created', life: 3000 });
                }
                setViajeDialog(false);
                setViaje(emptyViaje);
            } catch (error) {
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
                    <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedViajes || !selectedViajes.length} />
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
                {rowData.folio_bco}
            </>
        );
    };

    const folioBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Folio</span>
                {rowData.folio}
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

    const capHrsViajesBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">Cap. Hrs Viajes</span>
                {rowData.CapHrsViajes}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editViaje(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteViaje(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0"></h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
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

    const handleOrigenDestinoChange = async (e: any) => {
        const idPrecioOrigenDestino = e.value;
        setViaje({ ...viaje, id_precio_origen_destino: idPrecioOrigenDestino });
    
        try {
            const precioData = await fetchPrecioOrigenDestinoById(idPrecioOrigenDestino);
            setPrecioUnitario(precioData.precio_unidad);
            console.log('Precio unitario:', precioData.precio_unidad);
        } catch (error) {
            console.error('Error fetching precio unitario:', error);
        }
    };

    const handleMaterialChange = async (e: any) => {
        const idM3 = e.value;
        setViaje({ ...viaje, id_m3: idM3 });
    
        try {
            const m3Data = await fetchMetrosCubicos(idM3);
            setMetrosCubicos(m3Data.metros_cubicos);
            console.log('Metros cúbicos:', m3Data.metros_cubicos);
        } catch (error) {
            console.error('Error fetching metros cúbicos:', error);
        }
    };
    
    const precioTotal = precioUnitario && metrosCubicos ? precioUnitario * metrosCubicos : null;

    return (
        <div className="grid crud-demo">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total de HrsViajes</span>
                            <div className="text-900 font-medium text-xl">$152</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-black-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">24 new </span>
                    <span className="text-500">since last visit</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total de Viajes</span>
                            <div className="text-900 font-medium text-xl">$152</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-black-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">24 new </span>
                    <span className="text-500">since last visit</span>
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
                        globalFilter={globalFilter}
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
                        <Column field="origen" header="Origen" sortable body={origenBodyTemplate}></Column>
                        <Column field="destino" header="Destino" sortable body={destinoBodyTemplate}></Column>
                        <Column field="material_nombre" header="Material" sortable body={materialBodyTemplate}></Column>
                        <Column field="m3_nombre" header="M3" sortable body={m3BodyTemplate}></Column>
                        <Column field="CapHrsViajes" header="Cap. Hrs Viajes" sortable body={capHrsViajesBodyTemplate}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={viajeDialog} style={{ width: '450px' }} header="Viaje Details" modal className="p-fluid" footer={viajeDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="fecha">Fecha</label>
                            <Calendar
                                id="fecha"
                                value={viaje.fecha ? new Date(viaje.fecha) : null} // Convert string to Date object
                                onChange={(e) => setViaje({ ...viaje, fecha: e.value ? e.value.toISOString().split('T')[0] : '' })} // Convert back to YYYY-MM-DD string
                                dateFormat="yy-mm-dd" // Format as YYYY-MM-DD
                                showIcon // Displays a calendar icon
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
                                options={clientes.map(c => ({ label: c.nombre, value: c.id }))}
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
                                options={preciosOrigenDestino.map(p => ({ label: p.label, value: p.id }))}
                                onChange={handleOrigenDestinoChange}
                                placeholder="Selecciona un origen-destino"
                                required
                                className={submitted && !viaje.id_precio_origen_destino ? 'p-invalid' : ''}
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
                                onChange={handleMaterialChange}
                                placeholder="Selecciona un M3"
                                required
                                className={submitted && !viaje.id_m3 ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_m3 && <small className="p-invalid">M3 es requerido.</small>}
                        </div>
                        <div>
                        <input type="hidden" value={precioUnitario || ''} />
                        </div>

                        <div className="field">
                            <label htmlFor="CapHrsViajes">Precio Total</label>
                            <InputText
                                id="precioTotal"
                                type="text"
                                value={precioTotal?.toString() || ''}
                                readOnly
                            />
                            {submitted && !viaje.CapHrsViajes && <small className="p-invalid">Cap. Hrs Viajes es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="CapHrsViajes">Cap. Hrs Viajes</label>
                            <InputText
                                id="CapHrsViajes"
                                value={viaje.CapHrsViajes?.toString() || ''}
                                onChange={(e) => setViaje({ ...viaje, CapHrsViajes: parseFloat(e.target.value) || null })}
                                required
                                className={submitted && !viaje.CapHrsViajes ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.CapHrsViajes && <small className="p-invalid">Cap. Hrs Viajes es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteViajeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteViajeDialogFooter} onHide={hideDeleteViajeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {viaje && (
                                <span>
                                    Are you sure you want to delete <b>{viaje.folio_bco}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteViajesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteViajesDialogFooter} onHide={hideDeleteViajesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {viaje && <span>Are you sure you want to delete the selected viajes?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
