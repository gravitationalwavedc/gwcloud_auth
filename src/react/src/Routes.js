import React from 'react';
import {Route} from 'found';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Verify from './Pages/Verify';


const getRoutes = () =>
    <Route>
        <Route Component={Login}/>
        <Route path="register" Component={Register}/>
        <Route path="verify" Component={Verify}/>
    </Route>;

export default getRoutes;
