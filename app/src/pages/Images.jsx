import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {Card, Col, Container, Row, Modal, Spinner, Button, Form, InputGroup} from "react-bootstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import "../assets/masonry-gallery.css";
import Masonry from "react-masonry-css";

export default function Images({ id, url, type }) {

    const settings = window.myPluginData || {};

    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [showLightbox, setShowLightbox] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);

    // Filter states
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [albumTitleFilter, setAlbumTitleFilter] = useState('');
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    // State for flatpickr value
    const [dateRangeValue, setDateRangeValue] = useState([]);

    const fetchImages = (aId = null) => {
        setLoading(true);
        let fullUrl = `${settings.root + url}`;

        fetch(fullUrl, {
            headers: { 'X-WP-Nonce': settings.nonce }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setAlbums(data?.albums || []);
                setFilteredAlbums(data?.albums || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchImages();
        }
    }, [settings.root, settings.nonce]);

    // Filter function
    const applyFilters = () => {
        let filtered = [...albums];

        // Filter by album title
        if (albumTitleFilter.trim()) {
            filtered = filtered.filter(album =>
                album.title.toLowerCase().includes(albumTitleFilter.toLowerCase())
            );
        }

        // Filter by date range
        if (dateRange.startDate && dateRange.endDate) {
            filtered = filtered.filter(album => {
                // Adjust this based on your actual album date field
                const albumDate = new Date(album.created_at );
                const startDate = new Date(dateRange.startDate);
                const endDate = new Date(dateRange.endDate);
                // Set time to beginning and end of day for accurate comparison
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                return albumDate >= startDate && albumDate <= endDate;
            });
        }

        setFilteredAlbums(filtered);
        setIsFilterApplied(!!(albumTitleFilter.trim() || (dateRange.startDate && dateRange.endDate)));
    };

    // Reset filters
    const resetFilters = () => {
        setDateRange({ startDate: null, endDate: null });
        setDateRangeValue([]);
        setAlbumTitleFilter('');
        setFilteredAlbums(albums);
        setIsFilterApplied(false);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange({
                startDate: dates[0],
                endDate: dates[1]
            });
            setDateRangeValue(dates);
            console.log(dates);
        }
    };

    // Function to get a random image from an album
    const getRandomImageFromAlbum = (album) => {
        if (!album.photos || album.photos.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * album.photos.length);
        return album.photos[randomIndex];
    };

    // Memoize random images for filtered albums
    const albumThumbnails = useMemo(() => {
        return filteredAlbums.map(album => ({
            album: album,
            thumbnail: getRandomImageFromAlbum(album)
        }));
    }, [filteredAlbums]);

    // Lightbox controls
    const openLightbox = (albumIndex, photoIndex = 0) => {
        setSelectedAlbum(filteredAlbums[albumIndex]);
        setActiveIndex(photoIndex);
        setShowLightbox(true);
        setImageLoading(true);
    };

    const closeLightbox = () => {
        setShowLightbox(false);
        setImageLoading(false);
    };

    const nextImage = useCallback(() => {
        if (selectedAlbum && selectedAlbum.photos) {
            setImageLoading(true);
            setActiveIndex((prev) => (prev + 1) % selectedAlbum.photos.length);
        }
    }, [selectedAlbum]);

    const prevImage = useCallback(() => {
        if (selectedAlbum && selectedAlbum.photos) {
            setImageLoading(true);
            setActiveIndex((prev) =>
                prev === 0 ? selectedAlbum.photos.length - 1 : prev - 1
            );
        }
    }, [selectedAlbum]);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
    };

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

    // Preload image
    useEffect(() => {
        if (showLightbox && selectedAlbum && selectedAlbum.photos) {
            const img = new Image();
            img.onload = handleImageLoad;
            img.onerror = handleImageError;
            img.src = selectedAlbum.photos[activeIndex]?.url;
        }
    }, [activeIndex, selectedAlbum, showLightbox]);

    const breakpointColumnsObj = {
        default: 3,
        992: 2,
        576: 1
    };

    return (
        <>
            <div className="page-content" id="images-page">
                <Container fluid>
                    <div className="container">
                        {/* Filter Panel */}
                        <Card className="mb-2 shadow-sm">
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Control
                                            id="album-name"
                                            placeholder="Search by album title..."
                                            value={albumTitleFilter}
                                            onChange={(e) => setAlbumTitleFilter(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') applyFilters();
                                            }}
                                            className="form-control album-input"
                                        />
                                    </Col>

                                    <Col md={4}>
                                        <Flatpickr
                                            value={dateRangeValue}
                                            onChange={handleDateRangeChange}
                                            options={{
                                                mode: "range",
                                                dateFormat: "Y-m-d",
                                                allowInput: true,
                                                static: true,
                                                animate: true,
                                                position: "auto"
                                            }}
                                            className="form-control"
                                            placeholder="Select date range"
                                        />
                                    </Col>

                                    <Col md={4} className="d-flex align-items-end">
                                        <div className="d-flex gap-2 w-100">
                                            <Button
                                                style={{
                                                    backgroundColor: "#0A4F3E ",
                                                    borderColor: "#0A4F3E ",
                                                    color: "white",
                                                    width: "100%",
                                                }}
                                                onClick={applyFilters}
                                                className="flex-grow-1"
                                            >
                                                Apply Filters
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={resetFilters}
                                                className="flex-grow-1"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Filter Status */}
                                {isFilterApplied && (
                                    <div className="mt-3 text-muted small">
                                        <i className="bi bi-funnel"></i> Showing {filteredAlbums.length} of {albums.length} albums
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="p-0 ms-2"
                                            style={{textDecoration: 'none'}}
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Loading Spinner for Albums */}
                        {loading && (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading albums...</p>
                            </div>
                        )}

                        {/* No Results Message */}
                        {!loading && filteredAlbums.length === 0 && (
                            <div className="text-center py-5">
                                <p className="text-muted">No albums found matching your filters.</p>
                                <Button variant="outline-primary" onClick={resetFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}

                        {/* Masonry Gallery */}
                        {!loading && filteredAlbums.length > 0 && (
                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="d-flex gap-1"
                                columnClassName="bg-transparent"
                            >
                                {albumThumbnails.map(({album, thumbnail}, albumIndex) => (
                                    thumbnail && (
                                        <div
                                            className="gallery-item"
                                            key={albumIndex}
                                            onClick={() => openLightbox(albumIndex, 0)}
                                        >
                                            <div className="img-wrapper">
                                                <img src={thumbnail.url} alt={thumbnail.title}/>
                                                <div className="overlay">
                                                    <div className="text-wrapper text-white text-sm-start">
                                                        <p className="mb-0 text-white fw-bold">{album.title}</p>
                                                        <p className="mb-0 text-white small">
                                                            {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
                                                        </p>
                                                        {album.date && (
                                                            <p className="mb-0 text-white small opacity-75">
                                                                {new Date(album.date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </Masonry>
                        )}
                    </div>
                </Container>
            </div>

            {/* Lightbox Modal */}
            <Modal
                show={showLightbox}
                onHide={closeLightbox}
                centered
                size="lg"
                className=""
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "10px"}}>
                        {selectedAlbum && selectedAlbum.photos && selectedAlbum.title+' : '+selectedAlbum.photos[activeIndex]?.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className="text-center p-1 position-relative"
                    style={{minHeight: "200px", maxHeight: "80vh"}}
                >
                    {selectedAlbum && selectedAlbum.photos && selectedAlbum.photos.length > 0 && (
                        <div className="lightbox-container d-flex justify-content-center align-items-center">
                            {imageLoading && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        zIndex: 10
                                    }}
                                >
                                    <Spinner
                                        animation="border"
                                        variant="primary"
                                        style={{width: "3rem", height: "3rem"}}
                                    />
                                </div>
                            )}

                            <img
                                src={selectedAlbum.photos[activeIndex]?.url}
                                alt={selectedAlbum.photos[activeIndex]?.title}
                                className="lightbox-image"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                    opacity: imageLoading ? 0 : 1,
                                    transition: 'opacity 0.3s ease'
                                }}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                            />

                            {selectedAlbum.photos.length > 1 && (
                                <>
                                    <button
                                        className="lightbox-nav left"
                                        onClick={prevImage}
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            borderRadius: '4px',
                                            zIndex: 20
                                        }}
                                    >
                                        ‹
                                    </button>

                                    <button
                                        className="lightbox-nav right"
                                        onClick={nextImage}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            borderRadius: '4px',
                                            zIndex: 20
                                        }}
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                zIndex: 20
                            }}>
                                {activeIndex + 1} / {selectedAlbum.photos.length}
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}