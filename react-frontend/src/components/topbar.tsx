import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

// Main Navbar
class TopBar extends React.Component {
    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="#home">taXaminer Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                </Container>
            </Navbar>
        );
    } 
}

export { TopBar }