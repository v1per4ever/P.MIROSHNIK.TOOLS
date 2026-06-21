import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';



        const SwissButton = ({ children, variant = 'primary', className = '', onClick, href }) => {
            const styles = {
                primary: 'bg-swiss-black text-swiss-white border border-swiss-black hover:bg-swiss-accent hover:border-swiss-accent',
                secondary: 'bg-transparent text-swiss-black border border-swiss-black hover:bg-swiss-black hover:text-swiss-white',
            };

            const content = (
                <div className="flex items-center justify-center gap-3">
                    {children}
                    {variant === 'primary' && <span className="text-lg leading-none">→</span>}
                </div>
            );

            const classes = `${styles[variant]} font-mono font-bold text-sm tracking-widest uppercase px-8 py-4 transition-colors duration-200 rounded-none inline-block ${className}`;

            if (href) {
                return (
                    <a href={href} className={classes}>
                        {content}
                    </a>
                );
            }

            return (
                <button onClick={onClick} className={classes}>
                    {content}
                </button>
            );
        };

        const ToolCard = ({ title, content, link, number }) => {
            return (
                <div className="swiss-grid-item p-8 lg:p-12 flex flex-col h-full hover:bg-swiss-lightGray transition-colors duration-300 relative group">
                    <div className="font-mono text-swiss-accent font-bold mb-6 text-sm tracking-widest">{number}</div>
                    <h3 className="font-bold text-2xl lg:text-3xl mb-4 text-swiss-black leading-tight tracking-tight">{title}</h3>
                    <p className="text-gray-600 leading-relaxed font-mono text-sm flex-grow mb-8">{content}</p>
                    <div className="mt-auto">
                        <SwissButton variant="secondary" href={link} className="w-full text-center">
                            ОТКРЫТЬ УТИЛИТУ
                        </SwissButton>
                    </div>
                </div>
            );
        };

        const Marquee = ({ text }) => (
            <div className="overflow-hidden py-4 border-y border-swiss-black bg-swiss-white relative z-10 flex">
                <div className="marquee-container animate-marquee">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="font-mono font-bold text-sm tracking-widest text-swiss-black mx-8 whitespace-nowrap uppercase">
                            {text} <span className="mx-8 text-swiss-accent">/</span>
                        </span>
                    ))}
                </div>
            </div>
        );

        const Hero = () => (
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 border-b border-swiss-black flex items-center">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    <div className="lg:col-span-8">
                        <div className="inline-flex items-center gap-3 border border-swiss-black px-4 py-2 mb-12">
                            <span className="w-2 h-2 bg-swiss-accent"></span>
                            <span className="font-mono text-xs font-bold tracking-widest uppercase text-swiss-black">ПРИВАТНЫЙ ДАШБОРД</span>
                        </div>
                        <h1 className="font-black text-5xl md:text-7xl lg:text-[5rem] xl:text-[6rem] leading-[0.9] mb-8 text-swiss-black tracking-tighter uppercase break-words">
                            Мои <br/>
                            <span className="text-swiss-accent">Инструменты</span>.
                        </h1>
                        <p className="font-mono text-base md:text-lg mb-12 text-gray-600 max-w-lg leading-relaxed">
                            Единая точка входа для всех рабочих утилит. Строгий дизайн, быстрый доступ, никаких лишних деталей.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <SwissButton variant="primary" onClick={() => document.getElementById('tools').scrollIntoView({behavior: 'smooth'})}>
                                К СПИСКУ УТИЛИТ
                            </SwissButton>
                        </div>
                    </div>
                    
                    <div className="hidden lg:block lg:col-span-4 relative">
                        <div className="border border-swiss-black p-8 bg-swiss-lightGray h-full">
                            <div className="border-b border-swiss-black pb-4 mb-6 flex justify-between font-mono text-xs text-gray-500 uppercase tracking-widest">
                                <span>Dashboard.status()</span>
                                <span>Online</span>
                            </div>
                            <div className="font-mono text-sm leading-loose text-swiss-black">
                                <div className="text-gray-400 mb-4">// Системная сводка</div>
                                <div className="flex justify-between border-b border-gray-300 py-1">
                                    <span>Утилит</span><span className="font-bold text-swiss-accent">5 активны</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 py-1">
                                    <span>Доступ</span><span className="font-bold">Приватный</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-300 py-1">
                                    <span>Анимации</span><span className="font-bold text-gray-400">В ожидании</span>
                                </div>
                                <div className="mt-8 text-gray-400">// Готовность к работе</div>
                                <div className="mt-2 text-swiss-black flex items-center gap-2">
                                    <span>[OK] Все системы в норме</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-swiss-accent">root@mytools:~$</span>
                                    <span className="w-2 h-4 bg-swiss-black animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );

        const ToolsGrid = ({ onOpenFeedback }) => {
            const tools = [
                {
                    title: "WB XLSX CSV Sanitizer",
                    content: "Утилита для очистки и форматирования файлов XLSX/CSV для маркетплейса Wildberries. Автоматизирует рутину подготовки данных.",
                    link: "./my/WB XLSX CSV Sanitizer.html"
                },
                {
                    title: "Linguistic Ribbon Editor",
                    content: "Мощный редактор для лингвистической разметки и анализа текста. Удобный интерфейс для работы со сложными текстовыми массивами.",
                    link: "./my/linguistic_ribbon_editor.html"
                },
                {
                    title: "Chroma.js Color Tool",
                    content: "Генератор цветовых шкал и интерполяций. Удобный подбор и конвертация цветов для разработки с использованием библиотеки chroma.js.",
                    link: "./my/chroma_color_tools.html"
                },
                {
                    title: "Генератор штрих-кодов",
                    content: "Браузерная утилита для массовой генерации PDF-этикеток Code128 из CSV-файлов. Вся обработка на стороне клиента без использования серверов.",
                    link: "./my/barcode_generator.html"
                },
                {
                    title: "Patoline Generator",
                    content: "Генератор гильоширных узоров (Guilloche) и спирографов. Настраиваемая геометрия, множество паттернов и выгрузка результатов в PNG и SVG.",
                    link: "./my/patoline.html"
                },
                {
                    title: "GenArt Shape Generator",
                    content: "Утилита для генерации ASCII-подобного паттерна из изображений. Поддерживает символы, иконки, геометрические фигуры.",
                    link: "./my/gen_shape.html"
                }
            ];

            return (
                <section className="bg-swiss-lightGray border-b border-swiss-black" id="tools">
                    <div className="border-b border-swiss-black px-4 py-16">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] max-w-2xl">
                                Каталог утилит
                            </h2>
                            <p className="font-mono text-sm text-gray-600 max-w-sm leading-relaxed">
                                Список доступных инструментов. Новые утилиты будут добавляться сюда по мере разработки.
                            </p>
                        </div>
                    </div>
                    
                    <div className="swiss-grid-container grid grid-cols-1 md:grid-cols-3">
                        {tools.map((tool, index) => (
                            <ToolCard 
                                key={index}
                                number={`0${index + 1}.`}
                                title={tool.title}
                                content={tool.content}
                                link={tool.link}
                            />
                        ))}
                        <div className="swiss-grid-item p-8 lg:p-12 flex flex-col h-full hover:bg-swiss-lightGray transition-colors duration-300 relative group">
                            <div className="font-mono text-swiss-accent font-bold mb-6 text-sm tracking-widest">FEEDBACK.</div>
                            <h3 className="font-bold text-2xl lg:text-3xl mb-4 text-swiss-black leading-tight tracking-tight">Предложить инструмент</h3>
                            <p className="text-gray-600 leading-relaxed font-mono text-sm flex-grow mb-8">
                                Не нашли подходящей утилиты? Расскажите о своей задаче, и мы добавим нужный инструмент в этот каталог.
                            </p>
                            <div className="mt-auto">
                                <SwissButton variant="secondary" onClick={onOpenFeedback} className="w-full text-center border-dashed border-2 hover:border-solid">
                                    НАПИСАТЬ ИДЕЮ
                                </SwissButton>
                            </div>
                        </div>
                    </div>
                </section>
            );
        };

        const Footer = () => (
            <footer className="bg-swiss-black text-swiss-white px-4 py-12 md:py-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 border-b border-gray-800 pb-12">
                    <div>
                        <div className="font-black text-4xl md:text-5xl tracking-tighter uppercase leading-none mb-4">
                            P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                        </div>
                        <p className="font-mono text-sm text-gray-500 max-w-xs mb-6">Собственная экосистема рабочих инструментов.</p>
                        <p className="font-mono text-xs text-gray-500">
                            Useful links for agents: <a href="/.well-known/api-catalog" className="text-swiss-accent hover:underline">API catalog</a>, <a href="/.well-known/agent-skills/index.json" className="text-swiss-accent hover:underline">skills index</a>, <a href="/llms.txt" className="text-swiss-accent hover:underline">llms.txt</a>.
                        </p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row justify-between items-start md:items-center font-mono text-xs text-gray-600 uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} PRIVATE DASHBOARD.</span>
                    <span>ALL RIGHTS RESERVED.</span>
                </div>
            </footer>
        );

        const FeedbackModal = ({ isOpen, onClose }) => {
            const [status, setStatus] = useState('idle');

            React.useEffect(() => {
                if (!isOpen) {
                    setTimeout(() => setStatus('idle'), 300);
                }
            }, [isOpen]);

            const handleSubmit = (e) => {
                e.preventDefault();
                setStatus('submitting');
                
                const myForm = e.target;
                const formData = new FormData(myForm);
                
                fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => setStatus('success'))
                .catch((error) => {
                    console.error("Form submission error", error);
                    setStatus('error');
                });
            };

            if (!isOpen) return null;

            return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-swiss-white border-2 border-swiss-black swiss-shadow max-w-md w-full relative">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-2xl font-bold hover:text-swiss-accent transition-colors leading-none"
                        >
                            &times;
                        </button>
                        <div className="p-8">
                            <h2 className="font-black text-2xl tracking-tighter uppercase mb-6">Оставить идею</h2>
                            
                            {status === 'success' ? (
                                <div className="font-mono text-swiss-black border-2 border-swiss-black p-4 bg-swiss-lightGray">
                                    <p className="text-xl font-bold mb-2">Отправлено!</p>
                                    <p className="text-sm">Спасибо за вашу идею. Мы обязательно ее рассмотрим.</p>
                                </div>
                            ) : (
                                <form name="feedback" method="POST" data-netlify="true" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <input type="hidden" name="form-name" value="feedback" />
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold tracking-widest uppercase">Email для связи</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            required 
                                            className="border-b-2 border-swiss-black p-2 font-mono text-sm focus:outline-none focus:border-swiss-accent bg-transparent"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold tracking-widest uppercase">Ваша идея</label>
                                        <textarea 
                                            name="message" 
                                            required 
                                            rows="4"
                                            className="border-2 border-swiss-black p-2 font-mono text-sm focus:outline-none focus:border-swiss-accent bg-transparent resize-none"
                                            placeholder="Опишите, какой инструмент вам нужен..."
                                        ></textarea>
                                    </div>
                                    
                                    {status === 'error' && (
                                        <p className="text-red-500 font-mono text-xs">Произошла ошибка при отправке. Попробуйте еще раз.</p>
                                    )}
                                    
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'}
                                        className="bg-swiss-black text-swiss-white border border-swiss-black hover:bg-swiss-accent hover:border-swiss-accent font-mono font-bold text-sm tracking-widest uppercase px-6 py-3 transition-colors duration-200 rounded-none w-full mt-4 disabled:opacity-50"
                                    >
                                        {status === 'submitting' ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => {
            const [scrolled, setScrolled] = useState(false);
            const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
            
            useEffect(() => {
                const handleScroll = () => setScrolled(window.scrollY > 20);
                window.addEventListener('scroll', handleScroll);
                return () => window.removeEventListener('scroll', handleScroll);
            }, []);

            return (
                <div className="antialiased flex flex-col min-h-screen">
                    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-swiss-white border-b border-swiss-black py-4' : 'bg-transparent py-6'}`}>
                        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                            <div className="font-black text-2xl tracking-tighter uppercase text-swiss-black">
                                P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                            </div>
                        </div>
                    </nav>

                    <Hero />
                    <Marquee text="БЫСТРЫЙ ДОСТУП / ЧИСТЫЙ КОД / РАБОЧИЕ ИНСТРУМЕНТЫ" />
                    <ToolsGrid onOpenFeedback={() => setIsFeedbackOpen(true)} />
                    <Footer />

                    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                </div>
            );
        };

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);