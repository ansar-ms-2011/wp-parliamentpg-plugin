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

const Hansards = () => {
    // Get the localized data from PHP
    const settings = window.myPluginData || {};

    const [remoteData, setRemoteData] = useState(null);
    const [currentHansard, setCurrentHansard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [currentFilterOptions, setCurrentFilterOptions] = useState([])
    const [filterFields, setFilterFields] = useState(defaultFilters);

    useEffect(() => {
        setLoading(true);
        fetchHansards(1);
        fetchFiltersData();
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchHansards(pageNumber);
    }

    function handleFilterChanged(filterOptions) {
        setCurrentFilterOptions(filterOptions);
        fetchHansards(1, filterOptions);
    }

    function handleFilterSubmitted(filterOptions) {
        setCurrentFilterOptions(filterOptions);
        fetchHansards(1, filterOptions);
    }

    const fetchFiltersData = () => {
        fetch(`${settings.root}parliament-pg/v1/get-filters-data?type=HANSARD`, {
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

    const fetchHansards = (page, filters = {}) => {
        const params = new URLSearchParams({
            page,
            ...filters
        });
        console.log(params);
        setLoading(true);
        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root}parliament-pg/v1/get-hansards?${params}`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => response.json())
            .then(data => {
                setRemoteData(data?.data);
                setMeta(data);
                setLoading(false);
                setCurrentHansard(null);
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
                    <h5 className="fw-bold mb-0">Hansard</h5>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                        <tr>
                            <th>No.</th>
                            <th>Hansard Number</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Proposer</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData?.map((hansard, index) =>
                            <tr key={index}>
                                <td className="text-start">{index+1}</td>
                                <td className="text-start">{hansard.hansard_number}</td>
                                <td className="text-start">{format(parseISO(hansard.hansard_date), 'do MMM, yyyy')}</td>
                                <td className="text-center">
                                    <span className="badge status-badge">{hansard.status?.name}</span>
                                </td>
                                <td className="text-start">{hansard.proposer?.first_name + ' ' + hansard.proposer?.last_name}</td>
                                <td className="text-center">
                                    <Badge bg="secondary">{hansard.category?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    <ViewButton onClick={() => setCurrentHansard(hansard)}/>
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
            {currentHansard && (
                <Card className="mt-3">
                    <Card.Header className="px-2 py-1">
                        <h5 className="fw-bold mb-0">Hansard Detail</h5>
                    </Card.Header>
                    <Card.Body>
                        <div dangerouslySetInnerHTML={{__html: currentHansard.detail}}></div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};
export default Hansards;