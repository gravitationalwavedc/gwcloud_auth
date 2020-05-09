import React from 'react'
import {Button, Form, Grid, Header, Image, List, Message, Segment} from "semantic-ui-react";
import {commitMutation} from "relay-runtime";
import {harnessApi} from "../index";
import {graphql} from "graphql";
import * as Enumerable from "linq";
import ReCAPTCHA from 'react-google-recaptcha';

const reCAPTCHARef = React.createRef()

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            email: "",
            firstname: "",
            lastname: "",
            password1: "",
            password2: "",
            verify: false,
            errors: null
        };
    }

    validate() {
        return this.state.username === "" || this.state.email === "" || this.state.firstname === "" || this.state.lastname === "" || this.state.password1.length < 5 || this.state.password2.length < 5 || this.state.password1 !== this.state.password2 || !this.state.captcha
    }

    handleCaptcha = (key) => {
        this.setState({
            captcha: true,
            captchaResponse: key
        })
    }

    submit() {
        commitMutation(harnessApi.getEnvironment("auth"), {
            mutation: graphql`mutation RegisterMutation($input: RegisterInput!)
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
                }`,
            variables: {
                input: {
                    username: this.state.username,
                    email: this.state.email,
                    firstName: this.state.firstname,
                    lastName: this.state.lastname,
                    password1: this.state.password1,
                    password2: this.state.password2,
                    captcha: this.state.captchaResponse
                }
            },
            onCompleted: (response, errors) => {
                if (response.register.result.result)
                    this.setState({
                        ...this.state,
                        verify: true
                    });
                else
                    this.setState({
                        ...this.state,
                        errors: Enumerable.from(response.register.result.errors)
                    })
            },
        });
    }

    render() {
        return this.state.verify ? this.renderVerify() : this.renderForm()
    }

    renderVerify() {
        return (
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='/logo.png'/> Check Your Email
                    </Header>
                    <Message success>
                        Registration submitted. Please check your email.
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }

    renderForm() {
        return (
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='/logo.png'/> Register an Account
                    </Header>
                    <Message error>
                        Do you have a LIGO.org account? <a href='/auth/ligo/'>Login via LIGO.org</a>
                    </Message>
                    <Form size='large'>
                        <Segment.Group stacked>
                            <FormInputWithErrors
                                field="username"
                                icon="user"
                                placeholder="Username"
                                errors={this.state.errors}
                                value={this.state.username}
                                onChange={(e,c) => this.setState({...this.state, username: c.value})}
                            />
                            <FormInputWithErrors
                                field="email"
                                icon="envelope"
                                placeholder="E-mail address"
                                errors={this.state.errors}
                                value={this.state.email}
                                onChange={(e,c) => this.setState({...this.state, email: c.value})}
                            />
                            <FormInputWithErrors
                                field="firstName"
                                icon="address card"
                                placeholder="First name"
                                errors={this.state.errors}
                                value={this.state.firstname}
                                onChange={(e,c) => this.setState({...this.state, firstname: c.value})}
                            />
                            <FormInputWithErrors
                                field="lastName"
                                icon="address card"
                                placeholder="Last name"
                                errors={this.state.errors}
                                value={this.state.lastname}
                                onChange={(e,c) => this.setState({...this.state, lastname: c.value})}
                            />
                            <FormInputWithErrors
                                field="password1"
                                icon="lock"
                                placeholder="Password"
                                type="password"
                                errors={this.state.errors}
                                value={this.state.password1}
                                onChange={(e,c) => this.setState({...this.state, password1: c.value})}
                            />
                            <FormInputWithErrors
                                field="password2"
                                icon="lock"
                                placeholder="Confirm password"
                                type="password"
                                errors={this.state.errors}
                                value={this.state.password2}
                                onChange={(e,c) => this.setState({...this.state, password2: c.value})}
                            />
                            <Segment>
                                <ReCAPTCHA
                                    onChange={this.handleCaptcha}
                                    ref={reCAPTCHARef}
                                    sitekey='6LeXbtgUAAAAAPZ30BNcghORZcsHzLFeRs3qvrcH'
                                    theme='light'
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                />
                            </Segment>

                            <Button color='teal' fluid size='large' disabled={this.validate()}
                                    onClick={() => this.submit()}>
                                Register
                            </Button>
                        </Segment.Group>
                    </Form>
                </Grid.Column>
            </Grid>
        )
    }
}

function FormInputWithErrors(props) {
    return (
        <Segment>
            {props.errors ? props.errors.where(e => e.field === props.field).select(e => (
                    <List bulleted floated="left">
                        {Enumerable.from(e.messages).select((e, i) => (
                            <List.Item key={i}>{e}</List.Item>
                        ))}
                    </List>
                )
            ).toArray() : null}
            <Form.Input fluid icon={props.icon} iconPosition='left' placeholder={props.placeholder}
                        value={props.value} type={props.type}
                        error={props.errors && props.errors.any(e => e.field === props.field)}
                        onChange={props.onChange}/>
        </Segment>
    );
}

export default Register;