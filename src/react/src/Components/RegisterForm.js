import React, { useState } from 'react';
import {graphql} from 'graphql';
import {Row, Col, Button, Form} from 'react-bootstrap';
import {commitMutation} from 'relay-runtime';
import {harnessApi} from '../index';
import {Formik} from 'formik';
import * as yup from 'yup';
import FormikInput from './FormikInput';
import FormikPasswordInput from './FormikPasswordInput';
import ReCAPTCHA from 'react-google-recaptcha';

const reCAPTCHARef = React.createRef();

const registerMutation = graphql`
mutation RegisterFormMutation($input: RegisterInput!)
{
  register(input: $input) 
  {
    result {
      result
      errors {
        field,
        messages
      }
    }
  }
}`;

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .label('Email address')
        .email()
        .required(),
    firstName: yup
        .string()
        .label('First name')
        .required(),
    lastName: yup
        .string()
        .label('Last name')
        .required(),
    password: yup
        .string()
        .label('Password')
        .min(8)
        .required(),
    captcha: yup
        .string()
        .required()
});


const RegisterForm = ({setVerify}) => {
    const [serverErrors, setServerErrors] = useState('');

    const handleSubmit = async (formikProps) => {
        await reCAPTCHARef.current.executeAsync();
        formikProps.handleSubmit();
    };

    return (
        <Formik
            initialValues={{
                email: '',
                firstName: '',
                lastName: '',
                password: '',
                captcha: ''
            }}
            onSubmit={(values, actions) => {
                commitMutation(harnessApi.getEnvironment('auth'), {
                    mutation: registerMutation,
                    variables: {
                        input: {
                            ...values
                        }
                    },
                    onCompleted: ({register}) => {
                        if (register.result.result) {
                            setVerify(true);
                        } else {
                            register.result.errors.forEach(e => {
                                actions.setFieldError(e.field, e.messages[0]);
                            });
                            reCAPTCHARef.current.reset();
                            actions.setSubmitting(false);
                        }
                    },
                    onError: (error) => {
                        setServerErrors(error);
                    }
                });
            }}
            validationSchema={validationSchema}
        >
            {
                formikProps => (
                    <React.Fragment>
                        {
                            formikProps.errors['general'] ?
                                <p className='text-danger'>
                                    {formikProps.errors['general']}
                                </p> : null
                        }
                        <Form>
                            <FormikInput
                                label='Email'
                                formikProps={formikProps}
                                formikKey='email'
                                type='email'
                            />
                            <Row>
                                <Col>
                                    <FormikInput
                                        label='First Name'
                                        formikProps={formikProps}
                                        formikKey='firstName'
                                    />
                                </Col>
                                <Col>
                                    <FormikInput
                                        label='Last Name'
                                        formikProps={formikProps}
                                        formikKey='lastName'
                                    />
                                </Col>
                            </Row>
                            <FormikPasswordInput
                                formikProps={formikProps}
                                formikKey='password'
                            />
                            <ReCAPTCHA
                                onChange={key => formikProps.setFieldValue('captcha', key)}
                                ref={reCAPTCHARef}
                                sitekey='6LdtDt0ZAAAAAAra0HiqN3Qqgl7tilEunpHgtzCK'
                                size="invisible"
                                theme='light'
                                style={{
                                    display: 'flex',
                                }}
                            />
                            <Button
                                className="mb-4 mt-4"
                                variant="primary"
                                size="block"
                                onClick={() => handleSubmit(formikProps)}
                                disabled={formikProps.isSubmitting}
                            >
                              Create new account
                            </Button>
                            <Form.Text style={{marginTop: '-1rem'}} muted>
                                This site is protected by reCAPTCHA and the Google
                                <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
                                <a href="https://policies.google.com/terms"> Terms of Service</a> apply. 
                            </Form.Text>
                        </Form>
                    </React.Fragment>
                )
            }
        </Formik>);
};


export default RegisterForm;
