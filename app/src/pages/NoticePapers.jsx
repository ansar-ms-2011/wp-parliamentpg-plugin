import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ElementorButton} from "../components/ElementorButton";
import {Filter} from "../components/Filter";
import ViewButton from "../components/ViewButton";
import defaultFilters from "./defaultFilters";

const NoticePapers = ({id, url, type}) => {

    // Get the localized data from PHP
    const settings = window.myPluginData || {};
    console.log(settings);
    const [remoteData, setRemoteData] = useState(null);
    const [currentNoticePaper, setCurrentNoticePaper] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [currentFilterOptions, setCurrentFilterOptions] = useState([])
    const [filterFields, setFilterFields] = useState(defaultFilters);

    useEffect(() => {
        setLoading(true);
        fetchNoticePapers(1);
        fetchFiltersData();
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchNoticePapers(pageNumber);
    }

    function handleFilterChanged(filterOptions) {
        console.log("live changes:", filterOptions);
        setCurrentFilterOptions(filterOptions);
        fetchNoticePapers(1, filterOptions);
    }

    function handleFilterSubmitted(filterOptions) {
        console.log("submit filters:", filterOptions);
        setCurrentFilterOptions(filterOptions);
        fetchNoticePapers(1, filterOptions);
    }

    const fetchFiltersData = () => {
        fetch(`${settings.root}parliament-pg/v1/get-filters-data?type=NOTICE_PAPER`, {
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
                        field.id === "proposerId"
                            ? {
                                ...field,
                                options: data.proposers,
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

    const fetchNoticePapers = (page, filters = {}) => {
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
                    <Filter fields={filterFields}
                            onChange={handleFilterChanged}
                            onSubmit={handleFilterSubmitted}
                    />
                </Card.Body>
            </Card>

            <Card className="mt-3">
                <Card.Header className="px-2 py-1">
                    <h5 className="fw-bold mb-0">Notice Papers</h5>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                        <tr>
                            <th>No.</th>
                            <th>Notice Number</th>
                            <th>Notice Date</th>
                            <th>Status</th>
                            <th>Proposer</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData?.map((noticePaper, index) =>
                            <tr key={index}>
                                <td className="text-start">{index+1}</td>
                                <td className="text-start">{noticePaper.notice_number}</td>
                                <td className="text-start">{format(parseISO(noticePaper.notice_date), 'do MMM, yyyy')}</td>
                                <td className="text-center">
                                    <span className="badge status-badge">{noticePaper.status?.name}</span>
                                </td>
                                <td className="text-start">{noticePaper.proposer?.first_name + ' ' + noticePaper.proposer?.last_name}</td>
                                <td className="text-center">
                                    <Badge bg="secondary">{noticePaper.category?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    <ViewButton onClick={() => setCurrentNoticePaper(noticePaper)}/>
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