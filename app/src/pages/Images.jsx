import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Images({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchImages = (aId = null) => {
        setLoading(true);
        let fullUrl = `${settings.root + url}`;
        if(aId) fullUrl = fullUrl+"?aId="+aId;
        fetch(fullUrl, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                setImages(data?.images);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
    };

    // Load data
    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchImages();
        }
    }, [settings.root, settings.nonce]);

    return (
        <React.Fragment>
            <div className="page-content" id="images-page">
                <Container fluid>
                    {loading && <p>Loading images…</p>}
                    <Row className="mt-3">
                        {images.map(image => (
                            <Col
                                key={image.id}
                                xs={12}
                                sm={6}
                                lg={4}
                                className="mb-4 d-flex"
                            >
                                <Card className="w-100 h-100 hover-card images-card">
                                    <Card.Body className="p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                        <img src={image.url} alt="pdis-image"/>
                                        <div>
                                            <span className="card-title mb-1">
                                                {image.title}
                                            </span>
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
