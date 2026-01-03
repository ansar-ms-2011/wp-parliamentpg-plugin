import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { ElementorButton } from "./ElementorButton";

export function Filter({ fields = [], onChange, onSubmit }) {
    const initialState = fields.reduce(
        (acc, field) => ({ ...acc, [field.id]: "" }),
        {}
    );

    const [values, setValues] = useState(initialState);

    function handleChange(e, id) {
        const newValues = { ...values, [id]: e.target.value };
        setValues(newValues);
        onChange?.(newValues);           // notify parent immediately
    }

    function handleReset() {
        setValues(initialState);
        onChange?.(initialState);        // notify reset
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit?.(values);              // final filter action
    }

    return (
        <Form onSubmit={handleSubmit} onReset={handleReset}>
            <Row className="align-items-end">
                {fields.map((field) => (
                    <Col md={3} key={field.id}>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor={field.id}>{field.label}</Form.Label>

                            <Form.Select
                                id={field.id}
                                aria-label={field.aria || field.label}
                                value={values[field.id]}
                                onChange={(e) => handleChange(e, field.id)}
                            >
                                <option value="">{field.placeholder}</option>

                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                ))}

                <Col className="d-flex justify-content-end align-items-center gap-3">
                    <ElementorButton size="sm" type="reset">
                        Reset
                    </ElementorButton>

                    <ElementorButton size="sm" className="custom-primary" type="submit">
                        Filter
                    </ElementorButton>
                </Col>
            </Row>
        </Form>
    );
}
