import React from "react";

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
                <input type='text' value={this.state.value} onChange={event => this.setState({value: event.target.value})}/>
            </div>
        );
    }
}

export default SimpleComponent;