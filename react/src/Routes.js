import React from "react";
import {Route} from 'found'

class Login extends React.Component {
    render() {
        return (
            <div>Login!</div>
        )
    }
}

class Register extends React.Component {
    render() {
        return (
            <div>Register</div>
        )
    }
}

function getRoutes() {
    return (
        <Route>
            <Route Component={Login}/>
            <Route path="register" Component={Register}/>
        </Route>
    )
}

export default getRoutes;