import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';


        const { jsPDF } = window.jspdf;

        const NavHeader = () => (
            <nav className="swiss-border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <a href="../index.html" className="font-mono font-bold text-xl tracking-tighter hover:text-swiss-accent swiss-transition">
                        P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                    </a>
                    <span className="font-mono text-sm text-gray-500 bg-swiss-light px-2 py-1 swiss-border">/ ean13-generator</span>
                </div>
            </nav>
        );

        const SwissButton = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
            const styles = {
                primary: 'bg-swiss-black text-swiss-white border border-swiss-black hover:bg-swiss-accent hover:border-swiss-accent disabled:opacity-50 disabled:cursor-not-allowed',
                secondary: 'bg-transparent text-swiss-black border border-swiss-black hover:bg-swiss-black hover:text-swiss-white disabled:opacity-50 disabled:cursor-not-allowed',
            };
            return (
                <button 
                    onClick={onClick}
                    disabled={disabled}
                    className={`${styles[variant]} font-mono font-bold text-sm tracking-widest uppercase px-6 py-4 transition-colors duration-200 rounded-none inline-block ${className}`}
                >
                    {children}
                </button>
            );
        };

        const Ean13GeneratorApp = () => {
            const [file, setFile] = useState(null);
            const [isGenerating, setIsGenerating] = useState(false);
            const [progress, setProgress] = useState(0);
            const [status, setStatus] = useState('Ожидание файла...');
            const [config, setConfig] = useState({
                width_mm: 50,
                height_mm: 30,
                font_size_barcode: 20,
                font_family_barcode: 'monospace',
                font_size_name: 6,
                font_size_wb: 9,
                font_size_seller: 7,
                barcode_height_mm: 20,
                margin_top_mm: 3,
                spacing_text_mm: 5
            });
            const [previewUrl, setPreviewUrl] = useState(null);
            const [singleBarcode, setSingleBarcode] = useState('');

            const fileInputRef = useRef(null);

            const handleFileChange = (e) => {
                if (e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                    setStatus(`Выбран файл: ${e.target.files[0].name}`);
                }
            };

            const handleConfigChange = (e) => {
                const { name, value } = e.target;
                setConfig(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
            };

            const wrapText = (doc, text, maxWidth, fontSize) => {
                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, maxWidth);
                return lines;
            };

            const generatePDF = (row) => {
                return new Promise(async (resolve) => {
                    const article_seller = (row['Артикул продавца'] || '').trim();
                    const barcode_value = (row['Баркоды'] || '').trim();
                    if (barcode_value && !/^\d{12,13}$/.test(barcode_value)) {
                        console.error("Invalid EAN-13 code:", barcode_value);
                        resolve(null);
                        return;
                    }

                    if (!barcode_value) {
                        resolve(null);
                        return;
                    }

                    const isLandscape = config.width_mm >= config.height_mm;
                    const doc = new jsPDF({
                        orientation: isLandscape ? 'landscape' : 'portrait',
                        unit: 'mm',
                        format: isLandscape ? [config.width_mm, config.height_mm] : [config.height_mm, config.width_mm]
                    });

                    const width = config.width_mm;
                    const height = config.height_mm;

                    // Draw Barcode Image centered
                    const bcWidth = width * 0.9;
                    const bcHeight = config.barcode_height_mm;
                    const x = (width - bcWidth) / 2;
                    const y = (height - bcHeight) / 2;
                    
                    // Generate barcode to base64 canvas
                    const canvas = document.createElement('canvas');
                    try {
                        const safe_barcode = barcode_value.substring(0, 12);
                        JsBarcode(canvas, safe_barcode, {
                            format: "EAN13",
                            displayValue: true,
                            font: 'Space Mono',
                            fontSize: config.font_size_barcode * 3, // scale up for canvas
                            textMargin: 0,
                            width: 6, // Увеличиваем плотность пикселей по ширине
                            height: bcHeight * 15, // Увеличиваем плотность пикселей по высоте
                            margin: 0
                        });
                        
                        const barcodeImgData = canvas.toDataURL("image/png");
                        doc.addImage(barcodeImgData, 'PNG', x, y, bcWidth, bcHeight);

                        const pdfOutput = doc.output('arraybuffer');
                        
                        // Safe filename
                        const safe_filename = article_seller.replace(/[^a-zA-Z0-9.\-_]/g, '') || `label_${barcode_value}`;
                        
                        resolve({ name: `${safe_filename}.pdf`, data: pdfOutput });
                    } catch (e) {
                        console.error("Barcode error", e);
                        resolve(null);
                    }
                });
            };

            const generatePreview = async () => {
                const mockRow = {
                    'Артикул продавца': 'ART-TEST',
                    'Артикул WB': '12345678',
                    'Баркоды': '4607123412345',
                    'Наименование': 'Пример названия тестового товара для проверки переносов'
                };
                const pdfObj = await generatePDF(mockRow);
                if (pdfObj) {
                    const blob = new Blob([pdfObj.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                }
            };

            useEffect(() => {
                generatePreview();
            }, [config]);

            const generateSingle = async () => {
                if (!singleBarcode || !/^\d{12,13}$/.test(singleBarcode)) {
                    alert('Введите корректный EAN-13 (12 или 13 цифр)');
                    return;
                }
                setIsGenerating(true);
                setStatus('Генерация одиночного штрих-кода...');
                const mockRow = {
                    'Артикул продавца': `SINGLE-${singleBarcode}`,
                    'Баркоды': singleBarcode
                };
                const pdfObj = await generatePDF(mockRow);
                if (pdfObj) {
                    const blob = new Blob([pdfObj.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `barcode_${singleBarcode}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setStatus('Готово! Одиночный штрих-код скачан.');
                } else {
                    setStatus('Ошибка генерации одиночного штрих-кода.');
                }
                setIsGenerating(false);
            };

            const startGeneration = () => {
                if (!file) return;
                setIsGenerating(true);
                setProgress(0);
                setStatus('Чтение CSV файла...');

                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async function(results) {
                        const rows = results.data;
                        const total = rows.length;
                        setStatus(`Найдено ${total} строк. Генерация PDF...`);

                        const zip = new JSZip();
                        let processed = 0;

                        for (let i = 0; i < total; i++) {
                            const pdfObj = await generatePDF(rows[i]);
                            if (pdfObj) {
                                zip.file(pdfObj.name, pdfObj.data);
                            }
                            processed++;
                            
                            // Update UI every 5 items to avoid blocking the main thread entirely
                            if (processed % 5 === 0 || processed === total) {
                                setProgress(Math.round((processed / total) * 100));
                            }
                            
                            // Small delay to allow UI to render
                            await new Promise(r => setTimeout(r, 0));
                        }

                        setStatus('Упаковка в ZIP архив...');
                        
                        zip.generateAsync({ type: 'blob' }).then(function(content) {
                            const url = window.URL.createObjectURL(content);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `labels_archive_${Date.now()}.zip`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);

                            setStatus('Готово! Файл скачан.');
                            setIsGenerating(false);
                        });
                    },
                    error: function(error) {
                        setStatus(`Ошибка парсинга: ${error.message}`);
                        setIsGenerating(false);
                    }
                });
            };

            const downloadTemplate = () => {
                const csvContent = "\uFEFFАртикул продавца,Артикул WB,Баркоды,Наименование\nART-TEST,12345678,4607123412345,Пример названия товара\n";
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8-sig;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            const downloadPreview = async () => {
                const mockRow = {
                    'Артикул продавца': 'ART-TEST',
                    'Артикул WB': '12345678',
                    'Баркоды': '4607123412345',
                    'Наименование': 'Пример названия тестового товара для проверки переносов'
                };
                const pdfObj = await generatePDF(mockRow);
                if (pdfObj) {
                    const blob = new Blob([pdfObj.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'preview_label.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            };

            return (
                <div className="min-h-screen p-8 lg:p-16 flex flex-col items-center justify-center relative">
                    <div className="w-full max-w-4xl">
                        <div className="inline-block border border-swiss-black px-3 py-1 mb-8 font-mono text-xs uppercase tracking-widest bg-swiss-white">
                            Client-Side / 100% В браузере
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
                            Barcode <span className="text-swiss-accent">Generator</span>.
                        </h1>
                        <p className="font-mono text-gray-600 mb-12 max-w-2xl leading-relaxed">
                            Массовая генерация PDF-этикеток EAN-13 на основе CSV. Вся обработка происходит прямо в вашем браузере — никаких серверов, максимальная безопасность.
                        </p>

                        <div className="bg-swiss-white border border-swiss-black p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="border border-swiss-black bg-swiss-lightGray flex flex-col h-[250px] relative">
                                    <div className="absolute top-0 left-0 bg-swiss-black text-swiss-white font-mono text-[10px] uppercase px-2 py-1 z-10">
                                        Live Preview
                                    </div>
                                    {previewUrl ? (
                                        <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} className="w-full h-full border-none pointer-events-none overflow-hidden"></iframe>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center font-mono text-xs uppercase text-gray-400">Генерация превью...</div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col justify-center">
                                    <div className="font-mono text-sm font-bold uppercase mb-4 border-b border-swiss-black pb-2">Создать один штрих-код</div>
                                    <div className="flex gap-2 mb-6">
                                        <input 
                                            type="text" 
                                            placeholder="Введите 13 цифр..." 
                                            value={singleBarcode} 
                                            onChange={(e) => setSingleBarcode(e.target.value)}
                                            className="flex-1 border border-swiss-black px-3 py-2 font-mono text-sm focus:outline-none focus:border-swiss-accent"
                                        />
                                        <SwissButton variant="primary" onClick={generateSingle} disabled={isGenerating || !singleBarcode} className="!px-4 !py-2 whitespace-nowrap">
                                            Скачать PDF
                                        </SwissButton>
                                    </div>

                                    <div className="font-mono text-sm font-bold uppercase mb-4 border-b border-swiss-black pb-2">Статус операции</div>
                                    <div className="font-mono text-sm text-gray-600 mb-4">{status}</div>
                                    
                                    <div className="w-full bg-swiss-lightGray h-2 mb-2 border border-swiss-black overflow-hidden">
                                        <div className="bg-swiss-accent h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="font-mono text-xs text-right">{progress}%</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Ширина (мм)', name: 'width_mm' },
                                    { label: 'Высота (мм)', name: 'height_mm' },
                                    { label: 'Размер шрифта Баркода', name: 'font_size_barcode' },
                                    { label: 'Высота Баркода', name: 'barcode_height_mm' }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">{item.label}</label>
                                        <input 
                                            type={item.type || "number"} 
                                            name={item.name}
                                            value={config[item.name]} 
                                            onChange={handleConfigChange}
                                            className="w-full border-b border-swiss-black py-2 font-mono text-sm focus:outline-none focus:border-swiss-accent"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-dashed border-swiss-black p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-swiss-lightGray transition-colors" onClick={() => fileInputRef.current.click()}>
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                    />
                                    <span className="font-mono text-sm uppercase tracking-widest font-bold text-center">
                                        {file ? file.name : '1. ЗАГРУЗИТЬ CSV ФАЙЛ'}
                                    </span>
                                </div>
                                
                                <SwissButton variant="primary" onClick={startGeneration} disabled={isGenerating || !file} className="w-full">
                                    {isGenerating ? 'ГЕНЕРАЦИЯ АРХИВА...' : '2. СГЕНЕРИРОВАТЬ ZIP'}
                                </SwissButton>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <SwissButton variant="secondary" onClick={downloadTemplate} className="w-full">
                                    Скачать шаблон CSV
                                </SwissButton>
                                <SwissButton variant="secondary" onClick={downloadPreview} disabled={!previewUrl} className="w-full">
                                    Скачать тестовый PDF
                                </SwissButton>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => (
            <>
                <NavHeader />
                <Ean13GeneratorApp />
            </>
        );

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);