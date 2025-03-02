'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ViajesModule from './viajes';
import GastosModule from './gastos';
import CombustibleModule from './combustible';
import CajaNegraModule from './cajanegra';

const TableModule = () => {
    const [activeModule, setActiveModule] = useState('Viajes');

    const renderModule = () => {
        switch (activeModule) {
            case 'Viajes':
                return <ViajesModule />;
            case 'Gastos':
                return <GastosModule />;
            case 'Combustible':
                return <CombustibleModule />;
            case 'Caja Negra':
                return <CajaNegraModule />;
            default:
                return <div>Selecciona un módulo</div>;
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Tables</h1>
            <div style={styles.whiteContainer}>
                <div style={styles.menu}>
                    <div
                        style={activeModule === 'Viajes' ? styles.activeMenuItem : styles.menuItem}
                        onClick={() => setActiveModule('Viajes')}
                    >
                        Viajes
                    </div>
                    <div
                        style={activeModule === 'Gastos' ? styles.activeMenuItem : styles.menuItem}
                        onClick={() => setActiveModule('Gastos')}
                    >
                        Gastos
                    </div>
                    <div
                        style={activeModule === 'Combustible' ? styles.activeMenuItem : styles.menuItem}
                        onClick={() => setActiveModule('Combustible')}
                    >
                        Combustible
                    </div>
                    <div
                        style={activeModule === 'Caja Negra' ? styles.activeMenuItem : styles.menuItem}
                        onClick={() => setActiveModule('Caja Negra')}
                    >
                        Caja Negra
                    </div>
                </div>
                <div style={styles.actions}>
                    <Button label="+ New" style={styles.button} />
                    <Button label="+ Import" style={styles.button} />
                    <Button label="+ Export" style={styles.button} />
                </div>
                <div style={styles.tableContainer}>
                    {renderModule()}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
    },
    title: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    whiteContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '20px',
    },
    menu: {
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '2px solid #ccc',
    },
    menuItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    activeMenuItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: '2px solid red',
        fontWeight: 'bold',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px',
    },
    button: {
        marginLeft: '10px',
    },
    tableContainer: {
        marginTop: '20px',
    },
};

export default TableModule;