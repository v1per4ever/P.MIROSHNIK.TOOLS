import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Clock = ({ city, timeZone }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = new Intl.DateTimeFormat('ru-RU', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(time);

    const dateString = new Intl.DateTimeFormat('ru-RU', {
        timeZone,
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }).format(time);

    return (
        <div className="swiss-border p-6 bg-white swiss-shadow-hover swiss-transition flex flex-col justify-between h-full">
            <div>
                <h2 className="font-black text-2xl tracking-tighter uppercase mb-2">{city}</h2>
                <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">{timeZone}</p>
            </div>
            <div className="mt-8">
                <div className="font-mono font-bold text-5xl md:text-6xl text-swiss-accent tracking-tighter">
                    {timeString}
                </div>
                <div className="font-mono text-sm mt-2 text-gray-600">
                    {dateString}
                </div>
            </div>
        </div>
    );
};

const WorldClockApp = () => {
    const clocks = [
        { city: "Лондон", timeZone: "Europe/London" },
        { city: "Нью-Йорк", timeZone: "America/New_York" },
        { city: "Токио", timeZone: "Asia/Tokyo" },
        { city: "Дубай", timeZone: "Asia/Dubai" },
        { city: "Москва", timeZone: "Europe/Moscow" },
        { city: "Сингапур", timeZone: "Asia/Singapore" },
        { city: "Сидней", timeZone: "Australia/Sydney" },
        { city: "Лос-Анджелес", timeZone: "America/Los_Angeles" }
    ];

    return (
        <div className="min-h-screen bg-swiss-app">
            <nav className="swiss-nav border-b-2 border-black bg-white p-4">
                <div className="flex items-center gap-4 max-w-7xl mx-auto">
                    <a href="../index.html" className="font-black text-2xl tracking-tighter uppercase hover:text-swiss-accent transition-colors">
                        P.MIROSHNIK<span className="text-swiss-accent">.TOOLS</span>
                    </a>
                    <span className="font-mono text-sm tracking-widest text-gray-500 uppercase">/ world-clock</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 md:p-8 py-12">
                <div className="mb-12 border-b-2 border-black pb-8">
                    <h1 className="font-black text-5xl md:text-7xl tracking-tighter uppercase leading-none mb-4">
                        Мировое <br/><span className="text-swiss-accent">Время</span>
                    </h1>
                    <p className="font-mono text-gray-600 max-w-lg leading-relaxed">
                        Синхронизированное мировое время для основных финансовых и технологических хабов.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clocks.map((clock, index) => (
                        <Clock key={index} city={clock.city} timeZone={clock.timeZone} />
                    ))}
                </div>
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<WorldClockApp />);
