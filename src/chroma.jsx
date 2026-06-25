import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';



        const NavHeader = () => (
            <nav className="swiss-border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <a href="../index.html" className="font-mono font-bold text-xl tracking-tighter hover:text-swiss-accent swiss-transition flex items-center gap-2">
                        <img src="../logo.svg" alt="Logo" className="h-6" />
                        <span>P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span></span>
                    </a>
                    <span className="font-mono text-sm text-gray-500 bg-swiss-light px-2 py-1 swiss-border">/ chroma-color-tools</span>
                </div>
            </nav>
        );

        const SwissButton = ({ children, variant = 'primary', className = '', onClick }) => {
            const styles = {
                primary: 'bg-swiss-black text-swiss-white border border-swiss-black hover:bg-swiss-accent hover:border-swiss-accent',
                secondary: 'bg-transparent text-swiss-black border border-swiss-black hover:bg-swiss-black hover:text-swiss-white',
            };
            return (
                <button 
                    onClick={onClick}
                    className={`${styles[variant]} font-mono font-bold text-sm tracking-widest uppercase px-6 py-3 transition-colors duration-200 rounded-none inline-block ${className}`}
                >
                    {children}
                </button>
            );
        };

        const ColorScaleApp = () => {
            const [color1, setColor1] = useState('#ff0000');
            const [color2, setColor2] = useState('#0000ff');
            const [steps, setSteps] = useState(7);
            const [mode, setMode] = useState('lch');
            const [copied, setCopied] = useState(null);

            let scale = [];
            try {
                scale = chroma.scale([color1, color2]).mode(mode).colors(steps);
            } catch (e) {
                console.error("Invalid color");
            }

            const copyColor = (color) => {
                navigator.clipboard.writeText(color);
                setCopied(color);
                setTimeout(() => setCopied(null), 1500);
            };

            const randomizeColors = () => {
                setColor1(chroma.random().hex());
                setColor2(chroma.random().hex());
            };

            const reverseColors = () => {
                const temp = color1;
                setColor1(color2);
                setColor2(temp);
            };

            const setComplementary = () => {
                try {
                    setColor2(chroma(color1).set('hsl.h', '+180').hex());
                } catch(e) {}
            };

            return (
                <div className="min-h-screen p-8 lg:p-16 flex flex-col items-center">
                    <div className="w-full max-w-5xl mb-8">
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-8 mb-4">Chroma.js Color Scale</h1>
                        <p className="font-mono text-gray-600">Генератор цветовых шкал и интерполяций на базе chroma.js.</p>
                    </div>

                    <div className="w-full max-w-5xl bg-white border border-swiss-black p-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs uppercase tracking-widest">Цвет 1</label>
                                <div className="flex gap-2">
                                    <input type="color" value={color1} onChange={e => setColor1(e.target.value)} />
                                    <input type="text" value={color1} onChange={e => setColor1(e.target.value)} className="border-b border-swiss-black font-mono text-sm px-2 w-full uppercase focus:outline-none focus:border-swiss-accent" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs uppercase tracking-widest">Цвет 2</label>
                                <div className="flex gap-2">
                                    <input type="color" value={color2} onChange={e => setColor2(e.target.value)} />
                                    <input type="text" value={color2} onChange={e => setColor2(e.target.value)} className="border-b border-swiss-black font-mono text-sm px-2 w-full uppercase focus:outline-none focus:border-swiss-accent" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs uppercase tracking-widest">Шагов ({steps})</label>
                                <input type="range" min="3" max="15" value={steps} onChange={e => setSteps(parseInt(e.target.value))} className="mt-2" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs uppercase tracking-widest">Режим (Mode)</label>
                                <select value={mode} onChange={e => setMode(e.target.value)} className="border border-swiss-black font-mono text-sm p-2 uppercase focus:outline-none focus:border-swiss-accent bg-transparent">
                                    <option value="rgb">RGB</option>
                                    <option value="hsl">HSL</option>
                                    <option value="lab">LAB</option>
                                    <option value="lch">LCH</option>
                                    <option value="lrgb">Linear RGB</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-swiss-black">
                            <SwissButton variant="secondary" onClick={randomizeColors} className="w-full">
                                Случайные цвета
                            </SwissButton>
                            <SwissButton variant="secondary" onClick={reverseColors} className="w-full">
                                Поменять местами
                            </SwissButton>
                            <SwissButton variant="secondary" onClick={setComplementary} className="w-full">
                                Комплементарный
                            </SwissButton>
                        </div>
                    </div>

                    <div className="w-full max-w-5xl">
                        <div className="swiss-grid-container grid" style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))` }}>
                            {scale.map((color, i) => {
                                const textColor = chroma(color).luminance() > 0.5 ? '#0A0A0A' : '#FFFFFF';
                                return (
                                    <div 
                                        key={i} 
                                        className="h-48 md:h-64 flex flex-col justify-end p-4 cursor-pointer relative group transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => copyColor(color)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-sm">
                                            <span className="font-mono text-xs font-bold bg-white text-black px-2 py-1">
                                                {copied === color ? 'СКОПИРОВАНО!' : 'КОПИРОВАТЬ'}
                                            </span>
                                        </div>
                                        <div className="font-mono text-xs font-bold uppercase tracking-widest z-10" style={{ color: textColor }}>
                                            {color}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => (
            <>
                <NavHeader />
                <ColorScaleApp />
            </>
        );

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);