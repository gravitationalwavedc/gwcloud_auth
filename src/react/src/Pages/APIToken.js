import React, { useState } from 'react';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay';
import { harnessApi } from '../index';
import { CopyButton, SpoilerButton, CheckButton } from '../Components/CustomButtons';
import { Button, Container, Row, Col } from 'react-bootstrap';


const APIToken = (props) => {
    const app = harnessApi.currentProject().domain;
    const appName = harnessApi.currentProject().name;
    const [token, setToken] = useState(props.data.apiToken);

    const createToken = () => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenCreateMutation($input: CreateAPITokenInput!){
                createApiToken(input: $input) {
                    result {
                        token
                    }
                }
            }`,
            variables: {
                input: {
                    app: app
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors);
                } else {
                    setToken(
                        response.createApiToken.result.token
                    );
                }
            },
        });
    };
    
    const revokeToken = () => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenRevokeMutation($input: RevokeAPITokenInput!){
                revokeApiToken(input: $input) {
                    result
                }
            }`,
            variables: {
                input: {
                    app: app,
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors);
                } else {
                    setToken(null);
                }
            },
        });
    };

    return (
        <Container>
            <h1 className="pt-5 mb-4">
                {appName + ' API Token'}
            </h1>
            <Row className='align-items-center'>
                {
                    token ?
                        <>
                            <Col>
                                <SpoilerButton content='Click to show token...' hiddenContent={token}/>
                            </Col>
                            <Col>
                                <CopyButton variant="text btn-link" content='Copy Token' copyContent={token}/>
                                <CheckButton
                                    variant="text text-danger"
                                    content='Revoke Token'
                                    cancelContent='Revoke token?'
                                    onClick={revokeToken}
                                />
                            </Col>
                        </>
                        :
                        <Col>
                            <Button
                                variant='primary'
                                onClick={createToken}
                            >
                                Create Token
                            </Button>
                        </Col>
                }
            </Row>
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
