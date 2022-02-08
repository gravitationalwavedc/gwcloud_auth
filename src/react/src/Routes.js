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
ReactGA.initialize(trackingID);

const renderTrackingRoute = ({ Component, props }) => {
    ReactGA.pageview(props.location.pathname);
    return <Component data={props} {...props} />;
};

const handleRender = ({ Component, props }) => {
    if (!Component || !props)
        return <div>Loading</div>;

    if (!harnessApi.hasAuthToken())
        throw new RedirectException('/auth/?next=' + props.match.location.pathname, 401);
  
    return renderTrackingRoute(Component, props);
};

const getRoutes = () =>
    <Route>
        <Route Component={Login} render={renderTrackingRoute}/>
        <Route path="register" Component={Register} render={renderTrackingRoute}/>
        <Route path="verify" Component={Verify} render={renderTrackingRoute}/>
        <Route 
            path="api-token"
            Component={APIToken}
            environment={harnessApi.getEnvironment('auth')} 
            query={
                graphql`
                    query Routes_APIToken_Query {
                        ...APIToken_data
                    }
                `
            }
            render={handleRender}
        />
    </Route>;

export default getRoutes;
