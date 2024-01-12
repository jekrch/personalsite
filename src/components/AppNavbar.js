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
    isOpen: false,
    currentAnimation: ''
  }

  componentDidMount() {
    // default animation on load
    this.triggerLogoAnimation('tada-animation', 1000); 
  }

  triggerLogoAnimation = (animationName, duration) => {
    this.setState({ currentAnimation: animationName });
    setTimeout(() => {
      this.setState({ currentAnimation: '' });
    }, duration);
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }



  render() {
    const { currentAnimation } = this.state;

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
            <NavbarBrand 
              href="/#"
              onClick={() => this.triggerLogoAnimation('bouncy-animation', 1000)}
            >
              <img
                src="/images/jacob-krch.png" 
                className={`h-[110px] w-[110px] object-cover my-[5px] z-50 ${currentAnimation}`}
                height="110"
                alt="Jacob Krch Logo" 
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
                  <NavLink 
                    href="/#logiclectures" 
                    onClick={() => this.triggerLogoAnimation('side-to-side-animation', 1000)}
                  >logic lectures</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    href="/#eurovision-ranker"
                    onClick={() => this.triggerLogoAnimation('shiver-animation', 1000)}
                  >eurovision ranker</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    href="/#chordbuildr"
                    onClick={() => this.triggerLogoAnimation('rotate-animation', 1000)}
                  >
                  chord buildr</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    href="/#music"
                    onClick={() => this.triggerLogoAnimation('bouncy-dance-animation', 1000)}
                  >
                  music</NavLink>
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
