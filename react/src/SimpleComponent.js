import React from "react";
import {QueryRenderer, graphql, createFragmentContainer} from "react-relay"

import {
    Environment,
    Network,
    RecordSource,
    Store,
} from 'relay-runtime';

function fetchQuery(
    operation,
    variables,
) {
    return fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
            // Add authentication and other headers here
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            query: operation.text, // GraphQL text from input
            variables,
        }),
    }).then(response => {
        return response.json();
    });
}

// Create a network layer from the fetch function
const network = Network.create(fetchQuery);
const store = new Store(new RecordSource())

const environment = new Environment({
    network,
    store
});

class SimpleComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ""
        }
    }

    render() {
        return (
            <div>
                <p>I am a simple component.</p>
                <p>My input value is: <strong>{this.state.value}</strong></p>
                <input type='text' value={this.state.value}
                       onChange={event => this.setState({value: event.target.value})}/>

                <QueryRenderer
                    environment={environment}
                    query={graphql`
                    query SimpleComponentQuery($gwclouduserId: ID!) {
                      gwclouduser(id: $gwclouduserId) {
                        id
                        username
                        firstName
                      }
                    }
                    `
                    }
                    variables={{gwclouduserId: "R1dDbG91ZFVzZXJOb2RlOjE="}}
                    render={({error, props}) => {
                        if (error) {
                            return <div>{error.message}</div>;
                        } else if (props) {
                            console.log("Rendered 2", error, props, props.gwclouduser.id);
                            return (
                                <div>
                                    <p>Username: {props.gwclouduser.username}</p>
                                </div>
                            );
                        }
                        return <div>Loading</div>;
                    }}
                />
            </div>
        );
    }
}

export default SimpleComponent;