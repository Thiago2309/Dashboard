'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { 
  fetchMateriales, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial, 
  Material 
} from '../../../../Services/BD/materialService';
import { DataTableFilterMeta } from 'primereact/datatable';

const MaterialeCrud = () => {
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [materialDialog, setMaterialDialog] = useState(false);
    const [deleteMaterialDialog, setDeleteMaterialDialog] = useState(false);
    const [deleteMaterialesDialog, setDeleteMaterialesDialog] = useState(false);
    const [material, setMaterial] = useState<Material>({ 
      nombre: '', 
      descripcion: ''
    });
    const [selectedMateriales, setSelectedMateriales] = useState<Material[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: 'contains' as const }
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        fetchMateriales().then(setMateriales);
    }, []);

    const openNew = () => {
        setMaterial({ 
          nombre: '', 
          descripcion: ''
        });
        setSubmitted(false);
        setMaterialDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setMaterialDialog(false);
    };

    const hideDeleteMaterialDialog = () => {
        setDeleteMaterialDialog(false);
    };

    const hideDeleteMaterialesDialog = () => {
        setDeleteMaterialesDialog(false);
    };

    const saveMaterial = async () => {
        setSubmitted(true);

        if (material.nombre.trim()) {
            try {
                if (material.Id) {
                    const updatedMaterial = await updateMaterial(material);
                    setMateriales(materiales.map(m => m.Id === updatedMaterial.Id ? updatedMaterial : m));
                    if (toast.current) {
                        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Material actualizado', life: 3000 });
                    }
                } else {
                    const newMaterial = await createMaterial(material);
                    setMateriales([...materiales, newMaterial]);
                    if (toast.current) {
                        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Material creado', life: 3000 });
                    }
                }
                setMaterialDialog(false);
            } catch (error) {
                if (toast.current) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar material', life: 3000 });
                }
            }
        }
    };

    const editMaterial = (material: Material) => {
        setMaterial({ ...material });
        setMaterialDialog(true);
    };

    const confirmDeleteMaterial = (material: Material) => {
        setMaterial(material);
        setDeleteMaterialDialog(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteMaterialesDialog(true);
    };

    const deleteMaterialConfirmado = async () => {
        try {
            await deleteMaterial(material.Id!);
            setMateriales(materiales.filter(m => m.Id !== material.Id));
            setDeleteMaterialDialog(false);
            if (toast.current) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Material eliminado', life: 3000 });
            }
        } catch (error) {
            if (toast.current) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar material', life: 3000 });
            }
        }
    };

    const deleteSelectedMateriales = async () => {
        try {
            await Promise.all(selectedMateriales.map(m => deleteMaterial(m.Id!)));
            setMateriales(materiales.filter(m => !selectedMateriales.includes(m)));
            setDeleteMaterialesDialog(false);
            setSelectedMateriales([]);
            if (toast.current) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Materiales eliminados', life: 3000 });
            }
        } catch (error) {
            if (toast.current) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar materiales', life: 3000 });
            }
        }
    };

    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV();
        }
    };

    const nombreBodyTemplate = (rowData: Material) => {
        return <span>{rowData.nombre}</span>;
    };

    const descripcionBodyTemplate = (rowData: Material) => {
        return <span>{rowData.descripcion || '-'}</span>;
    };

    const fechaBodyTemplate = (rowData: Material) => {
        if (!rowData.created_at) return '-';
        
        const fecha = new Date(rowData.created_at);
        return <span>{fecha.toLocaleDateString('es-ES')}</span>;
    };

    const actionBodyTemplate = (rowData: Material) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => editMaterial(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteMaterial(rowData)} />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="info" className="mr-2" onClick={openNew} />
                <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} 
                    disabled={!selectedMateriales || selectedMateriales.length === 0} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={exportCSV} />
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Materiales</h5>
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

    const materialDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveMaterial} />
        </>
    );

    const deleteMaterialDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteMaterialDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteMaterialConfirmado} />
        </>
    );

    const deleteMaterialesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteMaterialesDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteSelectedMateriales} />
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
                        value={materiales}
                        selection={selectedMateriales}
                        onSelectionChange={(e) => setSelectedMateriales(e.value || [])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} materiales"
                        filters={filters}
                        filterDisplay="menu"
                        emptyMessage="No se encontraron materiales"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate}></Column>
                        <Column field="descripcion" header="Descripción" body={descripcionBodyTemplate}></Column>
                        <Column field="created_at" header="Fecha de Registro" sortable body={fechaBodyTemplate}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={materialDialog}
                        style={{ width: '500px' }}
                        header={material.Id ? 'Editar Material' : 'Nuevo Material'}
                        modal
                        className="p-fluid"
                        footer={materialDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="nombre">Nombre del material</label>
                            <InputText
                                id="nombre"
                                value={material.nombre}
                                onChange={(e) => setMaterial({ ...material, nombre: e.target.value })}
                                required
                                autoFocus
                                className={submitted && !material.nombre ? 'p-invalid' : ''}
                            />
                            {submitted && !material.nombre && (
                                <small className="p-invalid">Nombre es requerido.</small>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText
                                id="descripcion"
                                value={material.descripcion || ''}
                                onChange={(e) => setMaterial({ ...material, descripcion: e.target.value })}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteMaterialDialog}
                        style={{ width: '450px' }}
                        header="Confirmar"
                        modal
                        footer={deleteMaterialDialogFooter}
                        onHide={hideDeleteMaterialDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {material && (
                                <span>
                                    ¿Estás seguro de eliminar el material <b>{material.nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteMaterialesDialog}
                        style={{ width: '450px' }}
                        header="Confirmar"
                        modal
                        footer={deleteMaterialesDialogFooter}
                        onHide={hideDeleteMaterialesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {material && (
                                <span>
                                    ¿Estás seguro de eliminar los {selectedMateriales.length} materiales seleccionados?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default MaterialeCrud;