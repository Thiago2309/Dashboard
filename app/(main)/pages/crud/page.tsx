'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { fetchViajes, createViaje, updateViaje, deleteViaje, Viaje } from '../../../../Services/BD/viajeService';

const Crud = () => {
    let emptyViaje: Viaje = {
        id: null,
        id_cliente: null,
        fecha: '',
        folio_bco: '',
        folio: '',
        origen: '',
        destino: '',
        id_material: null,
        id_m3: null,
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

    useEffect(() => {
        fetchViajes().then(setViajes);
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
            viaje.CapHrsViajes !== null
        ) {
            try {
                if (viaje.id) {
                    const updatedViaje = await updateViaje(viaje);
                    setViajes(viajes.map(v => v.id === updatedViaje.id ? updatedViaje : v));
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Viaje Updated',
                        life: 3000
                    });
                } else {
                    const newViaje = await createViaje(viaje);
                    setViajes([...viajes, newViaje]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Viaje Created',
                        life: 3000
                    });
                }

                setViajeDialog(false);
                setViaje(emptyViaje);
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error saving viaje',
                    life: 3000
                });
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
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Viaje Deleted',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error deleting viaje',
                life: 3000
            });
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
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Viajes Deleted',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error deleting viajes',
                life: 3000
            });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
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

    const idClienteBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">ID Cliente</span>
                {rowData.id_cliente}
            </>
        );
    };

    const idMaterialBodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">ID Material</span>
                {rowData.id_material}
            </>
        );
    };

    const idM3BodyTemplate = (rowData: Viaje) => {
        return (
            <>
                <span className="p-column-title">ID M3</span>
                {rowData.id_m3}
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
            <h5 className="m-0">Manage Viajes</h5>
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

    return (
        <div className="grid crud-demo">
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
                        <Column field="folio_bco" header="Folio Banco" sortable body={folioBcoBodyTemplate}></Column>
                        <Column field="folio" header="Folio" sortable body={folioBodyTemplate}></Column>
                        <Column field="id_cliente" header="ID Cliente" sortable body={idClienteBodyTemplate}></Column>
                        <Column field="id_material" header="ID Material" sortable body={idMaterialBodyTemplate}></Column>
                        <Column field="id_m3" header="ID M3" sortable body={idM3BodyTemplate}></Column>
                        <Column field="CapHrsViajes" header="Cap. Hrs Viajes" sortable body={capHrsViajesBodyTemplate}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={viajeDialog} style={{ width: '450px' }} header="Viaje Details" modal className="p-fluid" footer={viajeDialogFooter} onHide={hideDialog}>
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
                            {submitted && !viaje.folio_bco && <small className="p-invalid">Folio Banco is required.</small>}
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
                            {submitted && !viaje.folio && <small className="p-invalid">Folio is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_cliente">ID Cliente</label>
                            <InputText
                                id="id_cliente"
                                value={viaje.id_cliente?.toString() || ''}
                                onChange={(e) => setViaje({ ...viaje, id_cliente: parseInt(e.target.value) || null })}
                                required
                                className={submitted && !viaje.id_cliente ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_cliente && <small className="p-invalid">ID Cliente is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_material">ID Material</label>
                            <InputText
                                id="id_material"
                                value={viaje.id_material?.toString() || ''}
                                onChange={(e) => setViaje({ ...viaje, id_material: parseInt(e.target.value) || null })}
                                required
                                className={submitted && !viaje.id_material ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_material && <small className="p-invalid">ID Material is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="id_m3">ID M3</label>
                            <InputText
                                id="id_m3"
                                value={viaje.id_m3?.toString() || ''}
                                onChange={(e) => setViaje({ ...viaje, id_m3: parseInt(e.target.value) || null })}
                                required
                                className={submitted && !viaje.id_m3 ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_m3 && <small className="p-invalid">ID M3 is required.</small>}
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
                            {submitted && !viaje.CapHrsViajes && <small className="p-invalid">Cap. Hrs Viajes is required.</small>}
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