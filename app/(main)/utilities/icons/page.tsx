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
import { fetchClientesNotes, createCliente, updateCliente, Cliente } from '../../../../Services/BD/clientesService';
import {createViaje, updateViaje, fetchPreciosOrigenDestino, fetchMateriales, fetchM3, Viaje } from '../../../../Services/BD/viajeService';
import { getUserRoleIdFromLocalStorage } from '@/Services/BD/userService';
import { RadioButton } from 'primereact/radiobutton';

const userRoleId = getUserRoleIdFromLocalStorage();
const isAlmacen = userRoleId === 4;

export default function GestionAreas() {
    if (isAlmacen) {
      return (
        <div>
          {/* Solo muestra el formulario de Gastos para rol 4 */}
          <div className="card crud-demo p-4 mb-4">
            <h2>Gestión de Gastos</h2>
            <FormularioGastos />
          </div>
        </div>
      );
    }
  
    // Muestra todos los formularios para otros roles
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
          <FormularioCliente />
        </div>
      </div>
    );
}

// Componente del Formulario de Nota de Viaje
const FormularioNotaViaje = () => {
  const [viaje, setViaje] = useState<Viaje>({
      id_cliente: null,
      fecha: '',
      folio_bco: '',
      folio: '',
      id_precio_origen_destino: null,
      id_material: null,
      id_m3: null,
      caphrsviajes: null,
      id_operador: null,
  });
  const [clientes, setClientes] = useState<{ id?: number; empresa: string }[]>([]);
  const [preciosOrigenDestino, setPreciosOrigenDestino] = useState<{ id: number; label: string; precio_unidad: number }[]>([]);
  const [materiales, setMateriales] = useState<{ id: number; nombre: string }[]>([]);
  const [operadores, setOperadores] = useState<{ id: number; nombre: string }[]>([]);
  const [m3, setM3] = useState<{ id: number; nombre: string; metros_cubicos: number }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);

  // Cargar datos iniciales (clientes, precios, materiales, m3)
  useEffect(() => {
      fetchClientesNotes().then(setClientes);
      fetchPreciosOrigenDestino().then(setPreciosOrigenDestino);
      fetchMateriales().then(setMateriales);
      fetchM3().then(setM3);
      fetchOperadores().then(setOperadores);
  }, []);

  // Guardar o actualizar un viaje
  const saveViaje = async () => {
    setSubmitted(true);

    if (
        viaje.id_cliente !== null &&
        viaje.fecha &&
        viaje.folio_bco &&
        viaje.folio &&
        viaje.id_precio_origen_destino !== null &&
        viaje.id_material !== null &&
        viaje.id_m3 !== null && 
        viaje.id_operador !== null
    ) {
        try {
            // Obtener el precio_unidad y metros_cubicos
            const precioOrigenDestino = preciosOrigenDestino.find(p => p.id === viaje.id_precio_origen_destino);
            const m3Seleccionado = m3.find(m => m.id === viaje.id_m3);

            if (precioOrigenDestino && m3Seleccionado) {
                const precio_unidad = precioOrigenDestino.precio_unidad;
                const metros_cubicos = m3Seleccionado.metros_cubicos;

                // Calcular caphrsviajes
                const caphrsviajes = precio_unidad * metros_cubicos;

                console.log('precio_unidad:', precio_unidad);
                console.log('metros_cubicos:', metros_cubicos);
                console.log('caphrsviajes:', caphrsviajes);

                // Actualizar el estado del viaje con el cálculo
                const viajeActualizado = {
                    ...viaje,
                    caphrsviajes: caphrsviajes,
                };

                // Guardar o actualizar el viaje
                if (viaje.id) {
                    const updatedViaje = await updateViaje(viajeActualizado);
                    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Viaje actualizado', life: 3000 });
                } else {
                    const newViaje = await createViaje(viajeActualizado);
                    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Viaje creado', life: 3000 });
                }

                // Reiniciar el formulario
                setViaje({
                    id_cliente: null,
                    fecha: '',
                    folio_bco: '',
                    folio: '',
                    id_precio_origen_destino: null,
                    id_material: null,
                    id_m3: null,
                    caphrsviajes: null,
                    id_operador: null,
                });
                setSubmitted(false);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se encontró el precio o los metros cúbicos', life: 3000 });
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el viaje', life: 3000 });
        }
    }
};

  return (
      <div className="card p-4">
          <Toast ref={toast} />
          <TabView>
              <TabPanel header="Datos Generales">
                  <div className="p-fluid">
                      <div className="field">
                          <label htmlFor="fecha">Fecha</label><span style={{ color: 'red' }}> *</span>
                          <Calendar
                              id="fecha"
                              value={viaje.fecha ? new Date(viaje.fecha) : null}
                              onChange={(e) => setViaje({ ...viaje, fecha: e.value ? e.value.toISOString().split('T')[0] : '' })}
                              dateFormat="yy-mm-dd"
                              showIcon
                              required
                              className={submitted && !viaje.fecha ? 'p-invalid' : ''}
                          />
                          {submitted && !viaje.fecha && <small className="p-invalid">Fecha es requerida.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="folio">Folio</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="folio_bco">Folio Banco</label><span style={{ color: 'red' }}> *</span>
                          <InputText
                              id="folio_bco"
                              value={viaje.folio_bco}
                              onChange={(e) => setViaje({ ...viaje, folio_bco: e.target.value })}
                              required
                              className={submitted && !viaje.folio_bco ? 'p-invalid' : ''}
                          />
                          {submitted && !viaje.folio_bco && <small className="p-invalid">Folio Banco es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_cliente">Cliente</label><span style={{ color: 'red' }}> *</span>
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
                  </div>
              </TabPanel>
              <TabPanel header="Detalles del Viaje">
                  <div className="p-fluid">
                      <div className="field">
                          <label htmlFor="id_precio_origen_destino">Origen - Destino</label><span style={{ color: 'red' }}> *</span>
                          <Dropdown
                              id="id_precio_origen_destino"
                              value={viaje.id_precio_origen_destino}
                              options={preciosOrigenDestino.map(p => ({ label: p.label, value: p.id }))}
                              onChange={(e) => setViaje({ ...viaje, id_precio_origen_destino: e.value })}
                              placeholder="Selecciona un destino"
                              required
                              className={submitted && !viaje.id_precio_origen_destino ? 'p-invalid' : ''}
                          />
                          {submitted && !viaje.id_precio_origen_destino && <small className="p-invalid">Origen - Destino es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_material">Material</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="id_m3">Metros Cúbicos</label><span style={{ color: 'red' }}> *</span>
                          <Dropdown
                              id="id_m3"
                              value={viaje.id_m3}
                              options={m3.map(m => ({ label: m.nombre, value: m.id }))}
                              onChange={(e) => setViaje({ ...viaje, id_m3: e.value })}
                              placeholder="Selecciona m³"
                              required
                              className={submitted && !viaje.id_m3 ? 'p-invalid' : ''}
                          />
                          {submitted && !viaje.id_m3 && <small className="p-invalid">Metros Cúbicos es requerido.</small>}
                      </div>
                      <div className="operador">
                            <label htmlFor="id_operador">Operador</label><span style={{ color: 'red' }}> *</span>
                            <Dropdown
                                id="id_operador"
                                value={viaje.id_operador}
                                options={operadores.map(o => ({ label: o.nombre, value: o.id }))}
                                onChange={(e) => setViaje({ ...viaje, id_operador: e.value })}
                                placeholder="Selecciona un operador"
                                required
                                className={submitted && !viaje.id_operador ? 'p-invalid' : ''}
                            />
                            {submitted && !viaje.id_operador && <small className="p-invalid">Operador es requerido.</small>}
                      </div>
                  </div>
              </TabPanel>
          </TabView>
          <div className="flex justify-content-end mt-4">
              <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" onClick={saveViaje} />
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
      descripcion: '',
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
          gasto.fecha &&
          gasto.id_proveedor !== null &&
          gasto.refaccion.trim() &&
          gasto.importe !== null
      ) {
          try {
              await createGasto(gasto);
              toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Gasto guardado con Exito!', life: 3000 });
              setGasto({
                  fecha: '',
                  id_proveedor: null,
                  refaccion: '',
                  importe: null,
                  descripcion: '',
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
                          <label htmlFor="fecha">Fecha</label><span style={{ color: 'red' }}> *</span>
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
                          />
                      </div>
                      <div className="field">
                          <label htmlFor="id_proveedor">Proveedor</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="refaccion">Refacción</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="descripcion">Descripcion</label><span style={{ color: 'red' }}> *</span>
                          <InputText
                              id="descripcion"
                              value={gasto.descripcion}
                              onChange={(e) => setGasto({ ...gasto, descripcion: e.target.value })}
                              required
                              className={submitted && !gasto.descripcion ? 'p-invalid' : ''}
                          />
                          {submitted && !gasto.descripcion && <small className="p-invalid">descripcion es requerida.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="importe">Importe</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="fecha">Fecha</label><span style={{ color: 'red' }}> *</span>
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
                          />
                          {submitted && !combustible.id_viaje && <small className="p-invalid">Viaje es requerido.</small>}
                      </div>
                      <div className="field">
                          <label htmlFor="id_operador">Operador</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="litros">Litros</label><span style={{ color: 'red' }}> *</span>
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
                          <label htmlFor="importe">Importe</label><span style={{ color: 'red' }}> *</span>
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
const FormularioCliente = () => {
    const [cliente, setCliente] = useState<Cliente>({
      empresa: '',
      contacto: '',
      telefono: '',
      tipo_cliente: undefined,
      rfc: '',
      direccion: '',
      metodo_pago: undefined,
      uso_cfdi: '',
      regimen_fiscal: '',
      obra: '',
      estatus: 1 // Valor por defecto
    });
    
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
  
    // Opciones para los dropdowns/selects
    const TipoCliente = [
        { label: 'Efectivo', value: 'Efectivo' },
        { label: 'Facturado', value: 'Facturado' }
    ];
  
    const metodoPagoOptions = [
      { label: 'Efectivo', value: 'Efectivo' },
      { label: 'Transferencia', value: 'Transferencia' },
    ];
  
    const usoCFDIOptions = [
      { label: 'G01 - Adquisición de mercancías', value: 'G01' },
      { label: 'G03 - Gastos en general', value: 'G03' },
      { label: 'P01 - Por definir', value: 'P01' }
      // Agrega más opciones según sea necesario
    ];
  
    const regimenFiscalOptions = [
      { label: '601 - General de Ley Personas Morales', value: '601' },
      { label: '603 - Personas Morales con Fines no Lucrativos', value: '603' },
      { label: '605 - Sueldos y Salarios', value: '605' }
      // Agrega más opciones según sea necesario
    ];
  
    // Guardar o actualizar un cliente
    const saveCliente = async () => {
      setSubmitted(true);
  
      // Validar campos obligatorios
      if (cliente.empresa.trim() && cliente.contacto.trim()) {
        try {
          if (cliente.id) {
            const updatedCliente = await updateCliente(cliente);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado', life: 3000 });
          } else {
            const newCliente = await createCliente(cliente);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado', life: 3000 });
          }
          // Resetear formulario después de guardar
          setCliente({
            empresa: '',
            contacto: '',
            telefono: '',
            tipo_cliente: undefined,
            rfc: '',
            direccion: '',
            metodo_pago: undefined,
            uso_cfdi: '',
            regimen_fiscal: '',
            obra: '',
            estatus: 1
          });
          setSubmitted(false);
        } catch (error) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el cliente', life: 3000 });
        }
      }
    };

    return (
        <div className="card p-4">
            <Toast ref={toast} />
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="empresa">Empresa</label><span style={{ color: 'red' }}> *</span>
                    <InputText
                    id="empresa"
                    value={cliente.empresa}
                    onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                    required
                    className={submitted && !cliente.empresa ? 'p-invalid' : ''}
                    />
                    {submitted && !cliente.empresa && <small className="p-invalid">Empresa es requerida.</small>}
                </div>
    
                <div className="field">
                    <label htmlFor="contacto">Contacto</label><span style={{ color: 'red' }}> *</span>
                    <InputText
                    id="contacto"
                    value={cliente.contacto}
                    onChange={(e) => setCliente({ ...cliente, contacto: e.target.value })}
                    required
                    className={submitted && !cliente.contacto ? 'p-invalid' : ''}
                    />
                    {submitted && !cliente.contacto && <small className="p-invalid">Contacto es requerido.</small>}
                </div>
    
                <div className="field">
                    <label htmlFor="telefono">Teléfono</label>
                    <InputText
                    id="telefono"
                    value={cliente.telefono}
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="direccion">Dirección</label><span style={{ color: 'red' }}> *</span>
                    <InputText
                    id="direccion"
                    value={cliente.direccion}
                    onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    />
                </div>
    
            <div className="field">
                <label htmlFor="tipo_cliente">Tipo de Cliente</label><span style={{ color: 'red' }}> *</span>
                <Dropdown
                id="tipo_cliente"
                value={cliente.tipo_cliente}
                options={TipoCliente}
                onChange={(e) => setCliente({ ...cliente, tipo_cliente: e.value })}
                placeholder="Selecciona un tipo"
                />
            </div>
    
            {/* aqui */}
            {cliente.tipo_cliente === 'Facturado' && (
                <>
                    <div className="field">
                        <label htmlFor="rfc">RFC</label><span style={{ color: 'red' }}> *</span>
                        <InputText
                            id="rfc"
                            value={cliente.rfc || ''}
                            maxLength={13} // Solo permite 13 caracteres
                            onChange={(e) => setCliente({ ...cliente, rfc: e.target.value })}
                            className={submitted && cliente.tipo_cliente === 'Facturado' && !cliente.rfc ? 'p-invalid' : ''}
                            placeholder="Solo es permitido 13 caracteres"
                        />
                        {submitted && cliente.tipo_cliente === 'Facturado' && !cliente.rfc && (
                            <small className="p-invalid">RFC es requerido para facturación</small>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="uso_cfdi">Uso CFDI</label><span style={{ color: 'red' }}> *</span>
                        <Dropdown
                            id="uso_cfdi"
                            value={cliente.uso_cfdi}
                            options={usoCFDIOptions}
                            onChange={(e) => setCliente({ ...cliente, uso_cfdi: e.value })}
                            placeholder="Seleccione uso CFDI"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="regimen_fiscal">Régimen Fiscal</label><span style={{ color: 'red' }}> *</span>
                        <Dropdown
                            id="regimen_fiscal"
                            value={cliente.regimen_fiscal}
                            options={regimenFiscalOptions}
                            onChange={(e) => setCliente({ ...cliente, regimen_fiscal: e.value })}
                            placeholder="Seleccione uso de Regimen Fiscal"
                        />
                    </div>
                </>
            )}

            <div className="field">
                <label htmlFor="metodo_pago">Método de Pago</label><span style={{ color: 'red' }}> *</span>
                <Dropdown
                id="metodo_pago"
                value={cliente.metodo_pago}
                options={metodoPagoOptions}
                onChange={(e) => setCliente({ ...cliente, metodo_pago: e.value })}
                placeholder="Selecciona un método"
                />
            </div>
    
            <div className="field">
                <label htmlFor="obra">Obra</label><span style={{ color: 'red' }}> *</span>
                <InputText
                id="obra"
                value={cliente.obra}
                onChange={(e) => setCliente({ ...cliente, obra: e.target.value })}
                />
            </div>
    
            <div className="field">
                <label htmlFor="estatus">Estatus</label><span style={{ color: 'red' }}> *</span>
                <div className="flex align-items-center">
                    <div className="flex align-items-center mr-3">
                        <RadioButton
                            inputId="estatus_activo"
                            name="estatus"
                            value={1}
                            onChange={(e) => setCliente({ ...cliente, estatus: 1 })}
                            checked={cliente.estatus === 1}
                        />
                        <label htmlFor="estatus_activo" className="ml-2">Activo</label>
                    </div>
                    {/* <div className="flex align-items-center">
                        <RadioButton
                            inputId="estatus_inactivo"
                            name="estatus"
                            value={0}
                            onChange={(e) => setCliente({ ...cliente, estatus: 0 })}
                            checked={cliente.estatus === 0}
                        />
                        <label htmlFor="estatus_inactivo" className="ml-2">Inactivo</label>
                    </div> */}
                </div>
            </div>
            </div>
    
            <div className="flex justify-content-end mt-4">
            <Button label="Guardar" icon="pi pi-check" className="p-button-info mr-2" onClick={saveCliente} />
            </div>
        </div>
    );
};