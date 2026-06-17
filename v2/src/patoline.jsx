import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';



        const NavHeader = () => (
            <nav className="swiss-border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <a href="../index.html" className="font-mono font-bold text-xl tracking-tighter hover:text-swiss-accent swiss-transition">
                        P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                    </a>
                    <span className="font-mono text-sm text-gray-500 bg-swiss-light px-2 py-1 swiss-border">/ patoline</span>
                </div>
            </nav>
        );

        const SwissButton = ({ children, variant = 'primary', className = '', onClick }) => {
            const styles = {
                primary: 'bg-swiss-black text-swiss-white border-2 border-swiss-black hover:bg-swiss-accent hover:border-swiss-accent',
                secondary: 'bg-transparent text-swiss-black border-2 border-swiss-black hover:bg-swiss-black hover:text-swiss-white',
            };
            return (
                <button 
                    onClick={onClick}
                    className={`${styles[variant]} font-mono font-bold text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-200 rounded-none inline-block ${className}`}
                >
                    {children}
                </button>
            );
        };

        const PatolineApp = () => {
            const canvasRef = useRef(null);
            const containerRef = useRef(null);
            const animationId = useRef(null);
            const drawProgress = useRef(0);
            const [params, setParams] = useState({
                type: 'hypotrochoid',
                R: 300,
                r: 79,
                d: 200,
                revs: 50,
                thickness: 0.6,
                color: '#000000',
                bgColor: '#FFFFFF',
                dist1: 0,
                dist2: 0,
                pressure: false,
                pressureIntensity: 80,
                animate: false
            });

            const paramsRef = useRef(params);
            useEffect(() => {
                paramsRef.current = params;
            }, [params]);

            const stepSize = 0.01;

            const updateParam = (key, value) => {
                setParams(prev => ({ ...prev, [key]: value }));
            };

            const randomize = () => {
                setParams(prev => ({
                    ...prev,
                    R: Math.floor(Math.random() * 290) + 10,
                    r: Math.floor(Math.random() * 150) + 1,
                    d: Math.floor(Math.random() * 200),
                    dist1: Math.floor(Math.random() * 50),
                    dist2: Math.floor(Math.random() * 50)
                }));
            };

            const exportPNG = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                
                if (params.animate && drawProgress.current < params.revs * Math.PI * 2) {
                    drawInstant();
                }
                
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `patoline-${Date.now()}.png`;
                link.href = dataURL;
                link.click();
            };

            const exportSVG = () => {
                const container = containerRef.current;
                if (!container) return;
                
                const logicalWidth = container.clientWidth;
                const logicalHeight = container.clientHeight;
                const cx = logicalWidth / 2;
                const cy = logicalHeight / 2;
                const currentParams = paramsRef.current;
                const maxTheta = currentParams.revs * Math.PI * 2;
                
                let svgContent = "";
                let pathData = "";
                let prevPt = getPoint(0, currentParams, logicalWidth, logicalHeight);
                pathData += `M ${cx + prevPt.x} ${cy + prevPt.y} `;

                for (let t = stepSize; t <= maxTheta; t += stepSize) {
                    const pt = getPoint(t, currentParams, logicalWidth, logicalHeight);
                    if (Math.abs(pt.x - prevPt.x) > logicalWidth / 4 || Math.abs(pt.y - prevPt.y) > logicalHeight / 4) {
                        pathData += `M ${cx + pt.x} ${cy + pt.y} `;
                    } else {
                        pathData += `L ${cx + pt.x} ${cy + pt.y} `;
                        if (currentParams.pressure) {
                            const dynamicWidth = currentParams.thickness * (1 + (currentParams.pressureIntensity / 100) * Math.sin(t));
                            svgContent += `<line x1="${cx + prevPt.x}" y1="${cy + prevPt.y}" x2="${cx + pt.x}" y2="${cy + pt.y}" stroke="${currentParams.color}" stroke-width="${Math.max(0.01, dynamicWidth)}" stroke-linecap="round" />\n`;
                        }
                    }
                    prevPt = pt;
                }

                if (!currentParams.pressure) {
                    svgContent = `<path d="${pathData}" fill="none" stroke="${currentParams.color}" stroke-width="${currentParams.thickness}" stroke-linecap="round" stroke-linejoin="round" />`;
                }

                const svgString = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${logicalWidth}" height="${logicalHeight}" viewBox="0 0 ${logicalWidth} ${logicalHeight}">
                        <rect width="100%" height="100%" fill="${currentParams.bgColor}" />
                        ${svgContent}
                    </svg>
                `;

                const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `patoline-${Date.now()}.svg`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            };

            const syncCanvasSize = () => {
                const canvas = canvasRef.current;
                const container = containerRef.current;
                if (!canvas || !container) return false;
                
                const dpr = window.devicePixelRatio || 1;
                const rect = container.getBoundingClientRect();
                const physicalWidth = rect.width * dpr;
                const physicalHeight = rect.height * dpr;
                
                if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
                    canvas.width = physicalWidth;
                    canvas.height = physicalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.scale(dpr, dpr);
                    return true;
                }
                return false;
            };

            const getPoint = (theta, p, width, height) => {
                const { R, r, d, type, revs } = p;
                let x, y;

                if (type === 'hypotrochoid') {
                    const lobeFreq = p.dist1 || 0; 
                    const lobeAmp = p.dist2 || 0; 
                    const R_eff = R + Math.sin(theta * lobeFreq) * lobeAmp;
                    
                    x = (R_eff - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
                    y = (R_eff - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
                } else if (type === 'epitrochoid') {
                    const lobeFreq = p.dist1 || 0; 
                    const lobeAmp = p.dist2 || 0; 
                    const R_eff = R + Math.sin(theta * lobeFreq) * lobeAmp;
                    
                    x = (R_eff + r) * Math.cos(theta) - d * Math.cos(((R + r) / r) * theta);
                    y = (R_eff + r) * Math.sin(theta) - d * Math.sin(((R + r) / r) * theta);
                } else if (type === 'linear') {
                    const maxT = revs * Math.PI * 2;
                    const totalWidth = width * 0.9;
                    const startX = -totalWidth / 2;
                    const progress = maxT > 0 ? theta / maxT : 0;
                    
                    const dist1 = p.dist1 || 0;
                    const dist2 = p.dist2 || 0;
                    
                    const x_center = startX + progress * totalWidth;
                    const waveX = Math.sin(progress * Math.PI * 2 * (dist1 / 5)) * (dist1 * 2);
                    const rippleY = Math.sin(progress * Math.PI * 2 * dist2) * dist2;
                    
                    const waveY = Math.sin(progress * Math.PI * 2 * (R / 50)) * r + rippleY;
                    
                    x = x_center - d * Math.sin(theta) + waveX;
                    y = waveY - d * Math.cos(theta);
                } else if (type === 'sine_ribbon') {
                    const maxT = revs * Math.PI * 2;
                    const totalWidth = width * 1.5; 
                    const startX = -totalWidth / 2;
                    const progress = maxT > 0 ? theta / maxT : 0;
                    
                    const macroFreq = Math.max(0.1, (p.dist1 / 100) * 5); 
                    const macroAmp = R;
                    const macroPhase = progress * Math.PI * 2 * macroFreq;
                    
                    const x_base = startX + progress * totalWidth;
                    const y_base = Math.sin(macroPhase) * macroAmp;
                    
                    const dx = totalWidth; 
                    const dy = macroAmp * Math.PI * 2 * macroFreq * Math.cos(macroPhase);
                    const angle = Math.atan2(dy, dx);
                    
                    const localFreq = Math.max(0.1, (p.dist2 / 100) * 50);
                    const localPhase = progress * Math.PI * 2 * localFreq;
                    
                    const x_local = - d * Math.sin(theta);
                    const y_local = - d * Math.cos(theta) + r * Math.sin(localPhase);
                    
                    x = x_base + x_local * Math.cos(angle) - y_local * Math.sin(angle);
                    y = y_base + x_local * Math.sin(angle) + y_local * Math.cos(angle);
                } else if (type === 'sine_guilloche') {
                    const totalLines = Math.max(1, Math.floor(revs));
                    const lineIndex = Math.floor(theta / (Math.PI * 2));
                    const localTheta = theta % (Math.PI * 2); 
                    const totalWidth = width * 0.9;
                    
                    const progress = localTheta / (Math.PI * 2);
                    const x_base = -totalWidth/2 + progress * totalWidth;
                    
                    const phaseOffset = (lineIndex / totalLines) * Math.PI * 2;
                    const fastPhase = progress * Math.PI * 2 * R + phaseOffset;
                    
                    const slowFreq = Math.max(1, Math.floor(R / 10)); 
                    const envelope = d + r * Math.sin(progress * Math.PI * 2 * slowFreq);
                    
                    const y_val = (envelope / 2) * (1 - Math.cos(fastPhase));
                    
                    x = x_base;
                    y = y_val - d;
                }
                
                return { x, y };
            };

            const drawInstant = () => {
                syncCanvasSize();
                const canvas = canvasRef.current;
                const container = containerRef.current;
                const ctx = canvas.getContext('2d');
                
                const logicalWidth = container.clientWidth;
                const logicalHeight = container.clientHeight;
                
                ctx.clearRect(0, 0, logicalWidth, logicalHeight);
                
                const cx = logicalWidth / 2;
                const cy = logicalHeight / 2;
                const currentParams = paramsRef.current;
                const maxTheta = currentParams.revs * Math.PI * 2;
                
                ctx.strokeStyle = currentParams.color;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                let prevPt = getPoint(0, currentParams, logicalWidth, logicalHeight);

                if (currentParams.pressure) {
                    for (let t = stepSize; t <= maxTheta; t += stepSize) {
                        const pt = getPoint(t, currentParams, logicalWidth, logicalHeight);
                        if (Math.abs(pt.x - prevPt.x) <= logicalWidth / 4 && Math.abs(pt.y - prevPt.y) <= logicalHeight / 4) {
                            ctx.beginPath();
                            ctx.moveTo(cx + prevPt.x, cy + prevPt.y);
                            ctx.lineTo(cx + pt.x, cy + pt.y);
                            const dynamicWidth = currentParams.thickness * (1 + (currentParams.pressureIntensity / 100) * Math.sin(t));
                            ctx.lineWidth = Math.max(0.01, dynamicWidth);
                            ctx.stroke();
                        }
                        prevPt = pt;
                    }
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = currentParams.thickness;
                    ctx.moveTo(cx + prevPt.x, cy + prevPt.y);

                    for (let t = stepSize; t <= maxTheta; t += stepSize) {
                        const pt = getPoint(t, currentParams, logicalWidth, logicalHeight);
                        if (Math.abs(pt.x - prevPt.x) > logicalWidth / 4 || Math.abs(pt.y - prevPt.y) > logicalHeight / 4) {
                            ctx.moveTo(cx + pt.x, cy + pt.y);
                        } else {
                            ctx.lineTo(cx + pt.x, cy + pt.y);
                        }
                        prevPt = pt;
                    }

                    ctx.stroke();
                }
            };

            const animateDraw = () => {
                const canvas = canvasRef.current;
                const container = containerRef.current;
                if (!canvas || !container) return;
                const ctx = canvas.getContext('2d');
                
                const logicalWidth = container.clientWidth;
                const logicalHeight = container.clientHeight;
                
                const cx = logicalWidth / 2;
                const cy = logicalHeight / 2;
                const currentParams = paramsRef.current;
                const maxTheta = currentParams.revs * Math.PI * 2;
                const drawSpeed = 2; 
                
                ctx.strokeStyle = currentParams.color;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                let prevPt = getPoint(drawProgress.current, currentParams, logicalWidth, logicalHeight);
                const targetProgress = Math.min(drawProgress.current + drawSpeed, maxTheta);
                
                if (currentParams.pressure) {
                    for (let t = drawProgress.current + stepSize; t <= targetProgress; t += stepSize) {
                        const pt = getPoint(t, currentParams, logicalWidth, logicalHeight);
                        if (Math.abs(pt.x - prevPt.x) <= logicalWidth / 4 && Math.abs(pt.y - prevPt.y) <= logicalHeight / 4) {
                            ctx.beginPath();
                            ctx.moveTo(cx + prevPt.x, cy + prevPt.y);
                            ctx.lineTo(cx + pt.x, cy + pt.y);
                            const dynamicWidth = currentParams.thickness * (1 + (currentParams.pressureIntensity / 100) * Math.sin(t));
                            ctx.lineWidth = Math.max(0.01, dynamicWidth);
                            ctx.stroke();
                        }
                        prevPt = pt;
                    }
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = currentParams.thickness;
                    ctx.moveTo(cx + prevPt.x, cy + prevPt.y);

                    for (let t = drawProgress.current + stepSize; t <= targetProgress; t += stepSize) {
                        const pt = getPoint(t, currentParams, logicalWidth, logicalHeight);
                        if (Math.abs(pt.x - prevPt.x) > logicalWidth / 4 || Math.abs(pt.y - prevPt.y) > logicalHeight / 4) {
                            ctx.moveTo(cx + pt.x, cy + pt.y);
                        } else {
                            ctx.lineTo(cx + pt.x, cy + pt.y);
                        }
                        prevPt = pt;
                    }

                    ctx.stroke();
                }
                
                drawProgress.current = targetProgress;

                if (drawProgress.current < maxTheta) {
                    animationId.current = requestAnimationFrame(animateDraw);
                }
            };

            useEffect(() => {
                const handleResize = () => {
                    syncCanvasSize();
                    
                    if (animationId.current) cancelAnimationFrame(animationId.current);
                    drawProgress.current = 0;
                    
                    const canvas = canvasRef.current;
                    const container = containerRef.current;
                    const ctx = canvas.getContext('2d');
                    
                    if (paramsRef.current.animate) {
                        ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
                        animateDraw();
                    } else {
                        drawInstant();
                    }
                };

                // Initial setup + wait for layout
                setTimeout(handleResize, 50);
                
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, []);

            useEffect(() => {
                if (animationId.current) cancelAnimationFrame(animationId.current);
                drawProgress.current = 0;
                
                syncCanvasSize();
                
                const canvas = canvasRef.current;
                const container = containerRef.current;
                const ctx = canvas.getContext('2d');
                
                if (params.animate) {
                    ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
                    animateDraw();
                } else {
                    drawInstant();
                }
            }, [params]);

            return (
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-68px)]">
                    {/* Control Panel */}
                    <div className="w-full lg:w-80 bg-white swiss-border-r p-6 flex flex-col gap-6 overflow-y-auto h-auto lg:h-[calc(100vh-68px)] shrink-0">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Patoline</h1>
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Guilloche Generator</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest">Pattern Type</label>
                                <select 
                                    className="swiss-border p-2 font-mono text-sm bg-white outline-none focus:border-swiss-accent"
                                    value={params.type}
                                    onChange={(e) => updateParam('type', e.target.value)}
                                >
                                    <option value="hypotrochoid">Hypotrochoid (Inner)</option>
                                    <option value="epitrochoid">Epitrochoid (Outer)</option>
                                    <option value="linear">Linear Ribbon</option>
                                    <option value="sine_ribbon">Curved Ribbon</option>
                                    <option value="sine_guilloche">Sine Guilloche</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                    <span>Fixed Radius</span>
                                    <span className="text-swiss-accent">{params.R}</span>
                                </label>
                                <input type="range" min="10" max="300" value={params.R} onChange={(e) => updateParam('R', parseFloat(e.target.value))} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                    <span>Rolling Radius</span>
                                    <span className="text-swiss-accent">{params.r}</span>
                                </label>
                                <input type="range" min="1" max="150" value={params.r} onChange={(e) => updateParam('r', parseFloat(e.target.value))} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                    <span>Pen Offset</span>
                                    <span className="text-swiss-accent">{params.d}</span>
                                </label>
                                <input type="range" min="0" max="200" value={params.d} onChange={(e) => updateParam('d', parseFloat(e.target.value))} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                    <span>Revolutions</span>
                                    <span className="text-swiss-accent">{params.revs}</span>
                                </label>
                                <input type="range" min="1" max="300" value={params.revs} onChange={(e) => updateParam('revs', parseFloat(e.target.value))} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                    <span>Line Thickness</span>
                                    <span className="text-swiss-accent">{params.thickness}</span>
                                </label>
                                <input type="range" min="0.1" max="10" step="0.1" value={params.thickness} onChange={(e) => updateParam('thickness', parseFloat(e.target.value))} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest">Line Color</label>
                                <div className="flex gap-2">
                                    <input type="color" value={params.color} onChange={(e) => updateParam('color', e.target.value)} className="w-10 h-8 p-0 border-0" />
                                    <input type="text" value={params.color} onChange={(e) => updateParam('color', e.target.value)} className="swiss-border-b font-mono text-sm w-full uppercase focus:outline-none focus:border-swiss-accent bg-transparent px-1" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-mono text-xs font-bold uppercase tracking-widest">Background Color</label>
                                <div className="flex gap-2">
                                    <input type="color" value={params.bgColor} onChange={(e) => updateParam('bgColor', e.target.value)} className="w-10 h-8 p-0 border-0" />
                                    <input type="text" value={params.bgColor} onChange={(e) => updateParam('bgColor', e.target.value)} className="swiss-border-b font-mono text-sm w-full uppercase focus:outline-none focus:border-swiss-accent bg-transparent px-1" />
                                </div>
                            </div>

                            {params.type !== 'sine_guilloche' && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                            <span>
                                                {params.type === 'sine_ribbon' ? 'Macro Wave Freq' : 
                                                 (params.type === 'hypotrochoid' || params.type === 'epitrochoid') ? 'Radial Lobe Freq' :
                                                 'Wave X (Distortion)'}
                                            </span>
                                            <span className="text-swiss-accent">{params.dist1}</span>
                                        </label>
                                        <input type="range" min="0" max="100" value={params.dist1} onChange={(e) => updateParam('dist1', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold uppercase tracking-widest flex justify-between">
                                            <span>
                                                {params.type === 'sine_ribbon' ? 'Local Wave Freq' : 
                                                 (params.type === 'hypotrochoid' || params.type === 'epitrochoid') ? 'Radial Lobe Amp' :
                                                 'Ripple Y (Distortion)'}
                                            </span>
                                            <span className="text-swiss-accent">{params.dist2}</span>
                                        </label>
                                        <input type="range" min="0" max="100" value={params.dist2} onChange={(e) => updateParam('dist2', parseFloat(e.target.value))} />
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={params.pressure} 
                                        onChange={(e) => updateParam('pressure', e.target.checked)}
                                        className="w-4 h-4 accent-swiss-accent cursor-pointer"
                                    />
                                    <span className="font-mono text-xs font-bold uppercase tracking-widest">3D Pen Pressure</span>
                                </label>
                                {params.pressure && (
                                    <div className="flex flex-col gap-1 pl-6">
                                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest flex justify-between text-gray-500">
                                            <span>Intensity</span>
                                            <span>{params.pressureIntensity}%</span>
                                        </label>
                                        <input type="range" min="0" max="200" value={params.pressureIntensity} onChange={(e) => updateParam('pressureIntensity', parseFloat(e.target.value))} />
                                    </div>
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input 
                                    type="checkbox" 
                                    checked={params.animate} 
                                    onChange={(e) => updateParam('animate', e.target.checked)}
                                    className="w-4 h-4 accent-swiss-accent cursor-pointer"
                                />
                                <span className="font-mono text-xs font-bold uppercase tracking-widest">Animate Drawing</span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto pt-6 border-t-2 border-swiss-black">
                            <SwissButton variant="secondary" onClick={randomize} className="w-full text-center">Randomize Geometry</SwissButton>
                            <div className="flex gap-2">
                                <SwissButton variant="primary" onClick={exportPNG} className="w-full text-center">PNG</SwissButton>
                                <SwissButton variant="primary" onClick={exportSVG} className="w-full text-center">SVG</SwissButton>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative overflow-hidden" ref={containerRef} style={{ backgroundColor: params.bgColor }}>
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block"></canvas>
                    </div>
                </div>
            );
        };

        const App = () => (
            <>
                <NavHeader />
                <PatolineApp />
            </>
        );

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);