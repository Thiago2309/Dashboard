'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { fetchOrigenDestino, createOrigenDestino, updateOrigenDestino, deleteOrigenDestino, OrigenDestino } from '../../../../Services/BD/origenDestinoService';

const OrigenDestinoCrud = () => {
    let emptyOrigenDestino: OrigenDestino = {
        nombreorigen: '',
        nombredestino: '',
        precio_unidad: '',
    };

    const [origenDestinoList, setOrigenDestinoList] = useState<OrigenDestino[]>([]);
    const [origenDestinoDialog, setOrigenDestinoDialog] = useState(false);
    const [deleteOrigenDestinoDialog, setDeleteOrigenDestinoDialog] = useState(false);
    const [deleteOrigenDestinosDialog, setDeleteOrigenDestinosDialog] = useState(false);
    const [origenDestino, setOrigenDestino] = useState<OrigenDestino>(emptyOrigenDestino);
    const [selectedOrigenDestinos, setSelectedOrigenDestinos] = useState<OrigenDestino[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        fetchOrigenDestino().then(setOrigenDestinoList);
    }, []);

    const openNew = () => {
        setOrigenDestino(emptyOrigenDestino);
        setSubmitted(false);
        setOrigenDestinoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setOrigenDestinoDialog(false);
    };

    const hideDeleteOrigenDestinoDialog = () => {
        setDeleteOrigenDestinoDialog(false);
    };

    const hideDeleteOrigenDestinosDialog = () => {
        setDeleteOrigenDestinosDialog(false);
    };

    const saveOrigenDestino = async () => {
        setSubmitted(true);
    
        if (origenDestino.nombreorigen.trim() && origenDestino.nombredestino.trim() && origenDestino.precio_unidad.trim()) {
            try {
                if (origenDestino.id) {
                    const updatedOrigenDestino = await updateOrigenDestino(origenDestino);
                    setOrigenDestinoList(origenDestinoList.map(o => o.id === updatedOrigenDestino.id ? updatedOrigenDestino : o));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Origen Destino Updated', life: 3000 });
                } else {
                    const newOrigenDestino = await createOrigenDestino(origenDestino);
                    setOrigenDestinoList([...origenDestinoList, newOrigenDestino]);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Origen Destino Created', life: 3000 });
                }
                setOrigenDestinoDialog(false);
                setOrigenDestino(emptyOrigenDestino);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error saving Origen Destino', life: 3000 });
            }
        }
    };

    const editOrigenDestino = (origenDestino: OrigenDestino) => {
        setOrigenDestino({ ...origenDestino });
        setOrigenDestinoDialog(true);
    };

    const confirmDeleteOrigenDestino = (origenDestino: OrigenDestino) => {
        setOrigenDestino(origenDestino);
        setDeleteOrigenDestinoDialog(true);
    };

    const deleteOrigenDestinoConfirmado = async () => {
        try {
            await deleteOrigenDestino(origenDestino.id!);
            setOrigenDestinoList(origenDestinoList.filter(o => o.id !== origenDestino.id));
            setDeleteOrigenDestinoDialog(false);
            setOrigenDestino(emptyOrigenDestino);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Origen Destino Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting Origen Destino', life: 3000 });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteOrigenDestinosDialog(true);
    };

    const deleteSelectedOrigenDestinos = async () => {
        try {
            await Promise.all(selectedOrigenDestinos.map(o => deleteOrigenDestino(o.id!)));
            setOrigenDestinoList(origenDestinoList.filter(o => !selectedOrigenDestinos.includes(o)));
            setDeleteOrigenDestinosDialog(false);
            setSelectedOrigenDestinos([]);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Origen Destinos Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting Origen Destinos', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="info" className="mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedOrigenDestinos || !selectedOrigenDestinos.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: OrigenDestino) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const nombreorigenBodyTemplate = (rowData: OrigenDestino) => {
        return (
            <>
                <span className="p-column-title">Origen</span>
                {rowData.nombreorigen}
            </>
        );
    };

    const nombredestinoBodyTemplate = (rowData: OrigenDestino) => {
        return (
            <>
                <span className="p-column-title">Destino</span>
                {rowData.nombredestino}
            </>
        );
    };

    const precio_unidadBodyTemplate = (rowData: OrigenDestino) => {
        return (
            <>
                <span className="p-column-title">Precio Unidad</span>
                $ {rowData.precio_unidad}
            </>
        );
    };

    const actionBodyTemplate = (rowData: OrigenDestino) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="info" className="mr-2" onClick={() => editOrigenDestino(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteOrigenDestino(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Origen-Destino</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const origenDestinoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveOrigenDestino} />
        </>
    );

    const deleteOrigenDestinoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteOrigenDestinoDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteOrigenDestinoConfirmado} />
        </>
    );

    const deleteOrigenDestinosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteOrigenDestinosDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteSelectedOrigenDestinos} />
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
                        value={origenDestinoList}
                        selection={selectedOrigenDestinos}
                        onSelectionChange={(e) => setSelectedOrigenDestinos(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron registros."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Id" sortable body={idBodyTemplate}></Column>
                        <Column field="nombreorigen" header="Origen" sortable body={nombreorigenBodyTemplate}></Column>
                        <Column field="nombredestino" header="Destino" sortable body={nombredestinoBodyTemplate}></Column>
                        <Column field="precio_unidad" header="Precio Unidad" sortable body={precio_unidadBodyTemplate}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={origenDestinoDialog} style={{ width: '450px' }} header="Detalles de Origen-Destino" modal className="p-fluid" footer={origenDestinoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombreorigen">Origen</label>
                            <InputText
                                id="nombreorigen"
                                value={origenDestino.nombreorigen}
                                onChange={(e) => setOrigenDestino({ ...origenDestino, nombreorigen: e.target.value })}
                                required
                                className={submitted && !origenDestino.nombreorigen ? 'p-invalid' : ''}
                            />
                            {submitted && !origenDestino.nombreorigen && <small className="p-invalid">Origen es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nombredestino">Destino</label>
                            <InputText
                                id="nombredestino"
                                value={origenDestino.nombredestino}
                                onChange={(e) => setOrigenDestino({ ...origenDestino, nombredestino: e.target.value })}
                                required
                                className={submitted && !origenDestino.nombredestino ? 'p-invalid' : ''}
                            />
                            {submitted && !origenDestino.nombredestino && <small className="p-invalid">Destino es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="precio_unidad">Precio Unidad</label>
                            <InputText
                                id="precio_unidad"
                                value={origenDestino.precio_unidad} // Mantener como string
                                onChange={(e) => setOrigenDestino({ ...origenDestino, precio_unidad: e.target.value })}
                                required
                                className={submitted && !origenDestino.precio_unidad ? 'p-invalid' : ''}
                            />
                            {submitted && !origenDestino.precio_unidad && <small className="p-invalid">Precio es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteOrigenDestinoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteOrigenDestinoDialogFooter} onHide={hideDeleteOrigenDestinoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {origenDestino && (
                                <span>
                                    ¿Estás seguro de eliminar <b>{origenDestino.nombreorigen} - {origenDestino.nombredestino}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteOrigenDestinosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteOrigenDestinosDialogFooter} onHide={hideDeleteOrigenDestinosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {origenDestino && <span>¿Estás seguro de eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default OrigenDestinoCrud;