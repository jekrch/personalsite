import React, { Component } from "react"
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container
} from "reactstrap"
import { NavLink as RRNavLink } from 'react-router-dom';

class AppNavbar extends Component {
  state = {
    isOpen: false
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    return (
      <div>
        <Navbar
          style={{ backgroundColor: "#5b8592" }}
          dark
          expand="sm"
          className="mb-5"
        >
          <Container>
            <NavbarBrand>
              <NavLink href="/#">
                <img
                  src="/images/jacob-krch.png"
                  height="110"
                  style={{ marginTop: "-40" }}
                />
              </NavLink>
            </NavbarBrand>

            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink href="https://www.linkedin.com/in/jacob-krch-60541a61">
                    linkedin
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="https://github.com/jekrch">github</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/#logiclectures">logic lectures</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/#eurovision-ranker">eurovision ranker</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/#chordbuildr">chord buildr</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </div>
    )
  }
}

export default AppNavbar
