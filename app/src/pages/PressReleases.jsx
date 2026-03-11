import React, {useEffect, useState} from 'react';
import {Button, Card, Col, Container, Modal, Row} from "react-bootstrap";
import CustomPagination from "../components/CustomPagination";
import { format, parseISO } from "date-fns";
export default function PressReleases({id, url, type}) {

    const settings = window.myPluginData || {};

    const [releases, setReleases] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [currentPressRelease, setCurrentPressRelease] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchReleases(1);
    }, []);


    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        return format(date, 'EEEE d, MMMM yyyy');
    }
    const handlePageChange = (pageNumber) => {
        console.log(pageNumber);
        fetchReleases(pageNumber);
    }

    const handleReadMoreClick = (release) => {
        setCurrentPressRelease(release);
        setShow(true);
    }
    const handleClose = () => {
        setShow(false);
        setCurrentPressRelease(null);
    }

    const fetchReleases = (page = 1) => {
        setLoading(true);

        fetch(`${settings.root + url}?page=${page}`, {
            headers: {'X-WP-Nonce': settings.nonce}
        })
            .then(res => res.json())
            .then(data => {
                setReleases(data.pressReleases?.data);
                setMeta(data.pressReleases);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
    };

    return (
        <React.Fragment>
            <div className="page-content" id="press-releases-page">
                <Container fluid>
                    {releases.map((release, index) => (
                        <Row key={index}>
                            <Col md={12} className="d-flex align-items-center mb-2">
                                <label className="fw-bold text-decoration-underline" htmlFor={'label-'+index}>{release.title}</label>
                            </Col>
                            <Col md={12} className="d-flex align-items-center mb-2">
                                <div id={'label-'+index} dangerouslySetInnerHTML={{__html: release.excerpt}}></div>
                            </Col>
                            <Col md={12} className="d-flex align-items-center mb-2">
                                <span className="news-published-date">{ formatDate(release.publish_date) }</span>
                            </Col>
                            <Col md={12} className="d-flex align-items-center mb-2">
                                <a href={release.url} target="_blank" rel="noopener noreferrer"
                                   className="btn btn-sm custom-primary"
                                   onClick={() => handleReadMoreClick(release)}
                                >
                                    Read More
                                </a>
                            </Col>
                            <Col md={12} className="my-1">
                                <hr/>
                            </Col>
                        </Row>
                    ))}
                    <Row>
                        <Col md={12} className="d-flex align-items-center justify-content-center my-4">
                            <CustomPagination meta={meta} onPageChange={handlePageChange}></CustomPagination>
                        </Col>
                    </Row>
                </Container>
                {currentPressRelease && (
                    <Modal show={show} onHide={handleClose} centered size="lg">
                        <Modal.Header closeButton>
                            <h5 className="fw-bold mb-0">{currentPressRelease.title}</h5>
                        </Modal.Header>
                        <Modal.Body>
                            <div dangerouslySetInnerHTML={{__html: currentPressRelease.content}}></div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose} size="sm">
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </React.Fragment>
    );
}
