import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner, Form} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import "flatpickr/dist/themes/light.css";
import ViewButton from "../components/ViewButton";

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import {ElementorButton} from "../components/ElementorButton";
import DownloadButton from "../components/DownloadButton";

const NoticePapers = ({id, url, type}) => {

    // Get the localized data from PHP
    const settings = window.myPluginData || {};
    console.log(settings);
    const [remoteData, setRemoteData] = useState(null);
    const [currentNoticePaper, setCurrentNoticePaper] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [currentFilterOptions, setCurrentFilterOptions] = useState({
        date_from: null,
        date_to: null,
    })

    useEffect(() => {
        setLoading(true);
        fetchNoticePapers(1);
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchNoticePapers(pageNumber);
    }

    const viewNoticePaper = (noticePaper) => {
        window.open(noticePaper.document?.url, '_blank');
    }

    const downloadNoticePaper = async (noticePaper) => {
        const response = await fetch(noticePaper.document?.url);
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'file.pdf';
        link.click();

        URL.revokeObjectURL(link.href);
    }

    function handleReset() {
        setCurrentFilterOptions({
            date_from: null,
            date_to: null,
        })
        fetchNoticePapers(1);
    }

    function handleSubmit(e) {
        e.preventDefault();
        fetchNoticePapers(1, currentFilterOptions);
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-CA');
    };

    const fetchNoticePapers = (page, filters = {}) => {
        const params = new URLSearchParams();

        params.append('page', page);

        if (filters.date_from) {
            params.append(
                'date_from',
                formatDate(filters.date_from)
            );
        }

        if (filters.date_to) {
            params.append(
                'date_to',
                formatDate(filters.date_to)
            );
        }
        console.log(params);
        setLoading(true);
        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root + url}?${params}`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => response.json())
            .then(data => {
                setRemoteData(data?.data);
                setMeta(data);
                setLoading(false);
                setCurrentNoticePaper(null);
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
                    <h5 className="fw-bold mb-0">Filter</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} onReset={handleReset}>
                        <Row>
                            <Col md={4}>
                                <Flatpickr
                                    className="form-control flatpickr-input"
                                    placeholder="Date From"
                                    value={currentFilterOptions.date_from}
                                    options={{
                                        dateFormat: "d M, Y",
                                    }}
                                    onChange={(dates) => {
                                        const updated = {
                                            ...currentFilterOptions,
                                            date_from: dates[0] || null
                                        };
                                        setCurrentFilterOptions(updated);
                                    }}
                                />
                            </Col>

                            <Col md={4}>
                                <Flatpickr
                                    className="form-control flatpickr-input"
                                    placeholder="Date To (optional)"
                                    value={currentFilterOptions.date_to}
                                    options={{
                                        dateFormat: "d M, Y",
                                        minDate: currentFilterOptions.date_from || null // 👈 prevents invalid range
                                    }}
                                    onChange={(dates) => {
                                        const updated = {
                                            ...currentFilterOptions,
                                            date_to: dates[0] || null
                                        };
                                        setCurrentFilterOptions(updated);
                                    }}
                                />
                            </Col>
                            <Col md={4} className="d-flex justify-content-end align-items-center gap-3">
                                <ElementorButton size="sm" type="reset">
                                    Reset
                                </ElementorButton>

                                <ElementorButton size="sm" className="custom-primary" type="submit">
                                    Filter
                                </ElementorButton>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mt-3">
                <Card.Header className="px-2 py-1">
                    <h5 className="fw-bold mb-0">Notice Papers</h5>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0 custom-table">
                        <thead>
                        <tr>
                            <th className="text-center">S. No.</th>
                            <th className="text-center">Date</th>
                            <th className="text-center">Notice Paper No.</th>
                            <th className="text-center" style={{width: '150px'}}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData.length > 0 && remoteData?.map((noticePaper, index) =>
                            <tr key={index}>
                                <td className="text-center">{index + 1}</td>

                                <td className="text-center">{format(parseISO(noticePaper.notice_date), 'dd-MMM-yyyy')}</td>
                                <td className="text-center">{noticePaper.notice_number}</td>
                                <td className="text-center d-flex justify-content-start align-items-center gap-2" style={{width: '150px'}}>
                                    <ViewButton onClick={() => viewNoticePaper(noticePaper)}/>
                                    {noticePaper.document?.url && (
                                        <DownloadButton onClick={() => downloadNoticePaper(noticePaper)}/>
                                    )}
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <Spinner animation="border" size="sm"/>
                                        <span>Loading…</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && (!remoteData || remoteData.length === 0) && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
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
            {currentNoticePaper && (
                <Card className="mt-3">
                    <Card.Header className="px-2 py-1">
                        <h5 className="fw-bold mb-0">Notice Detail</h5>
                    </Card.Header>
                    <Card.Body>
                        <div dangerouslySetInnerHTML={{__html: currentNoticePaper.detail}}></div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};
export default NoticePapers;