import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import FooterLogos from './FooterLogos';
import GWCloudBrandColumn from '../Components/GWCloudBrandColumn';
import GWLabBrandColumn from '../Components/GWLabBrandColumn';
import { harnessApi } from '../index';

const setProjectColumn = (projectName) => {
    if(projectName === 'GWLab') {
        return GWLabBrandColumn;
    }

    return GWCloudBrandColumn;
};

const BrandColumn = ({ children }) => {

    const project = harnessApi.currentProject();
    
    const ProjectColumn = setProjectColumn(project.name);
    
    return (
        <Container className="h-100" fluid>
            <Row className="h-100">
                <ProjectColumn />
                <Col className="align-self-center" style={{ marginTop: '5rem' }}>
                    <Row className="justify-content-md-center">
                        <Col lg={8} md={10}>
                            { children }
                        </Col>
                    </Row>
                    <FooterLogos />
                </Col>
            </Row>
            <Row>
                <Col lg={{ offset: 6, span: 6 }} md={12} />
            </Row>
        </Container>
    );
};

export default BrandColumn;
