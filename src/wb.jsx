import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';



        const SwissButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
            const baseStyle = "font-mono font-bold uppercase py-3 px-6 swiss-border swiss-transition text-sm tracking-wider";
            const variants = {
                primary: "bg-swiss-accent text-white swiss-shadow hover:bg-black",
                secondary: "bg-white text-black swiss-shadow hover:bg-swiss-light",
                outline: "bg-transparent text-black border-2 border-black hover:bg-black hover:text-white"
            };
            
            return (
                <button 
                    onClick={onClick} 
                    disabled={disabled}
                    className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'swiss-shadow-hover'} ${className}`}
                >
                    {children}
                </button>
            );
        };

        const NavHeader = () => (
            <nav className="swiss-border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <a href="../index.html" className="font-mono font-bold text-xl tracking-tighter hover:text-swiss-accent swiss-transition">
                        P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                    </a>
                    <span className="font-mono text-sm text-gray-500 bg-swiss-light px-2 py-1 swiss-border">/ xlsx-sanitizer</span>
                </div>
            </nav>
        );

        const SanitizerApp = () => {
            const [file, setFile] = useState(null);
            const [parsedData, setParsedData] = useState([]);
            const [fileHeaders, setFileHeaders] = useState([]);
            const [selectedIndices, setSelectedIndices] = useState(new Set());
            const [status, setStatus] = useState('Ожидание файла...');
            const fileInputRef = useRef(null);

            const handleFile = (selectedFile) => {
                if (!selectedFile) return;
                setFile(selectedFile);
                setStatus('Чтение файла...');

                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                        if (json.length === 0) {
                            setStatus('Ошибка: Файл пуст.');
                            return;
                        }

                        const headers = json[0];
                        setFileHeaders(headers);
                        setParsedData(json);

                        // Auto-select "артикул продавца" if exists
                        const targetColumn = "артикул продавца";
                        const initialSelections = new Set();
                        headers.forEach((header, index) => {
                            if (header && header.toString().trim().toLowerCase() === targetColumn) {
                                initialSelections.add(index);
                            }
                        });
                        setSelectedIndices(initialSelections);
                        setStatus(`Файл загружен: ${selectedFile.name} (${json.length} строк)`);
                    } catch (error) {
                        setStatus(`Ошибка чтения: ${error.message}`);
                        console.error(error);
                    }
                };
                reader.readAsArrayBuffer(selectedFile);
            };

            const handleDrop = (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length) {
                    handleFile(e.dataTransfer.files[0]);
                }
            };

            const toggleColumn = (index) => {
                const newSelections = new Set(selectedIndices);
                if (newSelections.has(index)) {
                    newSelections.delete(index);
                } else {
                    newSelections.add(index);
                }
                setSelectedIndices(newSelections);
            };

            const exportCSV = () => {
                if (selectedIndices.size === 0) {
                    alert('Выберите хотя бы один столбец для экспорта!');
                    return;
                }

                const indicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
                
                const filteredData = parsedData.map(row => {
                    return indicesArray.map(index => row[index]);
                });

                const newWorksheet = XLSX.utils.aoa_to_sheet(filteredData);
                const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);

                // Adding BOM (\uFEFF) to ensure Excel opens the CSV correctly with Cyrillic characters
                const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                
                link.setAttribute("href", url);
                link.setAttribute("download", `Заказ_cleaned_${Date.now()}.csv`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setStatus('Файл успешно скачан.');
            };

            const resetApp = () => {
                setFile(null);
                setParsedData([]);
                setFileHeaders([]);
                setSelectedIndices(new Set());
                setStatus('Ожидание файла...');
                if (fileInputRef.current) fileInputRef.current.value = '';
            };

            return (
                <div className="min-h-screen p-8 lg:p-16 flex flex-col items-center justify-center">
                    <div className="w-full max-w-3xl bg-white swiss-border swiss-shadow p-8">
                        <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold font-mono tracking-tight">Конвертер XLSX в чистый CSV</h1>
                                <p className="text-sm text-gray-600 font-mono mt-1">Умное извлечение нужных столбцов из выгрузок Wildberries для скрипта.</p>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-[10px] text-gray-500 uppercase">СТАТУС</div>
                                <div className="font-mono text-xs font-bold bg-swiss-light px-2 py-1 swiss-border inline-block mt-1">
                                    {status}
                                </div>
                            </div>
                        </div>

                        {!fileHeaders.length ? (
                            <div 
                                className="border-2 border-dashed border-black bg-swiss-light p-12 text-center cursor-pointer hover:bg-gray-200 swiss-transition"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="text-4xl mb-4">↓</div>
                                <div className="font-mono font-bold">Перетащите сюда файл</div>
                                <div className="font-mono font-bold text-swiss-accent mt-1">.xlsx или .csv</div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files.length) handleFile(e.target.files[0]);
                                    }}
                                    accept=".xlsx, .xls, .csv" 
                                    className="hidden" 
                                />
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="font-mono text-xs font-bold uppercase mb-4 bg-black text-white inline-block px-3 py-1">
                                    ВЫБЕРИТЕ СТОЛБЦЫ ДЛЯ ЭКСПОРТА
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-4 swiss-border bg-swiss-light mb-8">
                                    {fileHeaders.map((header, index) => {
                                        if (!header) return null;
                                        const isSelected = selectedIndices.has(index);
                                        return (
                                            <div 
                                                key={index}
                                                onClick={() => toggleColumn(index)}
                                                className={`p-3 swiss-border cursor-pointer swiss-transition flex items-center gap-3 ${isSelected ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                            >
                                                <div className={`w-4 h-4 border-2 ${isSelected ? 'border-white bg-white' : 'border-black bg-transparent'} flex items-center justify-center`}>
                                                    {isSelected && <div className="w-2 h-2 bg-black"></div>}
                                                </div>
                                                <span className="font-mono text-sm truncate" title={header}>{header}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <SwissButton variant="outline" onClick={resetApp} className="sm:col-span-1">
                                        Сброс
                                    </SwissButton>
                                    <SwissButton variant="primary" onClick={exportCSV} disabled={selectedIndices.size === 0} className="sm:col-span-2">
                                        СКАЧАТЬ ЧИСТЫЙ CSV ({selectedIndices.size})
                                    </SwissButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const App = () => (
            <>
                <NavHeader />
                <SanitizerApp />
            </>
        );

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);