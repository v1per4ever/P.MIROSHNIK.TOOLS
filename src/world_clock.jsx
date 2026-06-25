import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const allTimeZones = typeof Intl.supportedValuesOf !== 'undefined' 
    ? Intl.supportedValuesOf('timeZone') 
    : [
        "Europe/London", "America/New_York", "Asia/Tokyo", "Asia/Dubai", "Europe/Moscow", 
        "Asia/Singapore", "Australia/Sydney", "America/Los_Angeles", "UTC"
      ];

const Clock = ({ id, city, timeZone, onRemove }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    let timeString = "Invalid TZ";
    let dateString = "";
    try {
        timeString = new Intl.DateTimeFormat('ru-RU', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(time);

        dateString = new Intl.DateTimeFormat('ru-RU', {
            timeZone,
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }).format(time);
    } catch (e) {
        timeString = "Error";
        dateString = "Invalid Timezone";
    }

    return (
        <div className="swiss-border p-6 bg-white swiss-shadow-hover swiss-transition flex flex-col justify-between h-full relative group">
            <button 
                onClick={() => onRemove(id)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2 border-transparent group-hover:border-black hover:bg-black hover:text-white transition-colors text-xl leading-none"
                title="Удалить"
                aria-label="Удалить часы"
            >
                ×
            </button>
            <div>
                <h2 className="font-black text-2xl tracking-tighter uppercase mb-2 break-words pr-6">{city}</h2>
                <p className="font-mono text-sm text-gray-500 uppercase tracking-widest break-words">{timeZone}</p>
            </div>
            <div className="mt-8">
                <div className="font-mono font-bold text-4xl lg:text-5xl text-swiss-accent tracking-tighter">
                    {timeString}
                </div>
                <div className="font-mono text-sm mt-2 text-gray-600">
                    {dateString}
                </div>
            </div>
        </div>
    );
};

const AddClock = ({ onAdd }) => {
    const [selectedTz, setSelectedTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || allTimeZones[0]);
    const [city, setCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCity = city.trim() || selectedTz.split('/').pop().replace(/_/g, ' ');
        onAdd({ city: finalCity, timeZone: selectedTz });
        setCity('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-12 p-6 border-2 border-black bg-white flex flex-col md:flex-row gap-6 items-end">
            <div className="flex flex-col gap-2 flex-grow w-full md:w-auto">
                <label className="font-black uppercase tracking-tighter text-sm">Часовой пояс</label>
                <select 
                    value={selectedTz} 
                    onChange={e => setSelectedTz(e.target.value)}
                    className="border-2 border-black p-3 font-mono text-sm focus:outline-none focus:border-swiss-accent transition-colors w-full"
                >
                    {allTimeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-2 flex-grow w-full md:w-auto">
                <label className="font-black uppercase tracking-tighter text-sm">Название (опционально)</label>
                <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    className="border-2 border-black p-3 font-mono text-sm focus:outline-none focus:border-swiss-accent transition-colors w-full"
                    placeholder="Например: Офис"
                />
            </div>
            <button type="submit" className="border-2 border-black bg-black text-white px-8 py-3 font-black uppercase tracking-tighter hover:bg-swiss-accent hover:border-swiss-accent transition-colors whitespace-nowrap w-full md:w-auto">
                Добавить часы
            </button>
        </form>
    );
};

const WorldClockApp = () => {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    
    const defaultClocks = [
        { id: '1', city: "Ваше время", timeZone: localTimeZone },
        { id: '2', city: "Лондон", timeZone: "Europe/London" },
        { id: '3', city: "Нью-Йорк", timeZone: "America/New_York" },
        { id: '4', city: "Токио", timeZone: "Asia/Tokyo" },
        { id: '5', city: "Дубай", timeZone: "Asia/Dubai" },
        { id: '6', city: "Москва", timeZone: "Europe/Moscow" },
        { id: '7', city: "Сингапур", timeZone: "Asia/Singapore" },
        { id: '8', city: "Сидней", timeZone: "Australia/Sydney" },
        { id: '9', city: "Лос-Анджелес", timeZone: "America/Los_Angeles" }
    ];

    const [clocks, setClocks] = useState(() => {
        try {
            const saved = localStorage.getItem('pmtools_world_clocks');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load clocks from localStorage", e);
        }
        return defaultClocks;
    });

    useEffect(() => {
        localStorage.setItem('pmtools_world_clocks', JSON.stringify(clocks));
    }, [clocks]);

    const handleAdd = (newClock) => {
        setClocks([...clocks, { ...newClock, id: Date.now().toString() }]);
    };

    const handleRemove = (idToRemove) => {
        setClocks(clocks.filter(c => c.id !== idToRemove));
    };

    return (
        <div className="min-h-screen bg-swiss-app">
            <nav className="swiss-border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <a href="../index.html" className="font-mono font-bold text-xl tracking-tighter hover:text-swiss-accent swiss-transition flex items-center gap-2">
                        <img src="../logo.svg" alt="Logo" className="h-6" />
                        <span>P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span></span>
                    </a>
                    <span className="font-mono text-sm text-gray-500 bg-swiss-light px-2 py-1 swiss-border">/ world-clock</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8 py-12">
                <div className="mb-12 border-b-2 border-black pb-8">
                    <h1 className="font-black text-5xl md:text-7xl tracking-tighter uppercase leading-none mb-4">
                        Мировое <br/><span className="text-swiss-accent">Время</span>
                    </h1>
                    <p className="font-mono text-gray-600 max-w-lg leading-relaxed">
                        Синхронизированное мировое время. Добавляйте любые часовые пояса и сохраняйте свой дашборд.
                    </p>
                </div>

                <AddClock onAdd={handleAdd} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clocks.map((clock) => (
                        <Clock 
                            key={clock.id} 
                            id={clock.id}
                            city={clock.city} 
                            timeZone={clock.timeZone} 
                            onRemove={handleRemove}
                        />
                    ))}
                    {clocks.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-gray-400 p-12 text-center text-gray-500 font-mono">
                            Нет активных часов. Добавьте их выше!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<WorldClockApp />);
