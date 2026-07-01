import React, { useEffect, useState } from 'react';
import { tableService } from '../../services/TableService';
import { Table } from '../../models/Table';
import Translate from '../../components/Translate';
import './style.css';

const TableStatusPage: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const tablesData = await tableService.all();
                setTables(tablesData);
            } catch (error) {
                console.error('Error fetching tables:', error);
            }
        };

        fetchTables();
    }, []);

    return (
        <div className="table-status-container">
            <h2>Table Status</h2>
            <div className="table-grid">
                {tables.map(table => (
                    <div key={table.id} className={`table-card ${table.lastService ? 'occupied' : 'free'}`}>
                        <h3>Table {table.id}</h3>
                        <p>Status: <Translate translationKey={table.lastService ? 'gui.occupied' : 'gui.free'} /></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableStatusPage;
