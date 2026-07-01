import React, { useState, useEffect } from 'react';
import { tableService } from '../../services/TableService';
import { Table } from '../../models/Table';

interface TableSelectorProps {
    selectedTable: number | undefined;
    onTableSelect: (table: number) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ selectedTable, onTableSelect }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const tableData = await tableService.all();
                setTables(tableData);
                setError(null);
            } catch (err) {
                setError("Failed to fetch table data. Please try again later.");
            }
        };

        fetchTables();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <select onChange={(e) => onTableSelect(parseInt(e.target.value))} value={selectedTable}>
                {tables.map(table => (
                    <option key={table.id} value={table.id}>
                        Table: {table.id}
                    </option>
                ))}
            </select>
            {selectedTable && <p>Selected Table: {selectedTable}</p>}
        </div>
    );
};

export default TableSelector;
