import { FC, useEffect, useCallback, useState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container
} from "reactstrap";

interface NavbarState {
  isOpen: boolean;
  currentAnimation: string;
}

const AppNavbar: FC = () => {
  const [state, setState] = useState<NavbarState>({
    isOpen: false,
    currentAnimation: ''
  });

  const triggerLogoAnimation = useCallback((animationName: string, duration: number) => {
    setState(prev => ({ ...prev, currentAnimation: animationName }));
    setTimeout(() => {
      setState(prev => ({ ...prev, currentAnimation: '' }));
    }, duration);
  }, []);

  const toggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, []);

  useEffect(() => {
    // default animation on load
    triggerLogoAnimation('tada-animation', 1000);
  }, [triggerLogoAnimation]);

  const navItems = [
    { href: "https://www.linkedin.com/in/jacob-krch-60541a61", text: "linkedin" },
    { href: "https://github.com/jekrch", text: "github" },
    { href: "/#logiclectures", text: "logic lectures", animation: "side-to-side-animation" },
    { href: "/#eurovision-ranker", text: "eurovision ranker", animation: "shiver-animation" },
    { href: "/#chordbuildr", text: "chord buildr", animation: "rotate-animation" },
    { href: "/#music", text: "music", animation: "bouncy-dance-animation" }
  ];

  return (
    <div className="bg-jk-teal">
      <Navbar
        dark
        expand="sm"
        className="mb-5 content-max-width"
      >
        <Container className="d-flex justify-content-between">
          <NavbarBrand 
            href="/#"
            onClick={() => triggerLogoAnimation('bouncy-animation', 1000)}
          >
            <img
              src="/images/jacob-krch.png" 
              className={`h-[110px] w-[110px] object-cover my-[5px] z-50 ${state.currentAnimation}`}
              height="110"
              alt="Jacob Krch Logo" 
            />
          </NavbarBrand>
          <NavbarToggler onClick={toggle} className="ml-auto my-auto" />
        </Container>

        <Collapse isOpen={state.isOpen} navbar>
          <Container>
            <Nav className="ms-auto" navbar>
              {navItems.map((item) => (
                <NavItem key={item.href}>
                  <NavLink 
                    href={item.href}
                    onClick={() => item.animation && triggerLogoAnimation(item.animation, 1000)}
                  >
                    {item.text}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Container>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default AppNavbar;