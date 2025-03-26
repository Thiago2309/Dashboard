'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente, Cliente } from '../../../../Services/BD/clientesService';

const ClientesCrud = () => {
    let emptyCliente: Cliente = {
        nombre: '',
        contacto: '',
    };

    const [clientesList, setClientesList] = useState<Cliente[]>([]);
    const [clienteDialog, setClienteDialog] = useState(false);
    const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
    const [deleteClientesDialog, setDeleteClientesDialog] = useState(false);
    const [cliente, setCliente] = useState<Cliente>(emptyCliente);
    const [selectedClientes, setSelectedClientes] = useState<Cliente[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        fetchClientes().then(setClientesList);
    }, []);

    const openNew = () => {
        setCliente(emptyCliente);
        setSubmitted(false);
        setClienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setClienteDialog(false);
    };

    const hideDeleteClienteDialog = () => {
        setDeleteClienteDialog(false);
    };

    const hideDeleteClientesDialog = () => {
        setDeleteClientesDialog(false);
    };

    const saveCliente = async () => {
        setSubmitted(true);
    
        if (cliente.nombre.trim() && cliente.contacto.trim()) {
            try {
                if (cliente.id) {
                    const updatedCliente = await updateCliente(cliente);
                    setClientesList(clientesList.map(c => c.id === updatedCliente.id ? updatedCliente : c));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cliente Updated', life: 3000 });
                } else {
                    const newCliente = await createCliente(cliente);
                    setClientesList([...clientesList, newCliente]);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cliente Created', life: 3000 });
                }
                setClienteDialog(false);
                setCliente(emptyCliente);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error saving Cliente', life: 3000 });
            }
        }
    };

    const editCliente = (cliente: Cliente) => {
        setCliente({ ...cliente });
        setClienteDialog(true);
    };

    const confirmDeleteCliente = (cliente: Cliente) => {
        setCliente(cliente);
        setDeleteClienteDialog(true);
    };

    const deleteClienteConfirmado = async () => {
        try {
            await deleteCliente(cliente.id!);
            setClientesList(clientesList.filter(c => c.id !== cliente.id));
            setDeleteClienteDialog(false);
            setCliente(emptyCliente);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Cliente Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting Cliente', life: 3000 });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteClientesDialog(true);
    };

    const deleteSelectedClientes = async () => {
        try {
            await Promise.all(selectedClientes.map(c => deleteCliente(c.id!)));
            setClientesList(clientesList.filter(c => !selectedClientes.includes(c)));
            setDeleteClientesDialog(false);
            setSelectedClientes([]);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Clientes Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error deleting Clientes', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="info" className="mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedClientes || !selectedClientes.length} />
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

    const idBodyTemplate = (rowData: Cliente) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const nombreBodyTemplate = (rowData: Cliente) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre}
            </>
        );
    };

    const contactoBodyTemplate = (rowData: Cliente) => {
        return (
            <>
                <span className="p-column-title">Contacto</span>
                {rowData.contacto}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Cliente) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="info" className="mr-2" onClick={() => editCliente(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteCliente(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Clientes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const clienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveCliente} />
        </>
    );

    const deleteClienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteClienteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteClienteConfirmado} />
        </>
    );

    const deleteClientesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteClientesDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteSelectedClientes} />
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
                        value={clientesList}
                        selection={selectedClientes}
                        onSelectionChange={(e) => setSelectedClientes(e.value)}
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
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate}></Column>
                        <Column field="contacto" header="Contacto" sortable body={contactoBodyTemplate}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={clienteDialog} style={{ width: '450px' }} header="Detalles de Cliente" modal className="p-fluid" footer={clienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText
                                id="nombre"
                                value={cliente.nombre}
                                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                required
                                className={submitted && !cliente.nombre ? 'p-invalid' : ''}
                            />
                            {submitted && !cliente.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="contacto">Contacto</label>
                            <InputText
                                id="contacto"
                                value={cliente.contacto}
                                onChange={(e) => setCliente({ ...cliente, contacto: e.target.value })}
                                required
                                className={submitted && !cliente.contacto ? 'p-invalid' : ''}
                            />
                            {submitted && !cliente.contacto && <small className="p-invalid">Contacto es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteClienteDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteClienteDialogFooter} onHide={hideDeleteClienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cliente && (
                                <span>
                                    ¿Estás seguro de eliminar <b>{cliente.nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteClientesDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteClientesDialogFooter} onHide={hideDeleteClientesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cliente && <span>¿Estás seguro de eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ClientesCrud;