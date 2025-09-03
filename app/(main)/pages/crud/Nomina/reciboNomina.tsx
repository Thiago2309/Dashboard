import React, { forwardRef } from 'react';
import { FaUserCircle, FaIdCard, FaBriefcase, FaMoneyBillWave, FaBullseye, FaGift, FaTruck, FaTrophy, FaHandHoldingUsd, FaCreditCard, FaFileInvoice, FaCheckCircle, FaFileInvoiceDollar } from "react-icons/fa";
import { FaCalendarAlt, FaCalendarCheck, FaCalendarTimes } from "react-icons/fa";
// import { IconType } from "react-icons";

interface ReciboNominaProps {
  nomina: any;
}

export const ReciboNomina = forwardRef<HTMLDivElement, ReciboNominaProps>(({ nomina }, ref) => {
  const fechaActual = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount || 0);
  };

  return (
    <div ref={ref} className="max-w-2xl mx-auto bg-white rounded-xl relative overflow-hidden shadow-lg">
      {/* Watermark */}
      <div className="company-watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 text-8xl font-bold -rotate-45 select-none">
        TRANSPORTES MX
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-sky-500 text-white p-6 rounded-t-xl relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">RECIBO DE NÓMINA</h1>
            <p className="text-blue-100 mt-1">
              Semana {nomina.semana} - {nomina.anio}
            </p>
          </div>
          <div className="bg-white text-blue-800 px-3 py-1 rounded-lg text-sm font-bold flex items-center">
            <FaFileInvoiceDollar className="mr-1" /> COMPROBANTE
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-4 flex items-center">
          <FaCalendarAlt className="mr-2" /> {fechaActual}
        </p>
      </div>

      {/* Employee Info */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
            Información del Empleado
          </h2>
          <div className="space-y-2">
            <p><FaUserCircle className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">Nombre:</span> {nomina.empleado_nombre}</p>
            <p><FaIdCard className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">ID:</span> {nomina.id_operador}</p>
            <p><FaBriefcase className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">Puesto:</span> Operador</p>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
            Periodo de Pago
          </h2>
          <div className="space-y-2">
            <p><FaCalendarCheck className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">Del:</span> {new Date(nomina.fecha_inicio).toLocaleDateString("es-MX")}</p>
            <p><FaCalendarTimes className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">Al:</span> {new Date(nomina.fecha_fin).toLocaleDateString("es-MX")}</p>
            <p><FaCalendarCheck className="inline text-blue-500 mr-2" /> <span className="font-medium text-slate-600">Días laborados:</span> {nomina.dias_laborados || "-"} días</p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
          Detalles de Pago
        </h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-4"><FaMoneyBillWave className="inline mr-2 text-green-500" /> Salario Base</td>
                <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(nomina.salario_base)}</td>
              </tr>
              <tr>
                <td className="p-4"><FaBullseye className="inline mr-2 text-blue-500" /> Pago por Alcance de Meta</td>
                <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(nomina.pago_alcance_meta)}</td>
              </tr>
              {nomina.bono > 0 && (
                <tr>
                  <td className="p-4"><FaGift className="inline mr-2 text-yellow-500" /> Bonos</td>
                  <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(nomina.bono)}</td>
                </tr>
              )}
              <tr>
                <td className="p-4"><FaTruck className="inline mr-2 text-indigo-500" /> Total de Viajes ({nomina.cantidad_viajes} viajes)</td>
                <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(nomina.total_viajes)}</td>
              </tr>
              <tr>
                <td className="p-4"><FaTrophy className="inline mr-2 text-purple-500" /> ¿Rebasó meta de 40K?</td>
                <td className="p-4 text-right font-semibold">
                  {nomina.rebaso ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅ Sí</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">❌ No</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deducciones */}
      {nomina.prestamos > 0 && (
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
            Deducciones
          </h2>
          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="p-4"><FaHandHoldingUsd className="inline mr-2 text-red-500" /> Préstamos</td>
                  <td className="p-4 text-right text-red-600 font-semibold">-{formatCurrency(nomina.prestamos)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
          Resumen de Pago
        </h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-4 font-medium">Pago Bruto</td>
                <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(nomina.pago_bruto)}</td>
              </tr>
              {nomina.prestamos > 0 && (
                <tr>
                  <td className="p-4 font-medium">Deducciones</td>
                  <td className="p-4 text-right text-red-600 font-semibold">-{formatCurrency(nomina.prestamos)}</td>
                </tr>
              )}
              <tr className="bg-blue-50">
                <td className="p-4 font-bold text-lg">PAGO NETO</td>
                <td className="p-4 text-right font-bold text-lg text-blue-700">
                  {formatCurrency(nomina.pago_neto)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de Pago */}
      {nomina.estatus === "Pagado" && (
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 section-title">
            Información de Pago
          </h2>
          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4"><FaCreditCard className="inline mr-2 text-indigo-500" /> Método de Pago</td>
                  <td className="p-4 text-right">{nomina.metodo_pago || "No especificado"}</td>
                </tr>
                {nomina.referencia_pago && (
                  <tr>
                    <td className="p-4"><FaFileInvoice className="inline mr-2 text-indigo-500" /> Referencia</td>
                    <td className="p-4 text-right">{nomina.referencia_pago}</td>
                  </tr>
                )}
                {nomina.fecha_pago && (
                  <tr>
                    <td className="p-4"><FaCalendarCheck className="inline mr-2 text-indigo-500" /> Fecha de Pago</td>
                    <td className="p-4 text-right">{new Date(nomina.fecha_pago).toLocaleDateString("es-MX")}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-4"><FaCheckCircle className="inline mr-2 text-indigo-500" /> Estatus</td>
                  <td className="p-4 text-right">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Pagado</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firmas */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="text-center">
          <div className="border-t border-slate-300 pt-12 relative">
            <p className="text-slate-600 text-sm mt-2">Firma del Empleado</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-300 pt-12 relative">
            <p className="text-slate-600 text-sm mt-2">Firma del Representante</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 p-4 text-center text-slate-500 text-xs rounded-b-xl border-t border-slate-200">
        <p>Este documento es un comprobante de pago de nómina</p>
        <p className="mt-1">Generado el {fechaActual}</p>
      </div>
    </div>
  );
});

ReciboNomina.displayName = "ReciboNomina";
