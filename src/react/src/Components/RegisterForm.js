import React from 'react';
import {graphql} from 'graphql';
import {Button, Form} from 'react-bootstrap';
import {commitMutation} from 'relay-runtime';
import {harnessApi} from '../index';
import {Formik} from 'formik';
import * as yup from 'yup';
import FormikInput from './FormikInput';
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
    username: yup
        .string()
        .label('Username')
        .required(),
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
    password1: yup
        .string()
        .label('Password')
        .min(8)
        .required(),
    password2: yup
        .string()
        .label('Confirm password')
        .oneOf([yup.ref('password1'), null], 'Passwords do not match')
        .required(),
    captcha: yup
        .string()
        .nullable()
        .required('Please complete the captcha')
});

const RegisterForm = ({setVerify}) =>
    <Formik
        initialValues={{
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password1: '',
            password2: '',
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
            });
        }}
        validationSchema={validationSchema}
    >
        {
            formikProps => (
                <React.Fragment>
                    <h6 className="mb-4">Create GWCloud Account</h6>
                    {
                        formikProps.errors['general'] ?
                            <p className='text-danger'>
                                {formikProps.errors['general']}
                            </p> : null
                    }
                    <Form>
                        <FormikInput
                            label='Username'
                            placeholder='Username'
                            formikProps={formikProps}
                            formikKey='username'
                        />
                        <FormikInput
                            label='Email'
                            placeholder='Email'
                            formikProps={formikProps}
                            formikKey='email'
                            type='email'
                        />
                        <FormikInput
                            label='First Name'
                            placeholder='First Name'
                            formikProps={formikProps}
                            formikKey='firstName'
                        />
                        <FormikInput
                            label='Last Name'
                            placeholder='Last Name'
                            formikProps={formikProps}
                            formikKey='lastName'
                        />
                        <FormikInput
                            label='Password'
                            placeholder='Password'
                            formikProps={formikProps}
                            formikKey='password1'
                            type='password'
                        />
                        <FormikInput
                            label='Confirm Password'
                            placeholder='Confirm Password'
                            formikProps={formikProps}
                            formikKey='password2'
                            type='password'
                        />
                        {
                            formikProps.touched['captcha'] && formikProps.errors['captcha'] ?
                                <p className='text-danger'>
                                    {formikProps.touched['captcha'] && formikProps.errors['captcha']}
                                </p> : null
                        }
                        <ReCAPTCHA
                            onChange={key => formikProps.setFieldValue('captcha', key)}
                            ref={reCAPTCHARef}
                            sitekey='6LffMdwZAAAAANPI_fGskDE5dCyWPq9Q4eiiePCQ'
                            theme='light'
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        />
                        <Button
                            className="mb-4"
                            variant="primary"
                            onClick={formikProps.handleSubmit}
                            disabled={formikProps.isSubmitting}
                            type='submit'
                        >
                            Register
                        </Button>
                    </Form>
                </React.Fragment>
            )
        }
    </Formik>;


export default RegisterForm;
