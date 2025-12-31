import React from "react";
import {Pagination} from "react-bootstrap";

export default function CustomPagination({meta, onPageChange}) {
    if (!meta) return null;

    const {
        current_page,
        last_page,
        links,
    } = meta;

    const isDisabled = (label) =>
        (label.includes("Previous") && current_page === 1) ||
        (label.includes("Next") && current_page === last_page);

    const handleClick = (url, pageNumber) => {
        if (!url) return;

        onPageChange?.(pageNumber);
    };

    return (
        <Pagination className="mt-3">
            {links?.map((link, index) => {
                const decodedLabel = link.label.replace(/&laquo;|&raquo;/g, (m) =>
                    m === "&laquo;" ? "«" : "»"
                );

                // Previous / Next
                if (decodedLabel === "« Previous" || decodedLabel === "Next »") {
                    return (
                        <Pagination.Item
                            key={index}
                            disabled={isDisabled(decodedLabel)}
                            onClick={() => handleClick(link.url, link.page)}
                        >
                            {decodedLabel}
                        </Pagination.Item>
                    );
                }

                return (
                    <Pagination.Item
                        key={index}
                        className="custom-page-item"
                        active={link.active}
                        onClick={() => handleClick(link.url, link.page)}
                    >
                        {link.label}
                    </Pagination.Item>
                );
            })
            }
        </Pagination>
    );
}