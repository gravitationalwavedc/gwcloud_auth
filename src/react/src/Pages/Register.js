import React, { useState } from 'react';
import BrandColumns from '../Components/BrandColumns';
import RegisterForm from '../Components/RegisterForm';
import { Link } from 'found';
import { HiOutlineCheckCircle } from 'react-icons/hi';


const Register = (props) => {
    const [verify, setVerify] = useState(false);

    return (
        <BrandColumns>
            {
                verify ?
                    <React.Fragment>
                        <h2>
                            <HiOutlineCheckCircle className="text-success mb-2 mr-1"/>
                                            Thanks for registering.
                        </h2>
                        <h4 className="mt-4">
                                            You will need to verify your email to complete registration.
                        </h4>
                        <p>
                                          An email has been sent to you with a link to verify your account. 
                                          If the email doesn't appear within a few minutes try checking your 
                                          spam folder.
                        </p>
                    </React.Fragment> : 
                    <React.Fragment>
                        <h2 className="mb-4">
                                          Register
                        </h2>
                        <RegisterForm setVerify={setVerify}/>
                        <p className="mt-3">
                            <Link to='/auth/' activeClassName="selected" exact {...props}>
                                          Already have an account?
                            </Link>
                        </p>
                    </React.Fragment>
            }
        </BrandColumns>
    );
};

export default Register;
