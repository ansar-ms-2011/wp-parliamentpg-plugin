import React, {useEffect, useState} from 'react';
import {Col, Row} from "react-bootstrap";

// Use a simple data:image SVG placeholder instead of imported file
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function Articles({id, url, type}) {

    const settings = window.myPluginData || {};

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    const fetchArticles = (page = 1) => {
        setLoading(true);

        fetch(`${settings.root + url}?page=${page}&per_page=6`, {
            headers: {'X-WP-Nonce': settings.nonce}
        })
            .then(res => res.json())
            .then(data => {
                // Laravel pagination structure
                setArticles(data?.paginator.data || []);
                setCurrentPage(data?.paginator?.current_page || 1);
                setTotalPages(data?.paginator?.last_page || 1);
                setTotalArticles(data?.paginator?.total || 0);
                setLoading(false);
                console.log(data);
            })
            .catch((error) => {
                console.error("Error fetching articles:", error);
                setLoading(false);
            });
    };

    // Load data
    useEffect(() => {
        if (settings.root && settings.nonce) {
            fetchArticles(currentPage);
        }
    }, [settings.root, settings.nonce, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedArticle(null);
    };

    // Helper function to strip HTML tags for excerpt
    const stripHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    // Handle image load error
    const handleImageError = (articleId) => {
        console.log("Image failed to load for article:", articleId);
        setImageErrors(prev => ({...prev, [articleId]: true}));
    };

    return (
        <div className="wrap" id="articles-page">
            <div className="wp-articles-container">
                <Row className="mt-1">
                    <Col xs={12} sm={12} lg={12} className="mb-1">
                        {/* Pagination */}
                        <div className="tablenav top">
                            <div className="tablenav-pages d-flex align-items-center justify-content-end">
                                <span className="pagination-links">
                                <button
                                    className="button button-small mr-2"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || loading}
                                >
                                    «
                                </button>

                                <button
                                    className="button button-small"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    »
                                </button>
                                </span>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="mt-1">
                    <Col xs={12} sm={12} lg={12} className="mb-1">
                        {loading ? (
                            <div className="wp-articles-loading">
                                <div className="spinner is-active" style={{float: 'none', margin: '20px auto'}}></div>
                                <p className="description" style={{textAlign: 'center'}}>Loading articles...</p>
                            </div>
                        ) : (
                            <div className="wp-articles-grid">
                                {articles.map((article, index) => (
                                    <div
                                        key={article.id || index}
                                        className="wp-article-card"
                                        onClick={() => handleArticleClick(article)}
                                    >
                                        <div className="wp-article-image">
                                            <img
                                                src={(imageErrors[article.id] || !article.thumbnail_image_url) ? PLACEHOLDER_IMAGE : article.thumbnail_image_url}
                                                alt={article.title}
                                                onError={() => handleImageError(article.id)}
                                            />
                                        </div>
                                        <div className="wp-article-content">
                                            <h3 className="wp-article-title">{article.title}</h3>
                                            {article.user && (
                                                <div className="wp-article-meta">
                                                    By {article.user.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && articles.length === 0 && (
                            <div className="notice notice-info">
                                <p>No articles found.</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>

            {/* WordPress Modal Dialog */}
            {showModal && (
                <div className="wp-modal-overlay" onClick={handleCloseModal}>
                    <div className="wp-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="wp-modal-header">
                            <h2>{selectedArticle?.title}</h2>
                            <button
                                type="button"
                                className="wp-modal-close"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="wp-modal-body">
                            {selectedArticle && (
                                <>
                                    <div
                                        className="wp-article-full-content"
                                        dangerouslySetInnerHTML={{__html: selectedArticle.content}}
                                    />
                                    {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                                        <div className="wp-article-keywords">
                                            <strong>Keywords:</strong>
                                            <div className="wp-tag-cloud">
                                                {selectedArticle.keywords.map((tag, idx) => (
                                                    <span key={idx} className="tag-cloud-link">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="wp-article-footer">
                                        {selectedArticle.user && (
                                            <div className="wp-article-author">
                                                By {selectedArticle.user.name}
                                            </div>
                                        )}
                                        {selectedArticle.publish_date && (
                                            <div className="wp-article-date">
                                                Published
                                                on {new Date(selectedArticle.publish_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="wp-modal-footer">
                            <button className="button button-primary" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .wp-articles-container {
                    margin: 5px 0;
                }

                .wp-articles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .wp-article-card {
                    background: #fff;
                    border: 1px solid #c3c4c7;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 1px rgba(0, 0, 0, .04);
                }

                .wp-article-card:hover {
                    border-color: #2271b1;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
                }

                .wp-article-image {
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                    background: #f0f0f1;
                }

                .wp-article-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .wp-article-content {
                    padding: 15px;
                }

                .wp-article-title {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    font-weight: 600;
                    line-height: 1.3;
                    color: #1d2327;
                }

                .wp-article-meta {
                    font-size: 12px;
                    color: #787c82;
                }

                /* Modal Styles */
                .wp-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 160000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .wp-modal-container {
                    background: #f1f1f1;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .wp-modal-header {
                    padding: 15px 20px;
                    background: #fff;
                    border-bottom: 1px solid #dcdcde;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 8px 8px 0 0;
                }

                .wp-modal-header h2 {
                    margin: 0;
                    font-size: 1.3em;
                    font-weight: 600;
                    color: #1d2327;
                }

                .wp-modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #787c82;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    line-height: 1;
                }

                .wp-modal-close:hover {
                    color: #d63638;
                }

                .wp-modal-body {
                    padding: 20px;
                    overflow-y: auto;
                    background: #fff;
                    flex: 1;
                }

                .wp-article-full-content {
                    line-height: 1.6;
                    color: #3c434a;
                }

                .wp-article-full-content img {
                    max-width: 100%;
                    height: auto;
                }

                .wp-article-keywords {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #dcdcde;
                }

                .wp-tag-cloud {
                    margin-top: 10px;
                }

                .tag-cloud-link {
                    display: inline-block;
                    background: #f0f0f1;
                    padding: 4px 10px;
                    margin: 0 5px 5px 0;
                    border-radius: 3px;
                    font-size: 12px;
                    color: #2c3338;
                    text-decoration: none;
                }

                .wp-article-footer {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #dcdcde;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #787c82;
                }

                .wp-modal-footer {
                    padding: 15px 20px;
                    background: #fff;
                    border-top: 1px solid #dcdcde;
                    text-align: right;
                    border-radius: 0 0 8px 8px;
                }

                /* Pagination styles */
                .tablenav-pages {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pagination-links {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-left: 10px;
                }

                .paging-input {
                    font-size: 13px;
                }

                .current-page, .total-pages {
                    font-weight: 600;
                }

                /* Loading spinner */
                .wp-articles-loading {
                    text-align: center;
                    padding: 40px;
                }

                /* Responsive */
                @media (max-width: 782px) {
                    .wp-articles-grid {
                        grid-template-columns: 1fr;
                    }

                    .wp-modal-container {
                        width: 95%;
                        max-height: 90vh;
                    }
                }
            `}</style>
        </div>
    );
}