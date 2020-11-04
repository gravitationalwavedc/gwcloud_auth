import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ErrorMessage = ({ heading, message }) => 
    <React.Fragment>
        <h2 className="text-danger">
            <HiOutlineExclamationCircle className="mb-2 mr-1"/>
            {heading}
        </h2>
        <p>{message}</p>
    </React.Fragment>;

ErrorMessage.defaultProps = {
    message: `The registration token is wrong or has been used already. 
            Try registering again or click the link in your verification registration email.`
};

export default ErrorMessage;
