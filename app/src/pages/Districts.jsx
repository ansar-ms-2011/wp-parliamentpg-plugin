import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Districts({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDistricts = (page = 1) => {
        setLoading(true);

        fetch(`${settings.root + url}?page=${page}`, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                setDistricts(data?.districts);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
    };

    // Load data
    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchDistricts(1);
        }
    }, [settings.root, settings.nonce]);

    return (
        <React.Fragment>
            <div className="page-content" id="districts-page">
                <Container fluid>
                    {loading && <p>Loading districts…</p>}
                    <Row className="mt-3">
                        {districts.map(district => (
                            <Col
                                key={district.id}
                                xs={12}
                                sm={6}
                                lg={4}
                                className="mb-4 d-flex"
                            >
                                <Card className="w-100 h-100 hover-card district-card">
                                    <Card.Body className="p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                        <div>
                                            <h5 className="card-title mb-1 district-title">
                                                {district.name}
                                            </h5>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}
