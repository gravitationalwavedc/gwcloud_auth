import React from 'react'
import { Container, Col, Row, Button } from "react-bootstrap";
import LoginForm from "../Components/LoginForm";
import livingstonBackground from "../Assets/ligo-livingston-blue.png";
import gwdcLogo from "../Assets/GWDC_grey_full_571x150.png";
import gwcloudLogo from "../Assets/GWC-Green192-768x521.png";
import ncrisLogo from "../Assets/ncris_logo.png";
import ozgravLogo from "../Assets/ozgrav-logo-array-tk005-final-invert-textedit.png";
import aalLogo from "../Assets/aal-logo-rp-revised-wwording-800px.png";

const isProduction = process.env.NODE_ENV === 'production';

const Login = (props) =>  {
    return (
      <Container className="h-100" fluid>
        <Row className="h-100">
          <Col style={{background: `url(${livingstonBackground}) no-repeat center`, backgroundSize: "cover"}} className="text-center">
            <h1 style={{marginTop: "230px", color:"#F0FAFF"}}><img style={{height:"32px", marginBottom: "8px"}} src={gwcloudLogo} /> GWCloud</h1>
          </Col>
          <Col className="h-100">
            <img src={gwdcLogo} style={{position:"absolute", height:"40px", marginTop:"10px"}}/>
            <Row className="justify-content-md-center">
              <Col md={8} style={{marginTop: "230px"}}>
                <h2 className="mb-4">Sign in</h2>
                <Button className="mb-4" variant="primary" href="/auth/ligo/" block size="lg">Continue with LIGO authentication</Button>
                <p>Interested in joining the LIGO Scientific Collaboration? <a href="https://www.ligo.org/about/join.php">Apply to join</a></p>
                {!isProduction && <LoginForm {...props} />}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="fixed-bottom">
          <Col></Col>
          <Col>
            <Row className="justify-content-md-center mb-5">
              <Col md={8}>
                <Row className="align-items-end">
                  <Col >
                    <img src={ncrisLogo} style={{maxWidth: "100%", maxHeight: "70px"}} />
                </Col>
                  <Col className="text-center" >
                  <img src={ozgravLogo} style={{maxWidth: "100%", maxHeight: "100px"}}/>
                </Col>
                <Col className="text-right">
                  <img src={aalLogo} style={{maxWidth: "100%", maxHeight: "48px"}}/>
                </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
}

export default Login;
