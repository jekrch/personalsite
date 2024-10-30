import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { NavLink } from "reactstrap";

const SocialIconBar = () => {
    return (
        <div className="mt-[5em]">
            <div className='absolute bottom-0 left-0 right-0 flex justify-center items-center translate-y-[0.7em] z-10 bg-jk-teal h-[5em]'>
                <div className='flex gap-x-4'>
                    <NavLink href="https://www.linkedin.com/in/jacob-krch-60541a61">
                        <div className="bg-jk-teal px-2 pt-1 rounded-md cursor-pointer border-slate-200 border-1 hover:shadow-md">
                            <FontAwesomeIcon icon={faLinkedin} className="h-8 text-slate-100 hover:text-white" />
                        </div>
                    </NavLink>
                    <NavLink href="https://github.com/jekrch">
                        <div className="bg-jk-teal px-1 pt-1 rounded-md cursor-pointer border-slate-200 border-1 hover:shadow-md">
                            <FontAwesomeIcon icon={faGithub} className="h-8 text-slate-100 hover:text-white" />
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default SocialIconBar;