import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {Download} from "react-bootstrap-icons";

export default function DownloadButton({ onClick, title = "Download" }) {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{title}</Tooltip>}>
            <Button
                variant="outline-secondary"
                size="sm"
                className="compact-view-btn d-inline-flex align-items-center custom-primary px-3 py-2"
                onClick={onClick}
            >
                <Download color="white" size={12}/>
            </Button>
        </OverlayTrigger>
    );
}
