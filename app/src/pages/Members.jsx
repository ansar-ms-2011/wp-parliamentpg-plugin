import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Members({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
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

    const prevCard = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const nextCard = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, filteredMembers.length - 1));
    };

    const fetchMembers = (page = 1) => {
        setLoading(true);

        fetch(`${settings.root + url}?page=${page}`, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                const normalized = (data?.members || []).map(m => ({
                    ...m,
                    first_name: (m.first_name || "").trim()
                }));

                setMembers(normalized);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
    };

    // Load data
    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchMembers(1);
        }
    }, [settings.root, settings.nonce]);

    // Determine available letters whenever members change
    const availableLetters = alphabet.reduce((acc, letter) => {
        acc[letter] = members.some(
            m => m.first_name?.charAt(0).toUpperCase() === letter
        );
        return acc;
    }, {});

    // Pick the first available letter once members load
    useEffect(() => {
        const first = alphabet.find(l => availableLetters[l]) || null;
        setActiveLetter(first);
    }, [members]);

    // Filter by active letter
    useEffect(() => {
        if (!activeLetter) {
            setFilteredMembers(members);
            return;
        }

        setFilteredMembers(
            members.filter(
                m =>
                    m.first_name &&
                    m.first_name.charAt(0).toUpperCase() === activeLetter
            )
        );
    }, [members, activeLetter]);

    return (
        <React.Fragment>
            <div className="page-content" id="members-page">
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

                    {loading && <p>Loading members…</p>}

                    <div
                        className="cards-wrapper position-relative"
                        style={{
                            display: "flex",
                            gap: "16px",
                            overflowX: "auto",
                            paddingBottom: "10px",
                            whiteSpace: "nowrap",
                            paddingTop: "10px"
                        }}
                    >
                        {filteredMembers.map(member => (
                            <Card
                                key={member.id}
                                className="mb-4"
                                style={{ minWidth: "250px", minHeight: "300px" }}
                            >
                                <Card.Body className="p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                    <div>
                                        <div className="mx-auto avatar-lg mb-3">
                                            {member.avatar_document ? (
                                                <img
                                                    src={member.avatar_url}
                                                    alt=""
                                                    className="img-fluid rounded-circle"
                                                />
                                            ) : (
                                                <i className="bx bx-user avatar-title rounded-circle text-primary"></i>
                                            )}
                                        </div>

                                        <h5 className="card-title mb-1">
                                            {member.first_name + ' ' + member.last_name}
                                        </h5>
                                        <p className="text-muted mb-0">{member.designation}</p>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="p-4 text-center">
                                    <ul className="list-inline mb-0">
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
                        ))}
                    </div>
                </Container>
            </div>
        </React.Fragment>
    );
}
