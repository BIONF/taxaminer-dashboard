import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

// Main Navbar
class TopBar extends React.Component {
    render() {
        return (
            <Navbar bg="primary" variant="dark">
                <Container>
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
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                </Container>
            </Navbar>
        );
    } 
}

export { TopBar }