import { FC, useEffect, useCallback, useState } from "react";
import {
  Collapse,
  Navbar, 
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import classNames from "classnames";
import { Sling as Hamburger } from 'hamburger-react';

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
    triggerLogoAnimation('tada-animation', 1000);
  }, [triggerLogoAnimation]);

  const navItems = [
    { href: "/#logiclectures", text: "logic lectures", animation: "side-to-side-animation" },
    { href: "/#eurovision-ranker", text: "eurovision ranker", animation: "shiver-animation" },
    { href: "/#chordbuildr", text: "chord buildr", animation: "rotate-animation" },
    { href: "/#modal-chordbuildr", text: "modal buildr", animation: "bouncy-dance-animation" },
    { href: "/#criterion-club", text: "criterion club", animation: "shiver-animation" },
    { href: "/#juxtaglobe", text: "juxta globe", animation: "side-to-side-animation" },
    { href: "/#music", text: "music", animation: "bouncy-dance-animation" }
  ];
  
  const socialLinks = [
      { href: "https://www.linkedin.com/in/jacob-krch-60541a61", icon: faLinkedin, label: "LinkedIn" },
      { href: "https://github.com/jekrch", icon: faGithub, label: "GitHub" }
  ];

  return (
    <div className="bg-jk-teal">
      <Navbar
        dark
        expand="md"
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


          <div className="ml-auto w-10 h-10 my-auto d-md-none border-slate-400 hover:border-slate-300 focus:border-slate-300 border-1 rounded-md mr-2">
            <div className="-mt-1 -ml-[0.32em]">
            <Hamburger 
              toggled={state.isOpen} 
              toggle={toggle}
              size={18}               
              color="#edeef0" 
              aria-label="Toggle navigation"
            />
            </div>
          </div>
        </Container>

        <Collapse isOpen={state.isOpen} navbar>
          <Container>
            <div className="d-flex flex-column flex-md-row justify-content-between w-100">
              {/* Main navigation links */}
              <Nav className="me-auto" navbar>
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

              {/* section for social icons */}
             <Nav navbar className={classNames("flex-row flex-md-column align-items-center align-items-md-end mt-2 mt-md-0 duration-1000 ", state.isOpen ? '-ml-2 border-slate-300 border-t-[.05em] pt-2' : 'ml-2 pt-2')}>
                {socialLinks.map((link) => (
                  <NavItem key={link.href}>
                    <NavLink
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className={classNames("px-2 py-1", !state.isOpen && link.href.includes('github') ? ' -mr-[0.08em]' : '')}
                    >
                      <FontAwesomeIcon 
                        icon={link.icon} 
                        className="h-5 text-slate-300 hover:text-white transition-colors duration-200" 
                      />
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </div>
          </Container>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default AppNavbar;