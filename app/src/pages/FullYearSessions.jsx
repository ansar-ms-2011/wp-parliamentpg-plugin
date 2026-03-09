import React, {useState, useEffect} from "react";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isWithinInterval,
    parseISO,
    format
} from "date-fns";
import {Col, Row} from "react-bootstrap";

const FullYearSessions = ({id, url}) => {

    const settings = window.myPluginData || {};

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const months = Array.from({length: 12}, (_, i) => i);

    useEffect(() => {
        fetchSessions({year: currentYear});
    }, [currentYear]);

    const fetchSessions = (filters = {}) => {

        const params = new URLSearchParams(filters);

        setLoading(true);

        fetch(`${settings.root + url}?${params}`, {
            headers: {"X-WP-Nonce": settings.nonce}
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setSessions(data?.parliamentSessions || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    const checkSession = (date) => {

        const daySessions = sessions.filter(session => {

            const start = parseISO(session.date_from);
            const end = parseISO(session.date_to);

            return isWithinInterval(date, {start, end});
        });
        console.log(daySessions);
        return {
            hasSession: daySessions.length > 0,
            sessions: daySessions
        };
    };

    return (
        <>
            <Row className="full-year-heading-row mb-0">
                <Col xs={12} md={6}>
                    <div className="full-year-heading-wrapper">
                        <h2 className="full-year-heading">Sitting Dates, {currentYear}</h2>
                    </div>
                </Col>
                <Col xs={12} md={6} className="text-end">
                    <select
                        className="form-select full-year-select"
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    >
                        {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </Col>
            </Row>
            <hr className="my-3"/>
            <div className="year-calendar">
                {!loading && months.map(monthIndex => {

                    const monthStart = startOfMonth(new Date(currentYear, monthIndex));
                    const monthEnd = endOfMonth(monthStart);

                    const days = eachDayOfInterval({
                        start: monthStart,
                        end: monthEnd
                    });

                    const startWeekday = monthStart.getDay();

                    const emptyCells = Array.from({length: startWeekday});

                    return (
                        <div className="elementor-widget-container session-calendar">

                            {/* Month Title */}
                            <div className="session-calendar-header">
                                {format(monthStart, "MMMM yyyy")}
                            </div>

                            {/* Week Labels */}
                            <div className="session-calendar-weekdays">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                    <div key={day} className="calendar-weekday">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
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
                                            data-date={format(day, "yyyy-MM-dd")}
                                        >

                                        <span className="day-number">
                                          {format(day, "d")}
                                        </span>

                                            {result.hasSession && (
                                                <div className="calendar-tooltip">
                                                    <strong>Parliament Sessions ({result.sessions.length})</strong>
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
                        </div>
                    );
                })}
                {loading && (
                    <div className="calendar-loading">
                        Loading sessions...
                    </div>
                )}
            </div>
        </>
    );
};

export default FullYearSessions;