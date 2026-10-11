import { FC } from "react"
import { NavSection, SectionHeading } from "./SectionNav"

export interface Integration {
  name: string
  url: string
  // what the project gets from it
  provides: string
  // which part of the pipeline makes the call
  calledFrom: string
}

export interface StackLayer {
  layer: string
  tech: string
}

// the sections this component renders, for each page's SectionNav
export const projectSourceSections: NavSection[] = [
  { id: "integration-sources", label: "Integration sources" },
  { id: "tech-stack", label: "Tech stack" },
]

interface ProjectSourcesProps {
  integrations: Integration[]
  stack: StackLayer[]
}

const tableClass = "w-full border-collapse text-left text-[13px] leading-snug"
const thClass = "bg-jk-teal px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white whitespace-nowrap"
const tdClass = "border-b border-gray-200 px-3 py-1.5 align-top"
const rowClass = "even:bg-[rgba(91,133,146,0.05)]"

const ProjectSources: FC<ProjectSourcesProps> = ({ integrations, stack }) => {
  return (
    <section className="mt-10 clear-both">
      <SectionHeading id="integration-sources" title="Integration sources" />
      <div className="overflow-x-auto">
        <table className={`${tableClass} min-w-[28rem]`}>
          <thead>
            <tr>
              <th className={thClass}>Source</th>
              <th className={thClass}>Provides</th>
              <th className={thClass}>Called from</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map(i => (
              <tr key={i.name} className={rowClass}>
                <td className={`${tdClass} whitespace-nowrap font-medium`}>
                  <a href={i.url} target="_blank" rel="noopener noreferrer">{i.name}</a>
                </td>
                <td className={tdClass}>{i.provides}</td>
                <td className={`${tdClass} text-gray-500`}>{i.calledFrom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="tech-stack" title="Tech stack" className="mt-8" />
      <table className={tableClass}>
        <tbody>
          {stack.map(s => (
            <tr key={s.layer} className={rowClass}>
              <th scope="row" className={`${tdClass} w-[9.5rem] text-[11px] font-semibold uppercase tracking-wider text-jk-teal`}>{s.layer}</th>
              <td className={tdClass}>{s.tech}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ProjectSources
