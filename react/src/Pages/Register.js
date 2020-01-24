import React from 'react'
import {Button, Form, Grid, Header, Image, List, Message, Segment} from "semantic-ui-react";
import Link from 'found/lib/Link';
import {commitMutation} from "relay-runtime";
import {harnessApi} from "../index";
import {graphql} from "graphql";
import * as Enumerable from "linq";

class Register extends React.Component {
    constructor() {
        super();

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
        return this.state.username === "" || this.state.email === "" || this.state.firstname === "" || this.state.lastname === "" || this.state.password1.length < 5 || this.state.password2.length < 5 || this.state.password1 !== this.state.password2
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
                    password2: this.state.password2
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
                        Do you have a LIGO.org account? <Link to='/auth/ligo/' activeClassName="selected"
                                                              exact {...this.props}>Login via LIGO.org</Link>
                    </Message>
                    <Form size='large'>
                        <Segment stacked>
                            {this.state.errors ? this.state.errors.where(e => e.field === "username").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input fluid icon='user' iconPosition='left' placeholder='Username'
                                        value={this.state.username}
                                        error={this.state.errors && this.state.errors.any(e => e.field === "username")}
                                        onChange={(e, c) => this.setState({...this.state, username: c.value})}/>
                            {this.state.errors ? this.state.errors.where(e => e.field === "email").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input fluid icon='envelope' iconPosition='left' placeholder='E-mail address'
                                        value={this.state.email}
                                        error={this.state.errors && this.state.errors.any(e => e.field === "email")}
                                        onChange={(e, c) => this.setState({...this.state, email: c.value})}/>
                            {this.state.errors ? this.state.errors.where(e => e.field === "firstName").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input fluid icon='address card' iconPosition='left' placeholder='First name'
                                        value={this.state.firstname}
                                        error={this.state.errors && this.state.errors.any(e => e.field === "firstName")}
                                        onChange={(e, c) => this.setState({...this.state, firstname: c.value})}/>
                            {this.state.errors ? this.state.errors.where(e => e.field === "lastName").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input fluid icon='address card' iconPosition='left' placeholder='Last name'
                                        value={this.state.lastname}
                                        error={this.state.errors && this.state.errors.any(e => e.field === "lastName")}
                                        onChange={(e, c) => this.setState({...this.state, lastname: c.value})}/>
                            {this.state.errors ? this.state.errors.where(e => e.field === "password1").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                                value={this.state.password1}
                                onChange={(e, c) => this.setState({...this.state, password1: c.value})}
                                error={this.state.errors && this.state.errors.any(e => e.field === "password1")}
                            />
                            {this.state.errors ? this.state.errors.where(e => e.field === "password2").select(e => (
                                    <List bulleted floated="left">
                                        {Enumerable.from(e.messages).select((e, i) => (
                                            <List.Item key={i}>{e}</List.Item>
                                        ))}
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Confirm password'
                                type='password'
                                value={this.state.password2}
                                onChange={(e, c) => this.setState({...this.state, password2: c.value})}
                                error={this.state.errors && this.state.errors.any(e => e.field === "password2")}
                            />

                            <Button color='teal' fluid size='large' disabled={this.validate()}
                                    onClick={() => this.submit()}>
                                Register
                            </Button>
                        </Segment>
                    </Form>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;