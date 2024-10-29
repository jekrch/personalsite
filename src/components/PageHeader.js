import React, { useState, useEffect } from 'react';
import { Container } from 'reactstrap';

const PageHeader = ({ mainLink, mainLinkText, githubLink, githubText }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // trigger animation shortly after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="border-t border-b border-jk-teal py-[1em] mb-6 relative w-screen left-1/2 -translate-x-1/2 -mt-[1.3em] overflow-hidden">
      <Container style={{ fontFamily: "helvetica", fontSize: 14 }} className="items-center">
        <div className="flex items-center justify-center">
          <a
            href={mainLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              text-base mr-3 hover:shadow-sm
              transform transition-all duration-500 ease-out
              ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
            `}>
            {mainLinkText}
          </a>
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-xs
                transform transition-all duration-500 ease-out delay-200
                ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
              `}>
              {githubText || '(github)'}
            </a>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;