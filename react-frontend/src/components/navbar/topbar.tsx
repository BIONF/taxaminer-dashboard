import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Button, Form, Nav } from "react-bootstrap";

interface Props {
    toggleDarkmode: () => void
}



// Main Navbar
class TopBar extends React.Component<Props, any> {

    render() {
        return (
            <Navbar bg="primary" variant="dark" expand="lg">
            <Container fluid>
            <Navbar.Brand>
                    <img
                        src="/logo_white.png"
                        width="80"
                        height="60"
                        className="d-inline-block align-bottom"
                        alt="AplBio Logo"
                        />
                        {'  '}
                        <div className="d-inline-block align-bottom">taXaminer dashboard
                        <br/>
                        <small><i>Web-based visualization and exploration of biodiverse genesets</i></small>
                        </div>
                    </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
        <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
        >
        </Nav>
        <Form className="d-flex">
            <Form.Check 
				inline
                type="switch"
                id="custom-switch"
                label="Darkmode (beta)"
                className="m-2 text-light"
                onChange={() => this.props.toggleDarkmode()}/>
            <Button href="https://github.com/lukekoch/taxaminer-dashboard-react" target="_blank"><i className="bi bi-github"></i> Github</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        );
    } 
}

export { TopBar }