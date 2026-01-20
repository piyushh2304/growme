import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable, type DataTableStateEvent, type DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchArtworks, fetchArtworksByIds } from '../services/api';
import type { Artwork } from '../types/astwork';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber, type InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

interface RowSelectionOverlayProps {
    onSelect: (count: number) => Promise<void>;
    loading: boolean;
}

const RowSelectionOverlay: React.FC<RowSelectionOverlayProps> = ({ onSelect, loading }) => {
    const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);
    const op = useRef<OverlayPanel>(null);

    const handleSubmit = async () => {
        if (rowsToSelect && rowsToSelect > 0) {
            await onSelect(rowsToSelect);
            op.current?.hide();
            setRowsToSelect(null);
        }
    };

    return (
        <div className="flex align-items-center justify-content-start gap-2">
            <Button
                type="button"
                icon="pi pi-chevron-down"
                onClick={(e) => op.current?.toggle(e)}
                className="p-button-text p-button-sm"
                style={{ padding: '0.2rem', width: '2rem' }}
                aria-label="Select custom rows"
            />
            <OverlayPanel ref={op}>
                <div className="flex flex-column gap-2 p-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p className="m-0 mb-2">Select rows across all pages:</p>
                    <InputNumber
                        value={rowsToSelect}
                        onValueChange={(e: InputNumberValueChangeEvent) => setRowsToSelect(e.value ?? null)}
                        placeholder="Number of rows..."
                        min={1}
                        max={100} 
                        showButtons
                        buttonLayout="horizontal"
                        step={1}
                        inputStyle={{ width: '8rem' }}
                    />
                    <Button 
                        label={loading ? "Selecting..." : "Submit"} 
                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        onClick={handleSubmit} 
                        className="p-button-sm" 
                        disabled={!rowsToSelect || rowsToSelect <= 0 || loading}
                    />
                </div>
            </OverlayPanel>
        </div>
    );
};

const ArtworkTable: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<Record<number, boolean>>({});
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rows] = useState(12);

    const fetchData = async (currentPage: number) => {
        setLoading(true);
        try {
            const response = await fetchArtworks(currentPage, rows);
            setArtworks(response.data);
            setTotalRecords(response.pagination.total);
        } catch (error) {
            console.error("Error loading artworks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const onPage = (event: DataTableStateEvent) => {
        const newPage = (event.page ?? 0) + 1;
        setPage(newPage);
    };

    const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
        const selection = e.value as Artwork[];
        
        setSelectedRowIds(prev => {
            const next = { ...prev };
            
            artworks.forEach(art => {
                delete next[art.id];
            });

            selection.forEach(art => {
                next[art.id] = true;
            });
            return next;
        });
    };

    const handleCustomSelect = async (count: number) => {
        setLoading(true);
        try {
            const data = await fetchArtworksByIds(count);
            const ids: number[] = data.data.map((item: any) => item.id);
            
            setSelectedRowIds(prev => {
                const next = { ...prev };
                ids.forEach(id => {
                    next[id] = true;
                });
                return next;
            });
        } catch (error) {
            console.error("Bulk selection failed", error);
            alert("Failed to fetch artworks for selection.");
        } finally {
            setLoading(false);
        }
    };

    const currentSelection = useMemo(() => {
        return artworks.filter(art => selectedRowIds[art.id]);
    }, [artworks, selectedRowIds]);

    const totalSelected = Object.keys(selectedRowIds).length;

    return (
        <div className="card">
            <div className="mb-3 flex justify-content-between align-items-center" style={{ marginBottom: '1rem' }}>
               <h3 className="m-0">Artworks</h3>
               <span className="p-tag p-component p-tag-info" style={{ fontSize: '1rem', padding: '0.5rem' }}>
                    Running Selection: {totalSelected}
               </span>
            </div>
            
            <DataTable
                value={artworks}
                lazy
                paginator
                first={(page - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                onPage={onPage}
                loading={loading}
                tableStyle={{ minWidth: '50rem' }}
                dataKey="id"
                selectionMode="multiple"
                selection={currentSelection}
                onSelectionChange={onSelectionChange}
                emptyMessage="No artworks found."
            >
                <Column 
                    selectionMode="multiple" 
                    header={<RowSelectionOverlay onSelect={handleCustomSelect} loading={loading} />} 
                    headerStyle={{ width: '4rem', textAlign: 'center' }}
                />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Place of Origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Start Date" />
                <Column field="date_end" header="End Date" />
            </DataTable>
        </div>
    );
};
export default ArtworkTable;