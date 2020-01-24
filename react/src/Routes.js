import React from "react";
import {Route} from 'found'
import Login from "./Pages/Login";
import Register from "./Pages/Register";

function getRoutes() {
    return (
        <Route>
            <Route Component={Login}/>
            <Route path="register" Component={Register}/>
        </Route>
    )
}

export default getRoutes;