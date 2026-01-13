import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Governors({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [governors, setGovernors] = useState([]);
    const [filteredGovernors, setFilteredGovernors] = useState([]);
    const [activeLetter, setActiveLetter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchGovernors = (page = 1) => {
        setLoading(true);

        fetch(`${settings.root + url}?page=${page}`, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                setGovernors(data?.governors);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
    };

    // Load data
    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchGovernors(1);
        }
    }, [settings.root, settings.nonce]);

    // Determine available letters whenever members change
    const availableLetters = alphabet.reduce((acc, letter) => {
        acc[letter] = governors.some(
            m => m.full_name?.charAt(0).toUpperCase() === letter
        );
        return acc;
    }, {});

    // Pick the first available letter once members load
    useEffect(() => {
        const first = alphabet.find(l => availableLetters[l]) || null;
        setActiveLetter(first);
    }, [governors]);

    // Filter by active letter
    useEffect(() => {
        if (!activeLetter) {
            setFilteredGovernors(governors);
            return;
        }
        setFilteredGovernors(
            governors.filter(
                m =>
                    m.full_name &&
                    m.full_name.charAt(0).toUpperCase() === activeLetter
            )
        );
    }, [governors, activeLetter]);

    return (
        <React.Fragment>
            <div className="page-content" id="governors-page">
                <Container fluid>

                    {/* A–Z Buttons */}
                    <Row className="mb-1">
                        <Col>
                            <div className="d-flex flex-wrap justify-content-start gap-1">
                                {alphabet.map(letter => (
                                    <button
                                        key={letter}
                                        className={`btn-custom-primary ${activeLetter === letter ? "active" : ""}`}
                                        disabled={!availableLetters[letter]}
                                        onClick={() =>
                                            availableLetters[letter] &&
                                            setActiveLetter(letter)
                                        }
                                    >
                                        {availableLetters[letter] ? <b>{letter}</b> : letter}
                                    </button>
                                ))}

                                <button
                                    className={`btn-custom-primary`}
                                    onClick={() => setActiveLetter(null)}
                                >
                                    <b>All</b>
                                </button>
                            </div>
                        </Col>
                    </Row>

                    {loading && <p>Loading governors…</p>}

                    <Row className="mt-3">
                        {filteredGovernors.map(governor => (
                            <Col
                                key={governor.id}
                                xs={12}
                                sm={6}
                                lg={4}
                                className="mb-4 d-flex"
                            >
                                <Card className="w-100 h-100">
                                    <Card.Body className="p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                        <div>
                                            <div className="mx-auto avatar-lg mb-3">
                                                {governor.avatar_document ? (
                                                    <img
                                                        src={governor.avatar_url}
                                                        alt=""
                                                        className="img-fluid rounded-circle"
                                                    />
                                                ) : (
                                                    <i className="bx bx-user avatar-title rounded-circle text-primary"></i>
                                                )}
                                            </div>

                                            <h5 className="card-title mb-1">
                                                {governor.full_name}
                                            </h5>
                                            <p className="text-muted mb-0">
                                                {governor.political_party}
                                            </p>
                                        </div>
                                    </Card.Body>

                                    <Card.Footer className="text-center">
                                        <ul className="list-inline mb-0" style={{margin: "unset !important;"}}>
                                            <li className="list-inline-item">
                                                <a href="#" className="icon-circle me-2">
                                                    <i className="ri-message-2-line"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="#" className="icon-circle me-2">
                                                    <i className="ri-phone-fill"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="#" className="icon-circle me-2">
                                                    <i className="ri-share-fill"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="#" className="icon-circle me-2">
                                                    <i className="ri-more-2-line"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}
