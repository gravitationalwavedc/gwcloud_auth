import React from 'react';
import {Route} from 'found';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Verify from './Pages/Verify';
import APIToken from './Pages/APIToken';
import { harnessApi } from '.';
import {graphql} from 'react-relay';
// import Loading from './Components/Loading';
import {RedirectException} from 'found';

const handleRender = ({Component, props}) => {
    if (!Component || !props)
        return <div>Loading</div>;

    if (!harnessApi.hasAuthToken())
        throw new RedirectException('/auth/?next=' + props.match.location.pathname, 401);
  
    return <Component data={props} {...props}/>;
};

const getRoutes = () =>
    <Route>
        <Route Component={Login}/>
        <Route path="register" Component={Register}/>
        <Route path="verify" Component={Verify}/>
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
