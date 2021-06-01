import React, { useEffect, useState } from 'react';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay';
import { harnessApi } from '../index';
import { Button, Card, Container } from 'react-bootstrap';


const APIToken = (props) => {
    
    const [token, setToken] = useState(null)

    const createToken = () => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenCreateMutation($input: CreateAPITokenInput!){
                createApiToken(input: $input) {
                  result
                }
              }`,
            variables: {
                input: {
                    username: harnessApi.currentUser.username,
                    app: 'Bilby'
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors)
                } else {
                    setToken(response.createApiToken.result)
                }
            },
        })
    }

    const revokeToken = () => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenRevokeMutation($input: RevokeAPITokenInput!){
                revokeApiToken(input: $input) {
                  result
                }
              }`,
            variables: {
                input: {
                    username: harnessApi.currentUser.username,
                    app: 'Bilby'
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors)
                } else {
                    setToken(response.revokeApiToken.result)
                }
            },
        })
    }
    
    return (
        <Container>
            <Card className="text-center">
                <Card.Header>API Token</Card.Header>
                <Card.Text>{token ? token : props.data.apiToken}</Card.Text>
                <Card.Footer className="text-muted">
                    <Button onClick={createToken}>Create Token</Button>
                    <Button onClick={revokeToken}>Revoke Token</Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default createFragmentContainer(APIToken, 
    {
        data: graphql`
            fragment APIToken_data on Query @argumentDefinitions(
                app: {type: "String!"}
            ){
                apiToken (app: $app)
            }
        ` 
    }
);
