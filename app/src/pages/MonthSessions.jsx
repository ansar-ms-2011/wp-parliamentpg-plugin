import React, { useState, useEffect } from "react";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isWithinInterval,
    parseISO,
    format
} from "date-fns";

const MonthSessions = ({ id, url, month }) => {

    const settings = window.myPluginData || {};

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const currentMonth = month ?? new Date().getMonth();

    useEffect(() => {
        fetchSessions({ month: currentMonth + 1 });
    }, []);

    const fetchSessions = (filters = {}) => {

        const params = new URLSearchParams(filters);

        setLoading(true);

        fetch(`${settings.root + url}?${params}`, {
            headers: { "X-WP-Nonce": settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setSessions(data?.parliamentSessions || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    const monthStart = startOfMonth(new Date(new Date().getFullYear(), currentMonth));
    const monthEnd = endOfMonth(monthStart);

    const days = eachDayOfInterval({
        start: monthStart,
        end: monthEnd
    });

    const startWeekday = monthStart.getDay();

    const emptyCells = Array.from({ length: startWeekday });

    const checkSession = (date) => {

        const daySessions = sessions.filter(session => {

            const start = parseISO(session.date_from);
            const end = parseISO(session.date_to);

            return isWithinInterval(date, { start, end });
        });
        console.log(daySessions);
        return {
            hasSession: daySessions.length > 0,
            sessions: daySessions
        };
    };

    return (
        <div className="elementor-widget-container session-calendar">

            {/* Month Title */}
            <div className="session-calendar-header">
                {format(monthStart, "MMMM yyyy")}
            </div>

            {/* Week Labels */}
            <div className="session-calendar-weekdays">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            {!loading && (
                <div className="session-calendar-grid">

                    {/* Empty cells before month start */}
                    {emptyCells.map((_, i) => (
                        <div key={"empty-" + i} className="calendar-day empty"></div>
                    ))}

                    {/* Actual days */}
                    {days.map(day => {

                        const result = checkSession(day);

                        return (
                            <div
                                key={day}
                                className={`calendar-day ${result.hasSession ? "has-session" : ""}`}
                                data-date={format(day,"yyyy-MM-dd")}
                            >

                                <span className="day-number">
                                  {format(day,"d")}
                                </span>

                                {result.hasSession && (
                                    <div className="calendar-tooltip">
                                        <div className="tooltip-header-wrapper">
                                            <strong>Parliament Sessions ({result.sessions.length})</strong>
                                        </div>
                                        <ul>
                                            {result.sessions.map(session => (
                                                <li key={session.id}>{session.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {loading && (
                <div className="calendar-loading">
                    Loading sessions...
                </div>
            )}

        </div>
    );
};

export default MonthSessions;