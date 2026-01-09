import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner, Modal} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ElementorButton} from "../components/ElementorButton";
import {Filter} from "../components/Filter";
import ViewButton from "../components/ViewButton";
import defaultFilters from "./defaultFilters";

const Meetings = ({id, url, type}) => {
    // Get the localized data from PHP
    const settings = window.myPluginData || {};

    const [remoteData, setRemoteData] = useState(null);
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentMeetings, setRecentMeetings] = useState( []);
    const [meta, setMeta] = useState(null);
    const [currentFilterOptions, setCurrentFilterOptions] = useState([])
    const [filterFields, setFilterFields] = useState(defaultFilters);
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        setCurrentMeeting(null);
    }
    const handleShow = (meeting) => {
        setShow(true);
        setCurrentMeeting(meeting);
    };

    useEffect(() => {
        setLoading(true);
        fetchMeetings(1);
        fetchFiltersData();
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchMeetings(pageNumber);
    }

    function handleFilterChanged(filterOptions) {
        setCurrentFilterOptions(filterOptions);
        fetchMeetings(1, filterOptions);
    }

    function handleFilterSubmitted(filterOptions) {
        setCurrentFilterOptions(filterOptions);
        fetchMeetings(1, filterOptions);
    }

    const fetchFiltersData = () => {

        fetch(`${settings.root}parliament-pg/v1/get-filters-data?type=PROCEEDING_MINUTES`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setFilterFields(prev =>
                    prev.map(field =>
                        field.id === "statusId"
                            ? {
                                ...field,
                                options: data.statuses,
                            }
                            : field
                    )
                );
                setFilterFields(prev =>
                    prev.map(field =>
                        field.id === "categoryId"
                            ? {
                                ...field,
                                options: data.categories,
                            }
                            : field
                    )
                );
                setFilterFields(prev =>
                    prev.map(field =>
                        field.id === "year"
                            ? {
                                ...field,
                                options: data.years,
                            }
                            : field
                    )
                );
                setFilterFields(prev =>
                    prev.map(field =>
                        field.id === "sortBy"
                            ? {
                                ...field,
                                options: data.sortOptions,
                            }
                            : field
                    )
                );
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err)
            });
    }

    const fetchMeetings = (page, filters = {}) => {
        const params = new URLSearchParams({
            page,
            ...filters
        });
        console.log(params);
        setLoading(true);
        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root+url}?${params}`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => response.json())
            .then(data => {
                setRemoteData(data?.meetings?.data);
                setRecentMeetings(data?.recent);
                setMeta(data?.meetings);
                setLoading(false);
                setCurrentMeeting(null);
                console.log(data);
            })
            .catch(err => {
                console.error("Fetch error:", err)
            });
    }

    return (
        <div className="w-100">
            <Card>
                <Card.Header className="px-2 py-1">
                    <h5 className="fw-bold mb-0" style={{color: '#851414'}}>Recent Meetings</h5>
                </Card.Header>
                <Card.Body>
                    {recentMeetings && recentMeetings.length > 0 && recentMeetings.map((meeting, index) => (
                        <div className="mb-2" key={index}>
                            <p className="mb-0"><strong>Title: </strong> {meeting.title}</p>
                            <div className="d-flex justify-content-start align-items-center gap-2">
                                <span>{format(parseISO(meeting.date), 'do MMM, yyyy')} | </span>
                                <Badge bg="secondary">{meeting.status?.name}</Badge>
                                <Button variant="link" className="custom-link" size="sm"
                                        onClick={(e)=>handleShow(meeting)}>Summary</Button>
                            </div>
                        </div>
                    ))}
                </Card.Body>
            </Card>
            <Card className="mt-3" >
                <Card.Header className="px-2 py-1">
                    <h5 className="fw-bold mb-0">Filter</h5>
                </Card.Header>
                <Card.Body>
                    <Filter fields={filterFields}
                            onChange={handleFilterChanged}
                            onSubmit={handleFilterSubmitted}
                            hideProposers={true}
                    />
                </Card.Body>
            </Card>

            <Card className="mt-3">
                <Card.Header className="px-2 py-1">
                    <h5 className="fw-bold mb-0">Meetings</h5>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                        <tr>
                            <th className="text-center">No.</th>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData?.map((meeting, index) =>
                            <tr key={index}>
                                <td className="text-center">{index+1}</td>
                                <td className="text-start">{meeting.title}</td>
                                <td className="text-start">{format(parseISO(meeting.date), 'do MMM, yyyy')}</td>
                                <td className="text-center">
                                    <span className="badge status-badge">{meeting.status?.name}</span>
                                </td>
                                <td className="text-center">
                                    <Badge bg="secondary">{meeting.category?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    <ViewButton onClick={() => setCurrentMeeting(meeting)}/>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <Spinner animation="border" size="sm" />
                                        <span>Loading…</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && (!remoteData || remoteData.length === 0) && (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="text-muted">
                                        <Search className="mb-2"/>
                                        <div>No results found.</div>
                                        <small>Try adjusting your filters or search criteria.</small>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-center align-items-center">
                    <CustomPagination meta={meta} onPageChange={handlePageChange}></CustomPagination>
                </Card.Footer>
            </Card>
            {currentMeeting && (
                <Card className="mt-3">
                    <Card.Header className="px-2 py-1">
                        <h5 className="fw-bold mb-0">Meeting Summary</h5>
                    </Card.Header>
                    <Card.Body>
                        <div dangerouslySetInnerHTML={{__html: currentMeeting.summary}}></div>
                    </Card.Body>
                </Card>
            )}
            {currentMeeting && (
                <Modal show={show} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <h5 className="fw-bold mb-0">Meeting Summary</h5>
                    </Modal.Header>
                    <Modal.Body>
                        <div dangerouslySetInnerHTML={{__html: currentMeeting.summary}}></div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} size="sm">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};
export default Meetings;