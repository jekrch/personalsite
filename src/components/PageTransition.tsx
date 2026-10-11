import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Eases each route's content into place on load and on navigation. Enter-only:
 * a CSS keyframe on the incoming page costs nothing and can't desync from
 * routing the way an exit animation (which keeps the old page mounted) can.
 *
 * Keyed on `pathname` so re-navigating to the current page doesn't replay it.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
};

export default PageTransition;
