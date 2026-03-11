import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner, FormSelect} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const Recommendations = ({id, url, type}) => {

    // Get the localized data from PHP
    const settings = window.myPluginData || {};

    const [recommendations, setRecommendations] = useState(null);
    const [committees, setCommittees] = useState([]);
    const [currentCommittee, setCurrentCommittee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);


    useEffect(() => {
        setLoading(true);
        fetchRecommendations(1, {committeeId: currentCommittee? currentCommittee : ""});
    }, [currentCommittee]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchRecommendations(pageNumber);
    }

    const fetchRecommendations = (page, filters = {}) => {
        const params = new URLSearchParams({
            page,
            ...filters
        });
        setLoading(true);
        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root + url}?${params}`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(data => {
                setRecommendations(data?.recommendations?.data);
                setMeta(data?.recommendations);

                setCommittees(data?.committees);
                setLoading(false);
                console.log(data);
            })
            .catch(err => {
                console.error("Fetch error:", err)
            });
    }

    return (
        <div className="w-100">
            <Card className="mt-3">
                <Card.Header className="px-2 py-2">
                    <Row className="d-flex align-items-center">
                        <Col cols={12} md={4}><h5 className="fw-bold mb-0">Recommendations</h5></Col>
                        <Col cols={12} md={8}>
                            <Row className="align-items-center">
                                <Col md={12} className="d-flex align-items-center">
                                    <label htmlFor="committeeSelect" className="me-3">
                                        <span className="text-nowrap fw-bold">Committee Name</span>
                                    </label>
                                    <FormSelect
                                        id="committeeSelect"
                                        className="form-select"
                                        value={currentCommittee || ""}
                                        onChange={(e) => {
                                            setCurrentCommittee(e.target.value)
                                        }}
                                    >
                                        <option value="" disabled>Select Committee</option>
                                        {committees?.map(option => (
                                            <option key={option.id} value={option.id}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                        <tr>
                            <th className="text-center">S.No</th>
                            <th>Description</th>
                            <th className="text-nowrap">Start Date</th>
                            <th className="text-nowrap">Due Date</th>
                            <th className="text-center">Parties</th>
                            <th className="text-center">Priority</th>
                            <th className="text-center">Type</th>
                            <th className="text-center">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && recommendations && recommendations?.map((item, index) =>
                            <tr key={index}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-start">{item.description}</td>
                                <td className="text-start text-nowrap">{format(parseISO(item.date_from), 'do MMM, yyyy')}</td>
                                <td className="text-start text-nowrap">{format(parseISO(item.date_to), 'do MMM, yyyy')}</td>
                                <td className="text-center">
                                    {item.responsible_parties && item.responsible_parties.length > 0
                                        ? item.responsible_parties.map(p => p.name).join(', ')
                                        : '—'}
                                </td>
                                <td className="text-center">
                                    {(() => {
                                        switch (item.priority?.name) {
                                            case "Low":
                                                return <Badge bg="secondary" className="px-2"
                                                              pill>{item.priority?.name}</Badge>;
                                            case "Medium":
                                                return <Badge bg="secondary" className="px-2"
                                                              pill>{item.priority?.name}</Badge>;
                                            case "High":
                                                return <Badge bg="warning" className="px-2"
                                                              pill>{item.priority?.name}</Badge>;
                                            case "Critical":
                                                return <Badge bg="danger" className="px-2"
                                                              pill>{item.priority?.name}</Badge>;
                                            default:
                                                return <Badge bg="light" className="px-2"
                                                              pill>{item.priority?.name}</Badge>;
                                        }
                                    })()}
                                </td>
                                <td className="text-center">
                                    <Badge bg="secondary">{item.type?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    {(() => {
                                        switch (item.implementation_status?.name) {
                                            case "Completed":
                                                return <Badge bg="success" pill
                                                              className="px-2">Completed</Badge>;
                                            case "In-Progress":
                                                return <Badge bg="warning" pill
                                                              className="px-2">In-Progress</Badge>;
                                            case "Not-Started":
                                                return <Badge bg="dark" pill
                                                              className="px-2">Not-Started</Badge>;
                                            default:
                                                return <Badge bg="light"
                                                              pill
                                                              className="px-2">{item.implementation_status?.name}</Badge>;
                                        }
                                    })()}
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <Spinner animation="border" size="sm"/>
                                        <span>Loading recommendation …</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && (!recommendations || recommendations.length === 0) && (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
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
        </div>
    );
};
export default Recommendations;