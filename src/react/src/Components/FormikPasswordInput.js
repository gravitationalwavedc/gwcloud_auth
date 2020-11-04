import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const passwordInputStyle = {
    borderRadius: '0.25rem'
};

const FormikPasswordInput = ({formikProps, formikKey, ...rest}) => {
    const [showPassword, setShowPassword] = useState(false);
    const _error = !!(formikProps.touched[formikKey] && formikProps.errors[formikKey]);

    return (
        <React.Fragment>
            <Form.Group controlId={formikKey}>
                <Form.Label>Password</Form.Label>
                <InputGroup>
                    <Form.Control
                        label='Password'
                        isInvalid={_error}
                        value={formikProps.values[formikKey]}
                        onChange={({target}) => formikProps.setFieldValue(formikKey, target.value)}
                        type={showPassword ? 'text' : 'password'}
                        style={passwordInputStyle}
                        aria-describedby="passwordHelpBlock"
                        {...rest}
                    />
                    <InputGroup.Append>
                        <a className="p-2" onClick={() => setShowPassword(!showPassword)} >
                            { showPassword ? 
                                <HiOutlineEye/> : <HiOutlineEyeOff/>
                            } 
                        </a>
                    </InputGroup.Append>
                </InputGroup>
                <Form.Text id="passwordHelpBlock" muted>
                  At least 8 characters, at least one letter, shouldn't include your name or email, 
                  and can't be too common.
                </Form.Text>
                <Form.Control.Feedback type='invalid'>{formikProps.errors[formikKey]}</Form.Control.Feedback>
            </Form.Group>
        </React.Fragment>
    );
};

export default FormikPasswordInput;
