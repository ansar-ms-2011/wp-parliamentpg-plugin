import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import CustomPagination from "../components/CustomPagination";
import {Table, Button, Badge, Card, Row, Col, Spinner} from 'react-bootstrap';
import {ArrowRight, Search} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ElementorButton} from "../components/ElementorButton";
import {Filter} from "../components/Filter";
import ViewButton from "../components/ViewButton";
import defaultFilters from './defaultFilters';

const BillAndLegislations = ({id, url, type}) => {

    // Get the localized data from PHP
    const settings = window.myPluginData || {};
    console.log(settings);
    const [remoteData, setRemoteData] = useState(null);
    const [currentBill, setCurrentBill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [currentFilterOptions, setCurrentFilterOptions] = useState([])
    const [filterFields, setFilterFields] = useState(defaultFilters);


    useEffect(() => {
        setLoading(true);
        fetchBills(1);
        fetchFiltersData();
    }, [settings.root, settings.nonce]);

    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchBills(pageNumber);
    }

    function handleFilterChanged(filterOptions) {
        console.log("live changes:", filterOptions);
        setCurrentFilterOptions(filterOptions);
        fetchBills(1, filterOptions);
    }

    function handleFilterSubmitted(filterOptions) {
        console.log("submit filters:", filterOptions);
        setCurrentFilterOptions(filterOptions);
        fetchBills(1, filterOptions);
    }

    const fetchFiltersData = () => {
        fetch(`${settings.root}parliament-pg/v1/get-filters-data?type=LEGISLATIVE_BILL`, {
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

    const fetchBills = (page, filters = {}) => {
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
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(data => {
                setRemoteData(data?.data);
                setMeta(data);
                setLoading(false);
                setCurrentBill(null);
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
                    <h5 className="fw-bold mb-0">Legislative Bills</h5>
                </Card.Header>
                <Card.Body className="p-0" style={{overflow: 'auto'}}>
                    <Table striped bordered hover size="sm" responsive className="table-sm m-0">
                        <thead>
                        <tr>
                            <th>Bill ID</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Bill Date</th>
                            <th>Proposer</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && remoteData && remoteData?.map((item, index) =>
                            <tr key={index}>
                                <td className="text-start">{item.bill_number}</td>
                                <td className="text-start">{item.title}</td>
                                <td className="text-center">
                                    <span className="badge status-badge">{item.status?.name}</span>
                                </td>
                                <td className="text-start">{format(parseISO(item.bill_date), 'do MMM, yyyy')}</td>
                                <td className="text-start">{item.proposer?.first_name + ' ' + item.proposer?.last_name}</td>
                                <td className="text-center">
                                    <Badge bg="secondary">{item.category?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    <ViewButton onClick={() => setCurrentBill(item)}/>
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


            {currentBill && (
                <Card className="mt-3">
                    <Card.Header className="px-2 py-1">
                        <Card.Title className="mb-0">
                            <h5 className="fw-bold mb-0">{currentBill?.title}</h5>
                        </Card.Title>
                        <Card.Text>
                            <div className="d-flex align-items-start gap-3">
                                <span className="text-muted text-sm-start">{currentBill.bill_number}</span>
                                <span
                                    className="text-muted text-sm-start">Proposed By : {currentBill.proposer?.first_name} on {format(parseISO(currentBill.bill_date), 'do MMMM, yyyy')}</span>
                            </div>
                        </Card.Text>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={12}>
                                <div dangerouslySetInnerHTML={{__html: currentBill.summary}}></div>
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col md={3}>
                                Status : <Badge bg="info">{currentBill.status?.name}</Badge>
                            </Col>
                            <Col md={3}>
                                Category : <Badge bg="secondary">{currentBill.category?.name}</Badge>
                            </Col>
                            <Col md={3}>
                                Year : {format(parseISO(currentBill.bill_date), 'yyyy')}
                            </Col>
                            <Col md={3} className="d-flex justify-content-end align-items-center gap-3">
                                {currentBill.document?.url && (
                                    <ElementorButton as="a" size="sm" className="elementor-button custom-primary"
                                                     href={currentBill.document?.url} target="_blank">
                                        Read Full <ArrowRight/>
                                    </ElementorButton>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};
export default BillAndLegislations;