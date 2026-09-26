import { useEffect, useState } from 'react';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "reactstrap";
import lectures from "./lectures";
import LectureModal from "./LectureModal";

interface Lecture {
  _id: string;
  name: string;
  number: number;
  url: string;
}

const SLIDES_ORIGIN = "https://onedrive.live.com";

const LogicLectures = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Kept after closing so the modal still has its content while it fades out
  const [lecture, setLecture] = useState<Lecture | null>(null);

  // Warm up the connection to OneDrive so the first deck opens sooner
  useEffect(() => {
    if (document.head.querySelector(`link[rel="preconnect"][href="${SLIDES_ORIGIN}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = SLIDES_ORIGIN;
    document.head.appendChild(link);
  }, []);

  const onOpenClick = (selected: Lecture) => {
    setLecture(selected);
    setIsOpen(true);
  };

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <Container className="content-text pb-[2em]">
      <LectureModal
        isOpen={isOpen}
        toggle={toggle}
        lectureName={lecture?.name ?? ''}
        lectureNumber={lecture?.number}
        url={lecture?.url ?? ''}
      />

      <div className="mb-[2rem]">
        <p>
          I created these lecture slides for a logic course that I designed and
          taught while in graduate school at the University of Wisconsin-Madison. They complement readings taken from: Virginia Klenk's <i>Understanding Symbolic Logic. 5th ed.</i>
        </p>

        <a
          download="211Syllabus.docx"
          href="/files/211Syllabus.docx"
          className="group relative mt-[0.5rem] inline-flex items-center gap-[0.5rem] rounded-[2px] bg-jk-teal px-[1.125rem] py-[0.5rem] !text-white no-underline shadow-[3px_4px_8px_0px_rgba(0,0,0,0.18)] transition-colors duration-150 hover:bg-[#4e6268] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b8592] focus-visible:ring-offset-2"
        >
          {/* Offset outline, like the logo's layered squares */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 translate-x-[4px] translate-y-[4px] rounded-[2px] border-[1px] border-solid border-[#5b8592]/50 transition-transform duration-200 ease-out group-hover:translate-x-[6px] group-hover:translate-y-[6px]"
          />
          <svg className="relative size-[1rem]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
          </svg>
          <b className="relative">Syllabus</b>
        </a>
      </div>

      <ol className="m-0 list-none overflow-hidden rounded-[2px] border-[1px] border-solid border-[#5b8592]/25 bg-white p-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        {lectures.map((item: Lecture, i: number) => (
          <li
            key={item._id}
            className="smooth-reveal border-t-[1px] border-solid border-[#5b8592]/15 first:border-t-0 motion-reduce:![animation:none]"
            style={{ animationDelay: `${Math.min(i, 20) * 20}ms` }}
          >
            <button
              type="button"
              onClick={() => onOpenClick(item)}
              className="group flex w-full items-center gap-[0.875rem] bg-transparent px-[0.875rem] py-[0.625rem] text-left text-[#3f4e53] transition-colors duration-150 hover:bg-[#5b8592]/[0.07] focus-visible:bg-[#5b8592]/[0.07] focus-visible:outline-none focus-visible:shadow-[inset_3px_0_0_#5b8592] sm:px-[1.125rem]"
            >
              <span className="relative size-[1.75rem] flex-none">
                <span
                  aria-hidden
                  className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[2px] border-[1px] border-solid border-[#5b8592]/40 transition-transform duration-200 ease-out group-hover:translate-x-[5px] group-hover:translate-y-[5px]"
                />
                <span className="relative grid size-full place-items-center rounded-[2px] bg-jk-teal text-[0.75rem] font-semibold tabular-nums text-white">
                  {item.number}
                </span>
              </span>

              <span className="min-w-0 flex-1 leading-snug">{item.name}</span>

              <span className="flex flex-none items-center gap-[0.25rem] text-[0.7rem] font-semibold uppercase tracking-wider text-[#5b8592]">
                <span className="hidden xs:inline">view</span>
                <svg className="size-[1rem] transition-transform duration-200 ease-out group-hover:translate-x-[3px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Container>
  );
};

export default LogicLectures;
