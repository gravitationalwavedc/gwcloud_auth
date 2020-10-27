import {Form} from 'react-bootstrap';
import React from 'react';

const FormikInput = ({formikProps, formikKey, label, placeholder, ...rest}) => {
    const _error = !!(formikProps.touched[formikKey] && formikProps.errors[formikKey]);

    return (
        <React.Fragment>
            <Form.Group controlId={formikKey}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                    isInvalid={_error}
                    placeholder={placeholder}
                    value={formikProps.values[formikKey]}
                    onChange={({target}) => formikProps.setFieldValue(formikKey, target.value)}
                    {...rest}
                />
                <Form.Control.Feedback type='invalid'>
                    {formikProps.errors[formikKey]}
                </Form.Control.Feedback>
            </Form.Group>
        </React.Fragment>
    );
};

export default FormikInput;