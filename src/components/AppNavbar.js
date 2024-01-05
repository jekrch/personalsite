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
      <div
        style={{ backgroundColor: "#5b8592" }}
      >
        <Navbar
          dark
          expand="sm"
          className="mb-5 content-max-width"
        >
          <Container className="d-flex justify-content-between">
            <NavbarBrand href="/#">
              <img
                src="/images/jacob-krch.png" // Ensure this path is correct
                className="h-[110px] my-[5px]"
                height="110"
                alt="Jacob Krch Logo" // Alt text for accessibility
              />
            </NavbarBrand>
            <NavbarToggler onClick={this.toggle} className="ml-auto my-auto" />
          </Container>

          <Collapse isOpen={this.state.isOpen} navbar>
            <Container className="">
              <Nav className="ms-auto" navbar>
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
            </Container>
          </Collapse>
        </Navbar>
      </div>
    )
  }
}

export default AppNavbar;
