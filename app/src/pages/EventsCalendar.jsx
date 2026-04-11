import React, {useState, useEffect} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Badge, OverlayTrigger, Tooltip} from "react-bootstrap";

const EventsCalendar = ({id, url, month}) => {
    const settings = window.myPluginData || {};

    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);

    const categoryColors = {
        "Parliamentary Sitting": "primary",
        "Committee Hearing": "success",
        "In-House Event": "warning",
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDate2 = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const fetchEvents = (filters = {}) => {
        const params = new URLSearchParams(filters);
        setLoading(true);

        fetch(`${settings.root + url}?${params}`, {
            headers: {"X-WP-Nonce": settings.nonce}
        })
            .then(res => res.json())
            .then(data => {
                const formattedEvents = (data?.events || []).map(event => {
                    const start = new Date(event.start_datetime);
                    const end = new Date(event.end_datetime);

                    return {
                        id: event.id,
                        title: event.name,
                        start,
                        end,
                        allDay: false,
                        extendedProps: {
                            categoryName: event.category?.name,
                            categoryId: event.category?.id,
                            color: categoryColors[event.category?.name] || "secondary",
                            className: event.category?.name.toLowerCase().replace(/\s+/g, '-'),
                            startTime: formatTime(start),
                            endTime: formatTime(end),
                            location: event.location || '',
                            attendees: event.attendees || '',
                        }
                    };
                });

                setAllEvents(formattedEvents);
                setEvents(formattedEvents);

                const initialCategories = (data.categories || []).map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    selected: true
                }));
                setCategories(initialCategories);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events based on selected categories and search term
    useEffect(() => {
        let filtered = [...allEvents];

        const selectedCategoryIds = categories
            .filter(cat => cat.selected === true)
            .map(cat => cat.id);

        if (selectedCategoryIds.length > 0) {
            filtered = filtered.filter(event => {
                const eventCategoryId = event.extendedProps?.categoryId;
                return selectedCategoryIds.includes(eventCategoryId);
            });
        } else if (selectedCategoryIds.length === 0 && categories.length > 0) {
            filtered = [];
        }

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setEvents(filtered);

        // If there's a selected date, update the events for that date
        if (selectedDate) {
            updateSelectedDateEvents(filtered, selectedDate);
        }
    }, [categories, searchTerm, allEvents]);

    // Update events for the selected date
    const updateSelectedDateEvents = (eventsList, date) => {
        const dateStr = new Date(date).toDateString();
        const filteredEvents = eventsList.filter(event => {
            const eventDate = new Date(event.start).toDateString();
            return eventDate === dateStr;
        });
        setSelectedDateEvents(filteredEvents);
    };

    // Handle date click
    const handleDateClick = (info) => {
        const clickedDate = info.date;
        setSelectedDate(clickedDate);

        const dateStr = clickedDate.toDateString();
        const eventsForDate = events.filter(event => {
            const eventDate = new Date(event.start).toDateString();
            return eventDate === dateStr;
        });
        setSelectedDateEvents(eventsForDate);
    };

    const toggleCategory = (categoryId) => {
        setCategories(prevCategories => {
            const newCategories = prevCategories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        selected: !category.selected
                    };
                }
                return category;
            });
            return newCategories;
        });
    };

    const selectAllCategories = () => {
        setCategories(prevCategories =>
            prevCategories.map(category => ({
                ...category,
                selected: true
            }))
        );
    };

    const deselectAllCategories = () => {
        setCategories(prevCategories =>
            prevCategories.map(category => ({
                ...category,
                selected: false
            }))
        );
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearAllFilters = () => {
        selectAllCategories();
        setSearchTerm("");
    };

    const renderEventContent = (eventInfo) => {
        const {event} = eventInfo;
        const startTime = event.extendedProps?.startTime || '';
        const endTime = event.extendedProps?.endTime || '';
        const timeDisplay = startTime ? `${startTime}${endTime ? ` - ${endTime}` : ''}` : '';

        const tooltipContent = (
            <Tooltip
                id={`tooltip-${event.id}`}
                className="custom-tooltip"
            >
                <div style={{padding: '8px 12px'}}>
                    <strong style={{fontSize: '14px', display: 'block', marginBottom: '4px'}}>
                        {event.title}
                    </strong>
                    {timeDisplay && (
                        <div style={{fontSize: '12px', marginBottom: '4px', opacity: 0.9}}>
                            🕒 {timeDisplay}
                        </div>
                    )}
                    {event.extendedProps?.categoryName && (
                        <div style={{marginTop: '4px'}}>
                            {event.extendedProps.categoryName}
                        </div>
                    )}
                </div>
            </Tooltip>
        );

        return (
            <OverlayTrigger
                placement="top"
                overlay={tooltipContent}
                delay={{show: 250, hide: 100}}
            >
                <div className={'fc-event-content-wrapper ' + event.extendedProps.className}
                     style={{cursor: 'pointer', width: '100%'}}>
                    {timeDisplay && (
                        <span className="fc-event-time" style={{
                            fontSize: '0.85em',
                            fontWeight: 'bold',
                            paddingInline: '3px',
                            borderRadius: '10px',
                        }}>
                            {timeDisplay}
                        </span>
                    )}
                </div>
            </OverlayTrigger>
        );
    };

    return (
        <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="event-filter-wrapper d-flex flex-column gap-1 mb-2">
                <h4 className="fw-bold mb-0" style={{fontSize: '20px'}}>Event Filters</h4>
                <p className="text-muted" style={{fontSize: '14px'}}>Customize your calendar view</p>

                <div className="d-flex justify-content-between gap-1 mb-3">
                    <button className="btn btn-sm btn-outline-primary" onClick={selectAllCategories}
                            style={{fontSize: '0.80em', padding: '2px 4px'}}
                    >
                        Select All
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={deselectAllCategories}
                            style={{fontSize: '0.80em', padding: '2px 4px'}}
                    >
                        Deselect All
                    </button>
                </div>

                <div className="categories-wrapper">
                    {categories.length > 0 ? (
                        categories.map(category => (
                            <div key={category.id} className="category-item mb-2">
                                <label className="d-flex align-items-center" style={{cursor: 'pointer'}}>
                                    <input
                                        type="checkbox"
                                        checked={category.selected}
                                        onChange={() => toggleCategory(category.id)}
                                        style={{
                                            marginRight: '8px',
                                            cursor: 'pointer',
                                            width: '16px',
                                            height: '16px'
                                        }}
                                    />
                                    <span style={{cursor: 'pointer'}}>
                                        {category.name}
                                    </span>
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No categories available</p>
                    )}
                </div>

                <div className="d-flex flex-column gap-2 mt-4 mb-4">
                    <div className="quick-search">
                        <input
                            className="form-control form-control-sm"
                            type="text"
                            placeholder="Search events..."
                            onChange={handleSearch}
                            value={searchTerm}
                        />
                    </div>
                    <div className="event-filter-buttons">
                        <button className="btn btn-secondary w-100 mt-2" onClick={clearAllFilters}>
                            Clear All Filters
                        </button>
                    </div>
                </div>
            </div>
            <div className="events-calendar">
                {loading && <div>Loading events ...</div>}

                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "title",
                        center: "",
                        right: "prev,today,next"
                    }}
                    events={events}
                    eventContent={renderEventContent}
                    height="auto"
                    eventDisplay="block"
                    dateClick={handleDateClick}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: 'short'
                    }}
                    dayMaxEvents={false}
                />
            </div>
            <div className="event-detail-wrapper">
                <div className="event-detail-header d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4 className="fw-bold mb-0" style={{fontSize: '20px'}}>Schedule Details</h4>
                        {selectedDate && (
                            <span className={"selected-date-text"}>
                                {selectedDate ? `${formatDate2(selectedDate)}` : ""}
                            </span>
                        )}
                    </div>
                    {selectedDateEvents.length > 0 ? (
                        <div className="events-list">
                            {selectedDateEvents.map(event => (
                                <div key={event.id} className="event-detail-item mb-2 p-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={'custom-badge ' + event.extendedProps.className}>
                                            {event.extendedProps.categoryName}
                                        </span>
                                        <small className="sd-time-slot text-muted">
                                            🕒 {event.extendedProps.startTime}
                                            {event.extendedProps.endTime && ` - ${event.extendedProps.endTime}`}
                                        </small>
                                    </div>
                                    <div className="event-heading mb-2">
                                        {event.title}
                                    </div>
                                    {event.extendedProps.location && (
                                        <div className="event-location mb-2">
                                            <small className="text-muted">
                                                📌 {event.extendedProps.location}
                                            </small>
                                        </div>
                                    )}
                                    {event.extendedProps.attendees && (
                                        <div className="event-location mb-2">
                                            <small className="text-muted">
                                                👥 {event.extendedProps.attendees}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        selectedDate && (
                            <div className="no-events-message p-2 mb-2 text-center border rounded bg-light">
                                <p className="mb-0 text-muted">
                                    No events scheduled for this date
                                </p>
                            </div>
                        )
                    )}

                    {!selectedDate && (
                        <div className="no-selection-message p-2 mb-2 text-center border rounded bg-light">
                            <p className="mb-0 text-muted">
                                Click on any date in the calendar to see events
                            </p>
                        </div>
                    )}
                </div>
                <div class="calendar-key p-3">
                    <h5 className="calendar-key-heading fw-bold mb-2 bg-light">Calendar Key</h5>
                    <div class="calendar-key-row">
                        <div class="calendar-key-item">
                            <div class="calendar-key-box parliament-sitting"></div>
                            <span>Parliament Sitting</span>
                        </div>
                    </div>
                    <div class="calendar-key-row">
                        <div class="calendar-key-item">
                            <div class="calendar-key-box committee-hearing"></div>
                            <span>Committee Hearing</span>
                        </div>
                    </div>
                    <div class="calendar-key-row">
                        <div class="calendar-key-item">
                            <div class="calendar-key-box in-house-event"></div>
                            <span>In-House Event</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .event-filter-wrapper {
                    width: 20%;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 5px 15px;
                    background: white;
                }

                .events-calendar {
                    width: 50%;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    color: #333 !important;
                    background: white;
                }

                .event-detail-wrapper {
                    width: 30%;
                    padding: 5px 10px;
                    background: white;
                }

                .category-item {
                    margin-bottom: 8px;
                }

                .category-item label {
                    cursor: pointer;
                    user-select: none;
                    margin-bottom: 0;
                    width: 100%;
                }

                .event-detail-item {
                    border: 1px solid #ccc; /* all sides */
                    border-left: 3px solid rgb(73, 2, 73); /* override left side */

                    border-radius: 5px;
                    background-color: #f8f9fa;

                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .event-detail-item:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    background: #ffffff;
                }

                .events-list {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .fc-daygrid-event {
                    white-space: normal !important;
                    margin: 2px 1px !important;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .fc-daygrid-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .fc-daygrid-day-events {
                    gap: 4px !important;
                }

                .fc-daygrid-day-frame {
                    cursor: pointer;
                }

                .fc-daygrid-day-frame:hover {
                    background-color: #f8f9fa;
                }

                .event-count {
                    margin-top: 15px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    text-align: center;
                }

                .selected-categories-info {
                    padding: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    text-align: center;
                }

                .custom-tooltip {
                    opacity: 1 !important;
                }

                .custom-tooltip .tooltip-inner {
                    padding: 0 !important;
                    background-color: #2c3e50;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    max-width: 350px;
                }

                .tooltip {
                    margin: 0 !important;
                }

                .tooltip.show {
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
                }

                .tooltip.bs-tooltip-top {
                    margin-top: -2px !important;
                }

                @media (max-width: 768px) {
                    .d-flex {
                        flex-direction: column;
                    }

                    .event-filter-wrapper,
                    .events-calendar,
                    .event-detail-wrapper {
                        width: 100%;
                        margin-bottom: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventsCalendar;