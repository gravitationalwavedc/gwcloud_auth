import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import FooterLogos from './FooterLogos';
import GWCloudBrandColumn from '../Components/GWCloudBrandColumn';
import GWLabBrandColumn from '../Components/GWLabBrandColumn';
import GWLandscapeBrandColumn from '../Components/GWLandscapeBrandColumn';
import GWlandscapeLogo from '../Assets/GWLandscape-logo.svg';
import { harnessApi } from '../index';

const setProjectColumn = (projectName) => {
    if(projectName === 'GWLab') {
        return GWLabBrandColumn;
    }

    if(projectName === 'GWLandscape'){
        return GWLandscapeBrandColumn;
    }

    return GWCloudBrandColumn;
};

const BrandColumn = ({ children }) => {

    const project = harnessApi.currentProject();
    
    const ProjectColumn = setProjectColumn(project.name);

    const colSizes = project.name === 'GWLandscape' ? { lg: 4, md: 6 } : { lg: 8, md: 10 };
    
    return (
        <Container className="h-100" fluid>
            <Row className="h-100">
                <ProjectColumn />
                <Col className="align-self-center" style={{ marginTop: '5rem' }}>
                    <Row className="justify-content-md-center">
                        <Col {...colSizes}>
                            {project.name === 'GWLandscape' && <GWlandscapeLogo style={{width: '100%'}} className="mb-4"/>}
                            { children }
                        </Col>
                    </Row>
                    <FooterLogos width={colSizes}/>
                </Col>
            </Row>
            <Row>
                <Col lg={{ offset: 6, span: 6 }} md={12} />
            </Row>
        </Container>
    );
};

export default BrandColumn;
