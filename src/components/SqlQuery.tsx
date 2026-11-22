import { FC, Fragment, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useScrollLock } from "../utils/useScrollLock"
import { CheckIcon, CopyIcon, DOT_GRID, ExpandIcon } from "./MermaidViewer"
import { rowClass, tableClass, tdClass, thClass } from "./ProjectSources"
import type { SqlSample } from "./chordDbQueries"

const KEYWORDS = new Set(["SELECT", "FROM", "WHERE", "AND", "OR", "IN", "NOT", "ORDER", "BY", "LIMIT", "AS", "JOIN", "ON"])

// Minimal SQL coloring: keywords, string literals, numbers
const highlight = (sql: string): ReactNode[] =>
  Array.from(sql.matchAll(/('(?:[^']|'')*')|(\b\d+\b)|([A-Za-z_]\w*)|([^'\w]+)/g), (m, i) => {
    const [token, str, num, word] = m
    if (str || num) return <span key={i} className="text-[#a0613a]">{token}</span>
    if (word && KEYWORDS.has(word.toUpperCase())) return <span key={i} className="font-semibold text-jk-teal">{token}</span>
    if (word) return <Fragment key={i}>{token}</Fragment>
    return <span key={i} className="text-gray-400">{token}</span>
  })

const CODE = "m-0 whitespace-pre font-mono text-[11px] leading-[1.6] text-gray-800"

const ICON_BTN =
  "flex size-[2.5rem] flex-none items-center justify-center rounded-[2px] border-0 bg-transparent !text-white/80 transition-colors duration-150 hover:bg-white/15 hover:!text-white focus-visible:bg-white/15 focus-visible:outline-none"

const CloseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const rowCount = (n: number) => `${n} ${n === 1 ? "row" : "rows"}`

interface SqlQueryModalProps {
  sample: SqlSample
  isOpen: boolean
  onClose: () => void
}

// The query and its full result. Open/close behavior follows LectureModal.
const SqlQueryModal: FC<SqlQueryModalProps> = ({ sample, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const copyTimer = useRef<number>()
  const titleId = `sql-${sample.id}-title`

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          setIsAnimating(true)
          closeRef.current?.focus({ preventScroll: true })
        })
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Hand focus back to whatever opened the modal once it closes
  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    return () => previousFocus?.focus({ preventScroll: true })
  }, [isOpen])

  useScrollLock(isVisible)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sample.sql)
      setCopied(true)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked; nothing to show
    }
  }, [sample.sql])

  if (!isVisible) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center overscroll-contain p-[1rem] backdrop-blur-[3px]"
      style={{
        backgroundColor: "rgba(38, 50, 54, 0.72)",
        opacity: isAnimating ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(85vh,48rem)] w-full max-w-[44rem] flex-col overflow-hidden rounded-[2px] border-[1px] border-solid border-white bg-jk-teal shadow-[5px_6px_18px_0px_rgba(0,0,0,0.35)]"
        style={{
          transform: isAnimating ? "none" : "scale(0.96) translateY(12px)",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="flex flex-none items-center gap-[0.75rem] py-[0.25rem] pl-[0.875rem] pr-[0.25rem] text-white">
          <h2 id={titleId} className="m-0 min-w-0 flex-1 truncate text-[0.95rem] font-semibold leading-[1.15]">
            {sample.title}
          </h2>
          <button type="button" onClick={copy} className={ICON_BTN} aria-label="Copy SQL" title="Copy SQL">
            {copied ? <CheckIcon className="size-[1.05rem]" /> : <CopyIcon className="size-[1.05rem]" />}
          </button>
          <button ref={closeRef} type="button" onClick={onClose} className={ICON_BTN} aria-label="Close">
            <CloseIcon className="size-[1.25rem]" />
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "SQL copied" : ""}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-[1rem] text-left sm:p-[1.25rem]">
          <div className="overflow-x-auto rounded-[2px] border-[1px] border-solid border-[rgba(91,133,146,0.22)] px-[0.875rem] py-[0.75rem]" style={DOT_GRID}>
            <pre className={CODE}><code>{highlight(sample.sql)}</code></pre>
          </div>

          <p className="mb-[0.5rem] mt-[1rem] text-[11px] font-semibold uppercase tracking-wider text-jk-teal">
            Result <span className="font-normal text-gray-400">· {rowCount(sample.rows.length)}</span>
          </p>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  {sample.columns.map(c => <th key={c} className={`${thClass} normal-case tracking-normal`}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {sample.rows.map(row => (
                  <tr key={row.join("|")} className={rowClass}>
                    {row.map((cell, i) => (
                      <td key={i} className={`${tdClass} ${i === 0 ? "whitespace-nowrap font-medium" : ""}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// A query preview; opens the full query and result in a modal.
export const SqlQueryCard: FC<{ sample: SqlSample }> = ({ sample }) => {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`${sample.title}: show query result`}
        className="group flex w-full flex-col overflow-hidden rounded-[2px] border-[1px] border-solid border-[rgba(91,133,146,0.22)] bg-white p-0 text-left shadow-[0_1px_3px_rgba(38,50,54,0.06)] transition-colors duration-150 hover:border-[rgba(91,133,146,0.55)] focus-visible:border-jk-teal focus-visible:outline-none"
      >
        <span className="block w-full border-b-[1px] border-solid border-[rgba(91,133,146,0.18)] px-[0.75rem] py-[0.5rem] text-[11px] font-semibold uppercase tracking-wider text-jk-teal">
          {sample.title}
        </span>
        <span className="block w-full flex-1 overflow-hidden px-[0.75rem] py-[0.625rem]" style={DOT_GRID}>
          <pre className={CODE}><code>{highlight(sample.sql)}</code></pre>
        </span>
        <span className="flex w-full items-center justify-between border-t-[1px] border-solid border-[rgba(91,133,146,0.18)] bg-[rgba(91,133,146,0.04)] px-[0.75rem] py-[0.375rem] text-[0.65rem] font-semibold uppercase tracking-wider text-gray-500">
          <span className="font-normal normal-case tracking-normal">{rowCount(sample.rows.length)}</span>
          <span className="flex items-center gap-[0.375rem] transition-colors duration-150 group-hover:text-jk-teal group-focus-visible:text-jk-teal">
            <ExpandIcon className="size-[0.75rem] flex-none" />
            Result
          </span>
        </span>
      </button>
      <SqlQueryModal sample={sample} isOpen={isOpen} onClose={close} />
    </>
  )
}
