import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';

interface PageHeaderProps {
  mainLink: string,
  mainLinkText: string,
  githubLink: string,
  githubText: string
}

const PageHeader = ({ mainLink, mainLinkText, githubLink, githubText }: PageHeaderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // trigger animation shortly after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="border-t border-b border-jk-teal bg-white py-[1em] mb-6 relative w-screen left-1/2 -translate-x-1/2 -mt-[1.3em] overflow-hidden">
      <Container style={{ fontFamily: "helvetica", fontSize: 14 }} className="items-center">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 mr-3">
            <div className="flex items-center justify-center">
              <div className={`
                w-[8px] h-[8px] bg-jk-teal opacity-20 rotate-45
                transform transition-all duration-500 ease-out
                ${isVisible ? 'translate-x-0 opacity-20' : '-translate-x-full opacity-0'}
              `}/> 
            </div>
            <div className="flex items-center justify-center">
              <div className={`
                w-[10px] h-[10px] bg-jk-teal opacity-40 rotate-45
                transform transition-all duration-500 ease-out
                ${isVisible ? 'translate-x-0 opacity-40' : '-translate-x-full opacity-0'}
              `}/> 
            </div>
            <div className="flex items-center justify-center">
              <div className={`
                w-[12px] h-[12px] bg-jk-teal opacity-20 rotate-45
                transform transition-all duration-500 ease-out
                ${isVisible ? 'translate-x-0 opacity-60' : '-translate-x-full opacity-0'}
              `}/> 
            </div>
          </div>
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