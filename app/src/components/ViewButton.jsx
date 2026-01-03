import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {Eye} from "react-bootstrap-icons";

export default function ViewButton({ onClick, title = "View Details" }) {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{title}</Tooltip>}>
            <Button
                variant="outline-secondary"
                size="sm"
                className="compact-view-btn d-inline-flex align-items-center custom-primary"
                onClick={onClick}
            >
                <Eye color="white" size={12}/>
            </Button>
        </OverlayTrigger>
    );
}
