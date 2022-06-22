import React from 'react';
import ReactGA from 'react-ga';
import { Route } from 'found';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Verify from './Pages/Verify';
import APIToken from './Pages/APIToken';
import { harnessApi } from '.';
import { graphql } from 'react-relay';
import { RedirectException } from 'found';


//Initialise Google Analytics
const trackingID = 'UA-219714075-1';
ReactGA.initialize(trackingID, { testMode: process.env.NODE_ENV === 'test' });

const handleRender = ( Component, props, loginRequired ) => {
    if (!Component || !props)
        return <div>Loading</div>;

    // Everyone loves hax
    if (props.location !== undefined && props.match === undefined)
        props.match = {
            location: props.location
        };

    if (loginRequired && !harnessApi.hasAuthToken())
        throw new RedirectException('/auth/?next=' + props.match.location.pathname, 401);
  
    ReactGA.pageview(props.match.location.pathname);
    return <Component data={props} {...props} />;
};

const handleRenderWithRedirect = ({ Component, props }) => handleRender(Component, props, true);
const handleRenderWithoutRedirect = ({ Component, props }) => handleRender(Component, props, false);

const getRoutes = () =>
    <Route>
        <Route Component={Login} render={handleRenderWithoutRedirect}/>
        <Route path="register" Component={Register} render={handleRenderWithoutRedirect}/>
        <Route path="verify" Component={Verify} render={handleRenderWithoutRedirect}/>
        <Route 
            path="api-token"
            Component={APIToken}
            environment={harnessApi.getEnvironment('auth')} 
            query={
                graphql`
                    query Routes_APIToken_Query ($app: String!){
                        ...APIToken_data @arguments(app: $app)
                    }
                `
            }
            prepareVariables={() => ({
                app: harnessApi.currentProject().domain
            })}
            render={handleRenderWithRedirect}
        />
    </Route>;

export default getRoutes;
