import { FC, useEffect, useCallback, useState, useRef } from "react";
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
  currentPath: string;
}

interface NavItemConfig {
  href: string;
  text: string;
  animation: string;
}

interface NavCategory {
  name: string;
  items: NavItemConfig[];
  allowTwoColLinks?: boolean; // Whether this category can display links in two columns when in xs mode
}

interface IndicatorPosition {
  top: number;
  left: number;
  opacity: number;
  rotation: number;
}

// The breakpoint (in pixels) at which categories switch from stacked to side-by-side.
// This should match your Tailwind xs breakpoint.
const CATEGORIES_SIDE_BY_SIDE_BREAKPOINT = 4180;

// Configure the minimum width (in pixels) at which category links 
// will display in two columns (when in xs mode and category allows it).
// Below this width, links stack to one column.
const CATEGORY_TWO_COL_MIN_WIDTH = 320;

const AppNavbar: FC = () => {
  const [state, setState] = useState<NavbarState>({
    isOpen: false,
    currentAnimation: '',
    currentPath: ''
  });

  const [indicatorPos, setIndicatorPos] = useState<IndicatorPosition>({
    top: 0,
    left: 0,
    opacity: 0,
    rotation: 0
  });

  // Track if we're in "xs mode" (categories stacked) and above the min width for two-col links
  const [canUseTwoColLinks, setCanUseTwoColLinks] = useState<boolean>(false);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const updateCurrentPath = useCallback(() => {
    const path = window.location.pathname + window.location.hash;
    setState(prev => ({ ...prev, currentPath: path }));
  }, []);

  const isLinkActive = useCallback((href: string): boolean => {
    const { currentPath } = state;

    // Handle external links (never active on this site)
    if (href.startsWith('http') && !href.includes(window.location.hostname)) {
      return window.location.href === href;
    }

    // Handle hash links like "/#music"
    if (href.startsWith('/#')) {
      const hash = href.substring(1); // Remove leading "/"
      return currentPath === href || currentPath.endsWith(hash);
    }

    // Handle root
    if (href === '/#' || href === '/') {
      return currentPath === '/' || currentPath === '/#' || currentPath === '';
    }

    return currentPath === href;
  }, [state.currentPath]);

  // Update indicator position when active link changes
  const updateIndicatorPosition = useCallback(() => {
    if (!navContainerRef.current) return;

    const containerRect = navContainerRef.current.getBoundingClientRect();

    // Find the active nav item
    for (const [href, element] of navItemRefs.current.entries()) {
      if (isLinkActive(href)) {
        const itemRect = element.getBoundingClientRect();

        // Calculate center of the nav link text
        const linkCenterY = itemRect.top + (itemRect.height / 2);
        // Position indicator so its center aligns with link center
        // Indicator is 8px (w-2), so subtract 4 to center it
        const relativeTop = linkCenterY - containerRect.top - 4;
        const relativeLeft = itemRect.left - containerRect.left - 16;

        setIndicatorPos(prev => ({
          top: relativeTop,
          left: relativeLeft,
          opacity: 1,
          rotation: prev.rotation + 90
        }));
        return;
      }
    }

    // No active item found
    setIndicatorPos(prev => ({ ...prev, opacity: 0 }));
  }, [isLinkActive]);

  // Handle responsive two-column check
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      // Two-col links only available when:
      // 1. Below the breakpoint where categories go side-by-side (xs mode / stacked categories)
      // 2. Above the minimum width for two-col links
      const inXsMode = width < CATEGORIES_SIDE_BY_SIDE_BREAKPOINT;
      const aboveMinWidth = width >= CATEGORY_TWO_COL_MIN_WIDTH;
      setCanUseTwoColLinks(inXsMode && aboveMinWidth);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Update indicator when path changes or menu opens
  useEffect(() => {
    if (state.isOpen) {
      // Small delay to allow DOM to render
      const timer = setTimeout(updateIndicatorPosition, 50);

      // Update indicator position on window resize
      const handleResize = () => {
        updateIndicatorPosition();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [state.currentPath, state.isOpen, updateIndicatorPosition]);

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

  const handleNavClick = useCallback((item: NavItemConfig) => {
    if (item.animation) triggerLogoAnimation(item.animation, 1000);

    // Update path and indicator after a small delay to allow navigation
    setTimeout(() => {
      updateCurrentPath();
      updateIndicatorPosition();
    }, 50);
  }, [triggerLogoAnimation, updateCurrentPath, updateIndicatorPosition]);

  // Register a nav item ref
  const setNavItemRef = useCallback((href: string, element: HTMLElement | null) => {
    if (element) {
      navItemRefs.current.set(href, element);
    } else {
      navItemRefs.current.delete(href);
    }
  }, []);

  useEffect(() => {
    triggerLogoAnimation('tada-animation', 1000);
    updateCurrentPath();

    // Listen for hash changes
    window.addEventListener('hashchange', updateCurrentPath);
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', updateCurrentPath);

    return () => {
      window.removeEventListener('hashchange', updateCurrentPath);
      window.removeEventListener('popstate', updateCurrentPath);
    };
  }, [triggerLogoAnimation, updateCurrentPath]);

  const navCategories: NavCategory[] = [
    {
      name: "Personal",
      allowTwoColLinks: false,
      items: [
        { href: "/#logiclectures", text: "logic lectures", animation: "side-to-side-animation" },
        { href: "/#music", text: "music", animation: "bouncy-dance-animation" },
        { href: "https://comics.jacobkrch.com", text: "top comics from 2025", animation: "bouncy-dance-animation" },
      ]
    },
    {
      name: "Projects",
      allowTwoColLinks: true,
      items: [
        { href: "/#eurovision-ranker", text: "eurovision ranker", animation: "shiver-animation" },
        { href: "/#chordbuildr", text: "chord buildr", animation: "rotate-animation" },
        { href: "/#modal-chordbuildr", text: "modal buildr", animation: "bouncy-dance-animation" },
        { href: "/#criterion-club", text: "criterion club", animation: "shiver-animation" },
        { href: "/#juxtaglobe", text: "juxta globe", animation: "side-to-side-animation" },
        { href: "/#gb-meter", text: "gb meter", animation: "shiver-animation" },
      ]
    }
  ];

  const socialLinks = [
    { href: "https://www.linkedin.com/in/jacob-krch-60541a61", icon: faLinkedin, label: "LinkedIn" },
    { href: "https://github.com/jekrch", icon: faGithub, label: "GitHub" }
  ];

  // Determine if a category should use two-column links
  const shouldUseTwoColLinks = (category: NavCategory): boolean => {
    return canUseTwoColLinks && (category.allowTwoColLinks ?? false);
  };

  return (
    <div className="bg-jk-teal">
      <Navbar
        dark
        expand={false}
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

          <div className="ml-auto w-10 h-10 my-auto border-slate-400 hover:border-slate-300 focus:border-slate-300 border-1 rounded-md mr-2">
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
            <div className="flex flex-col w-full">
              {/* Categories grid - columns on wide screens, stacked on narrow */}
              <div
                ref={navContainerRef}
                className="relative grid grid-cols-1 xs:grid-cols-2 gap-x-8 gap-y-2"
              >
                {/* Sliding indicator with rotation */}
                <div
                  className="absolute w-2 h-2 mt-[0.1em] border border-white pointer-events-none"
                  style={{
                    top: indicatorPos.top,
                    left: indicatorPos.left,
                    opacity: indicatorPos.opacity,
                    transform: `rotate(${indicatorPos.rotation}deg)`,
                    transition: 'top 300ms ease-out, left 300ms ease-out, opacity 300ms ease-out, transform 300ms ease-out',
                  }}
                />

                {navCategories.map((category) => {
                  const useTwoCol = shouldUseTwoColLinks(category);
                  return (
                    <div key={category.name} className="flex flex-col">
                      <h6 className="text-slate-300 text-xs uppercase tracking-widest mb-2 mt-3 md:mt-0 pb-1.5 border-b border-slate-300/40">
                        {category.name}
                      </h6>
                      <Nav
                        className="flex-col"
                        navbar
                        style={useTwoCol ? {
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          columnGap: '1rem'
                        } : undefined}
                      >
                        {category.items.map((item) => {
                          const isActive = isLinkActive(item.href);
                          return (
                            <NavItem key={item.href}>
                              <NavLink
                                href={item.href}
                                innerRef={(el: HTMLElement | null) => setNavItemRef(item.href, el)}
                                onClick={() => handleNavClick(item)}
                                className={classNames(
                                  "py-1.5 px-0 flex items-center gap-2",
                                  isActive ? "text-white font-medium" : "text-slate-300"
                                )}
                              >
                                {item.text}
                              </NavLink>
                            </NavItem>
                          );
                        })}
                      </Nav>
                    </div>
                  );
                })}
              </div>

              {/* Social icons section */}
              <Nav
                navbar
                className={classNames(
                  "flex-row items-center mt-4 pt-2 -ml-2 border-t border-slate-300",
                  "transition-all duration-1000"
                )}
              >
                {socialLinks.map((link) => (
                  <NavItem key={link.href}>
                    <NavLink
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="px-2 py-1"
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