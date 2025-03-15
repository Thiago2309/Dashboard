'use client';
import { useState, useEffect, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { fetchViajes, fetchProveedores, createGasto, Gasto } from '../../../../Services/BD/gastoService';
import { TabPanel, TabView } from 'primereact/tabview';
import { fetchCombustible, createCombustible, updateCombustible, deleteCombustible, fetchOperadores, Combustible } from '../../../../Services/BD/combustibleService';

export default function GestionAreas() {
  return (
    <div>
      {/* Formulario de Viajes */}
      <div className="card crud-demo p-4 mb-4">
        <h2>Gestión de Notas de Viajes</h2>
        <FormularioNotaViaje />
      </div>

      {/* Formulario de Gastos */}
      <div className="card crud-demo p-4 mb-4">
        <h2>Gestión de Gastos</h2>
        <FormularioGastos />
      </div>

      {/* Formulario de Combustible */}
      <div className="card crud-demo p-4 mb-4">
        <h2>Gestión de Combustible</h2>
        <FormularioCombustible />
      </div>

      {/* Formulario de Clientes */}
      <div className="card crud-demo p-4 mb-4">
        <h2>Gestión de Clientes</h2>
        <FormularioClientes />
      </div>
    </div>
  );
}

// Componente del Formulario de Nota de Viaje
const FormularioNotaViaje = () => {
  return (
    <div className="card p-4">
      <TabView>
        <TabPanel header="Datos Generales">
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="fecha">Fecha</label>
              <Calendar id="fecha" dateFormat="yy-mm-dd" showIcon />
            </div>
            <div className="field">
              <label htmlFor="folio">Folio</label>
              <InputText id="folio" />
            </div>
            <div className="field">
              <label htmlFor="id_cliente">Cliente</label>
              <Dropdown id="id_cliente" options={[]} placeholder="Selecciona un cliente" />
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Detalles del Viaje">
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="origenDestino">Origen - Destino</label>
              <Dropdown id="origenDestino" options={[]} placeholder="Selecciona un destino" />
            </div>
            <div className="field">
              <label htmlFor="material">Material</label>
              <Dropdown id="material" options={[]} placeholder="Selecciona un material" />
            </div>
            {/* <div className="field">
              <label htmlFor="caphrsviajes">Cap. Hrs Viajes</label>
              <InputText id="caphrsviajes" />
            </div> */}
          </div>
        </TabPanel>
      </TabView>
      <div className="flex justify-content-end mt-4">
        <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" />
        {/* <Button label="Cancelar" icon="pi pi-times" className="p-button-secondary" /> */}
      </div>
    </div>
  );
};

// Componente del Formulario de Gastos
const FormularioGastos = () => {
  const [gasto, setGasto] = useState<Gasto>({
      id_viaje: null,
      fecha: '',
      id_proveedor: null,
      refaccion: '',
      importe: null,
  });
  const [viajes, setViajes] = useState<{ id: number; folio: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);

  // Cargar datos iniciales (viajes y proveedores)
  useEffect(() => {
      fetchViajes().then(setViajes);
      fetchProveedores().then(setProveedores);
  }, []);

  // Guardar un gasto
  const saveGasto = async () => {
      setSubmitted(true);

      if (
          gasto.id_viaje !== null &&
          gasto.fecha &&
          gasto.id_proveedor !== null &&
          gasto.refaccion.trim() &&
          gasto.importe !== null
      ) {
          try {
              await createGasto(gasto);
              toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Gasto guardado', life: 3000 });
              setGasto({
                  id_viaje: null,
                  fecha: '',
                  id_proveedor: null,
                  refaccion: '',
                  importe: null,
              });
              setSubmitted(false);
          } catch (error) {
              toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el gasto', life: 3000 });
          }
      }
  };

  return (
      <div className="card p-4">
          <Toast ref={toast} />
          <TabView>
              <TabPanel header="Datos de Gastos">
                  <div className="p-fluid">
                      <div className="field">
                          <label htmlFor="fecha">Fecha</label>
                          <Calendar
                              id="fecha"
                              value={gasto.fecha ? new Date(gasto.fecha) : null}
                              onChange={(e) => setGasto({ ...gasto, fecha: e.value ? e.value.toISOString().split('T')[0] : '' })}
                              dateFormat="yy-mm-dd"
                              showIcon
                              required
                              className={submitted && !gasto.fecha ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.fecha && <small className="p-invalid">Fecha es requerida.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_viaje">Viaje</label>
                          <Dropdown
                              id="id_viaje"
                              value={gasto.id_viaje}
                              options={viajes.map(v => ({ label: v.folio, value: v.id }))}
                              onChange={(e) => setGasto({ ...gasto, id_viaje: e.value })}
                              placeholder="Selecciona un viaje"
                              required
                              className={submitted && !gasto.id_viaje ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.id_viaje && <small className="p-invalid">Viaje es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_proveedor">Proveedor</label>
                          <Dropdown
                              id="id_proveedor"
                              value={gasto.id_proveedor}
                              options={proveedores.map(p => ({ label: p.nombre, value: p.id }))}
                              onChange={(e) => setGasto({ ...gasto, id_proveedor: e.value })}
                              placeholder="Selecciona un proveedor"
                              required
                              className={submitted && !gasto.id_proveedor ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.id_proveedor && <small className="p-invalid">Proveedor es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="refaccion">Refacción</label>
                          <InputText
                              id="refaccion"
                              value={gasto.refaccion}
                              onChange={(e) => setGasto({ ...gasto, refaccion: e.target.value })}
                              required
                              className={submitted && !gasto.refaccion ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.refaccion && <small className="p-invalid">Refacción es requerida.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="importe">Importe</label>
                          <InputText
                              id="importe"
                              value={gasto.importe?.toString() || ''}
                              onChange={(e) => setGasto({ ...gasto, importe: parseFloat(e.target.value) || null })}
                              required
                              className={submitted && !gasto.importe ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.importe && <small className="p-invalid">Importe es requerido.</small>}
                      </div>
                  </div>
              </TabPanel>
          </TabView>
          <div className="flex justify-content-end mt-4">
              <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" onClick={saveGasto} />
          </div>
      </div>
  );
};

// Componente del Formulario de Combustible
const FormularioCombustible = () => {
  const [combustible, setCombustible] = useState<Combustible>({
      id_viaje: null,
      fecha: '',
      id_operador: null,
      litros: null,
      importe: null,
  });
  const [viajes, setViajes] = useState<{ id: number; folio: string }[]>([]);
  const [operadores, setOperadores] = useState<{ id: number; nombre: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);

  // Cargar datos iniciales (viajes y operadores)
  useEffect(() => {
      fetchViajes().then(setViajes);
      fetchOperadores().then(setOperadores);
  }, []);

  // Guardar o actualizar un combustible
  const saveCombustible = async () => {
      setSubmitted(true);

      if (
          combustible.id_viaje !== null &&
          combustible.fecha &&
          combustible.id_operador !== null &&
          combustible.litros !== null &&
          combustible.importe !== null
      ) {
          try {
              if (combustible.id) {
                  const updatedCombustible = await updateCombustible(combustible);
                  toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Combustible actualizado', life: 3000 });
              } else {
                  const newCombustible = await createCombustible(combustible);
                  toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Combustible creado', life: 3000 });
              }
              setCombustible({
                  id_viaje: null,
                  fecha: '',
                  id_operador: null,
                  litros: null,
                  importe: null,
              });
              setSubmitted(false);
          } catch (error) {
              toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el combustible', life: 3000 });
          }
      }
  };

  return (
      <div className="card p-4">
          <Toast ref={toast} />
          <TabView>
              <TabPanel header="Datos de Combustible">
                  <div className="p-fluid">
                      <div className="field">
                          <label htmlFor="fecha">Fecha</label>
                          <Calendar
                              id="fecha"
                              value={combustible.fecha ? new Date(combustible.fecha) : null}
                              onChange={(e) => setCombustible({ ...combustible, fecha: e.value ? e.value.toISOString().split('T')[0] : '' })}
                              dateFormat="yy-mm-dd"
                              showIcon
                              required
                              className={submitted && !combustible.fecha ? 'p-invalid' : ''}
                          />
                          {submitted && !combustible.fecha && <small className="p-invalid">Fecha es requerida.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_viaje">Viaje</label>
                          <Dropdown
                              id="id_viaje"
                              value={combustible.id_viaje}
                              options={viajes.map(v => ({ label: v.folio, value: v.id }))}
                              onChange={(e) => setCombustible({ ...combustible, id_viaje: e.value })}
                              placeholder="Selecciona un viaje"
                              required
                              className={submitted && !combustible.id_viaje ? 'p-invalid' : ''}
                          />
                          {submitted && !combustible.id_viaje && <small className="p-invalid">Viaje es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_operador">Operador</label>
                          <Dropdown
                              id="id_operador"
                              value={combustible.id_operador}
                              options={operadores.map(o => ({ label: o.nombre, value: o.id }))}
                              onChange={(e) => setCombustible({ ...combustible, id_operador: e.value })}
                              placeholder="Selecciona un operador"
                              required
                              className={submitted && !combustible.id_operador ? 'p-invalid' : ''}
                          />
                          {submitted && !combustible.id_operador && <small className="p-invalid">Operador es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="litros">Litros</label>
                          <InputText
                              id="litros"
                              value={combustible.litros?.toString() || ''}
                              onChange={(e) => setCombustible({ ...combustible, litros: parseFloat(e.target.value) || null })}
                              required
                              className={submitted && !combustible.litros ? 'p-invalid' : ''}
                          />
                          {submitted && !combustible.litros && <small className="p-invalid">Litros es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="importe">Importe</label>
                          <InputText
                              id="importe"
                              value={combustible.importe?.toString() || ''}
                              onChange={(e) => setCombustible({ ...combustible, importe: parseFloat(e.target.value) || null })}
                              required
                              className={submitted && !combustible.importe ? 'p-invalid' : ''}
                          />
                          {submitted && !combustible.importe && <small className="p-invalid">Importe es requerido.</small>}
                      </div>
                  </div>
              </TabPanel>
          </TabView>
          <div className="flex justify-content-end mt-4">
              <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" onClick={saveCombustible} />
          </div>
      </div>
  );
};

// Componente del Formulario de Clientes
const FormularioClientes = () => {
  return (
    <div className="card p-4">
      <TabView>
        <TabPanel header="Datos del Cliente">
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="nombreCliente">Nombre</label>
              <InputText id="nombreCliente" />
            </div>
            <div className="field">
              <label htmlFor="direccionCliente">Dirección</label>
              <InputText id="direccionCliente" />
            </div>
            <div className="field">
              <label htmlFor="telefonoCliente">Teléfono</label>
              <InputText id="telefonoCliente" />
            </div>
          </div>
        </TabPanel>
      </TabView>
      <div className="flex justify-content-end mt-4">
        <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" />
        {/* <Button label="Cancelar" icon="pi pi-times" className="p-button-secondary" /> */}
      </div>
    </div>
  );
};