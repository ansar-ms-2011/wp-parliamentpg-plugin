import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ElementorButton} from "../components/ElementorButton";

const Questions = ({id, url, type}) => {

    // Get the localized data from PHP
    const settings = window.myPluginData || {};
    // console.log(settings);
    const [remoteData, setRemoteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchQuestions(1, {year: selectedYear});
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchQuestions(pageNumber, {year: selectedYear});
    }

    const fetchQuestions = (page, filters = {}) => {
        const params = new URLSearchParams({
            page,
            ...filters
        });
        console.log(params);
        setLoading(true);
        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root + url}?${params}`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                setRemoteData(data?.questions?.data);
                setYearOptions(data?.years);
                setMeta(data?.questions);
                setLoading(false);
                console.log(remoteData, data);
            })
            .catch(err => {
                console.error("Fetch error:", err)
            });
    }

    return (
        <div className="w-100">
            <Row>
                <Col md={6} className="d-flex align-items-center">
                    <label htmlFor="yearSelect" className="me-3">
                        <span className="text-nowrap fw-bold">Filter By Year </span>
                    </label>
                    <select
                        id="yearSelect"
                        className="form-select"
                        value={selectedYear || ""}
                        onChange={(e) => {
                            setSelectedYear(e.target.value)
                            console.log(e.target.value)
                            fetchQuestions(1, {year: e.target.value})
                        }}
                    >
                        <option value="">Select Year</option>
                        {yearOptions?.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </Col>
            </Row>
            <Card className="mt-3 card">
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                            <tr>
                                <th className="text-center">Date</th>
                                <th className="text-center">Question Paper No</th>
                                <th className="text-start">Attachment</th>
                            </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData?.map((item, index) =>
                            <tr key={index}>
                                <td className="text-center" style={{width:'150px'}}>{format(parseISO(item.date), 'do MMM, yyyy')}</td>
                                <td className="text-center" style={{width:'200px'}}>{item.question_paper_no}</td>
                                <td className="text-center">
                                    <a href={item.document?.url_uuid} target="_blank"
                                       key={item.document?.id}>
                                        <div
                                            className="d-flex align-items-center justify-content-start gap-2 text-primary mt-2">
                                            {item.document?.file_name}
                                            <i className="ri-external-link-line ms-2 me-2"></i>
                                        </div>
                                    </a>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <Spinner animation="border" size="sm"/>
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
        </div>
    );
};
export default Questions;