import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Container, Row, Modal } from "react-bootstrap";

export default function Images({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [showLightbox, setShowLightbox] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const fetchImages = (aId = null) => {
        setLoading(true);
        let fullUrl = `${settings.root + url}`;
        if (aId) fullUrl = fullUrl + "?aId=" + aId;

        fetch(fullUrl, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setImages(data?.images || []);
                setAlbums(data?.albums || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchImages();
        }
    }, [settings.root, settings.nonce]);

    // Lightbox controls
    const openLightbox = (index) => {
        setActiveIndex(index);
        setShowLightbox(true);
    };

    const closeLightbox = () => setShowLightbox(false);

    const nextImage = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setActiveIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showLightbox) return;

            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showLightbox, nextImage, prevImage]);

    return (
        <>
            <div className="page-content" id="images-page">

                <Container fluid>
                    {loading && <p>Loading images…</p>}

                    <Row>
                        <Col xs={12} md={4}>
                            <div className="mb-3">
                                <label htmlFor="albumSelect" className="form-label">
                                    Select Album:
                                </label>
                                <select
                                    id="albumSelect"
                                    className="form-select"
                                    value={selectedAlbum || ""}
                                    onChange={(e) => {
                                        setSelectedAlbum(e.target.value)
                                        console.log(e.target.value)
                                        fetchImages(e.target.value)
                                    }}
                                >
                                    <option value="">All Albums</option>
                                    {albums?.map(album => (
                                        <option key={album.value} value={album.value}>
                                            {album.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        {images.map((image, index) => (
                            <Col
                                key={image.id}
                                xs={12}
                                sm={6}
                                lg={4}
                                className="mb-4 d-flex"
                            >
                                <Card
                                    className="w-100 image-card"
                                    onClick={() => openLightbox(index)}
                                >
                                    <div className="image-wrapper">
                                        <img
                                            src={image.url}
                                            alt={image.title}
                                            className="gallery-img"
                                        />
                                        <div className="image-overlay">
                                            <span>{image.title}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* Lightbox Modal */}
            <Modal
                show={showLightbox}
                onHide={closeLightbox}
                centered
                size="lg"
                className="lightbox-modal"
            >
                <Modal.Body className="text-center p-0 position-relative">

                    {images.length > 0 && (
                        <>
                            <img
                                src={images[activeIndex]?.url}
                                alt={images[activeIndex]?.title}
                                className="lightbox-image"
                            />

                            <div className="lightbox-caption">
                                {images[activeIndex]?.title}
                            </div>

                            <button
                                className="lightbox-nav left"
                                onClick={prevImage}
                            >
                                ‹
                            </button>

                            <button
                                className="lightbox-nav right"
                                onClick={nextImage}
                            >
                                ›
                            </button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}