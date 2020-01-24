import React from 'react'
import {Button, Container, Form, FormInput, Grid, Header, Message, Segment} from "semantic-ui-react";
import Link from 'found/lib/Link';

class Login extends React.Component {
    render() {
        return (
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as='h2' color='teal' textAlign='center'>
                        {/*<Image src='/logo.png' /> Log-in to your account*/}
                    </Header>
                    <Form size='large'>
                        <Segment stacked>
                            <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' />
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                            />

                            <Button color='teal' fluid size='large'>
                                Login
                            </Button>
                        </Segment>
                    </Form>
                    <Message>
                        New to GW Cloud? <Link to='/auth/register/' activeClassName="selected" exact {...this.props}>Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;