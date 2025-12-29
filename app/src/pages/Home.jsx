// app/src/pages/Home.jsx
import React, {useState, useEffect} from 'react';
import {parseISO, format} from 'date-fns';
import {Table, Button, Form, Modal, Navbar, Badge, Card, Row, Col} from 'react-bootstrap';
import {Alarm, ArrowRight, Eye} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const [remoteData, setRemoteData] = useState(null);
    const [currentBill, setCurrentBill] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get the localized data from PHP
    const settings = window.myPluginData || {};

    useEffect(() => {

        setLoading(true);

        // Notice we are calling OUR site's custom endpoint
        fetch(`${settings.root}parliament-pg/v1/external-data`, {
            headers: {
                'X-WP-Nonce': settings.nonce
            }
        })
            .then(response => response.json())
            .then(data => {
                setRemoteData(data);
                console.log(data);
                setLoading(false);
            })
            .catch(err => console.error("Fetch error:", err));
    }, [settings.root, settings.nonce]);

    if (loading) return <p>{settings?.strings?.loading}</p>;

    return (
        <div className="w-100">
            <Card>
                <Card.Header>
                    <Card.Title className="mb-0">Filter</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="align-items-end">
                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="formGroupYear">
                                    <Form.Label htmlFor="year">Year</Form.Label>
                                    <Form.Select aria-label="Select Year" id="year">
                                        <option>Select Year</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="formGroupStatus">
                                    <Form.Label htmlFor="status">Status</Form.Label>
                                    <Form.Select aria-label="Select Status" id="status">
                                        <option>Select Status</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="formGroupCategory">
                                    <Form.Label htmlFor="category">Category</Form.Label>
                                    <Form.Select aria-label="Select Category" id="category">
                                        <option>Select Category</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="formGroupProposer">
                                    <Form.Label htmlFor="proposer">Proposer</Form.Label>
                                    <Form.Select aria-label="Select Proposer" id="proposer">
                                        <option>Select Proposer</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="formGroupSortBy">
                                    <Form.Label htmlFor="sortBy">Sort By</Form.Label>
                                    <Form.Select aria-label="Select Sort Order" id="sortBy">
                                        <option>Select Sort Order</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col className="d-flex justify-content-end align-items-center gap-3">
                                <Button variant="secondary" type="reset">Reset</Button>
                                <Button variant="primary" type="submit">Filter</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mt-3">
                <Card.Header>
                    <Card.Title className="mb-0">Legislative Bills</Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table striped bordered hover size="sm">
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
                        {remoteData && remoteData.map((item, index) =>
                            <tr key={index}>
                                <td className="text-start">{item.bill_number}</td>
                                <td className="text-start">{item.title}</td>
                                <td className="text-center">
                                    <Badge bg="info">{item.status?.name}</Badge>
                                </td>
                                <td className="text-start">{format(parseISO(item.bill_date), 'do MMMM, yyyy')}</td>
                                <td className="text-start">{item.proposer?.first_name + ' ' + item.proposer?.last_name}</td>
                                <td className="text-center">
                                    <Badge bg="secondary">{item.category?.name}</Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="primary" href={item.url} size="sm" onClick={() => setCurrentBill(item)}>
                                        <Eye color="white" size={16}/>
                                    </Button>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {currentBill && (
                <Card className="mt-3">
                    <Card.Header>
                        <Card.Title className="mb-0">{currentBill?.title}</Card.Title>
                        <Card.Text>
                            <div className="d-flex align-items-start gap-3">
                                <span className="text-muted text-sm-start">{currentBill.bill_number}</span>
                                <span className="text-muted text-sm-start">Proposer By : {currentBill.proposer?.first_name } on {format(parseISO(currentBill.bill_date), 'do MMMM, yyyy')}</span>
                            </div>
                        </Card.Text>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={12}>
                                <p>{currentBill.summary}</p>
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
                                <Button size="sm" variant="primary" href={currentBill.url} target="_blank">Read Full <ArrowRight/></Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};
export default Home;