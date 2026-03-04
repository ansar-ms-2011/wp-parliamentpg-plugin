import React, {useEffect, useState} from 'react';
import {
    Card,
    Col,
    Container,
    Row,
    Modal,
    Spinner
} from "react-bootstrap";

export default function Videos({id, url, type}) {

    const settings = window.myPluginData || {};

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);

    const fetchVideos = (aId = null) => {
        setLoading(true);

        fetch(`${settings.root + url}?aId=${aId}`, {
            headers: {'X-WP-Nonce': settings.nonce}
        })
            .then(res => res.json())
            .then(data => {
                setVideos(data?.videos || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching videos:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchVideos();
        }
    }, [settings.root, settings.nonce]);

    const handleOpen = (video) => {
        setActiveVideo(video);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setActiveVideo(null);
    };

    return (
        <>
            <div className="page-content" id="videos-page">
                <Container fluid>
                    {loading && (
                        <div className="text-center my-5">
                            <Spinner animation="border"/>
                        </div>
                    )}

                    <Row className="mt-1">
                        {videos.map(video => (
                            <Col
                                key={video.id}
                                xs={12}
                                sm={6}
                                lg={4}
                                className="mb-1 d-flex"
                            >
                                <Card
                                    className="video-card w-100 h-100 shadow-sm"
                                    onClick={() => handleOpen(video)}
                                >
                                    <div className="thumbnail-wrapper">
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="video-thumbnail"
                                        />
                                        <span className="video-duration">
                                            {video.duration}
                                        </span>
                                        <div className="play-overlay">
                                            <div className="play-button">▶</div>
                                        </div>
                                    </div>

                                    <Card.Body>
                                        <h6 className="video-title">
                                            {video.title}
                                        </h6>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* Video Modal */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: "1rem"}}>{activeVideo?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {activeVideo && (
                        <div className="ratio ratio-16x9">
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=1`}
                                title={activeVideo.title}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}