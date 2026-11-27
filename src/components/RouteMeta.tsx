import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { pageMeta } from "../data/site"

// Keeps <title> and the meta description in step with the hash route, so tabs,
// bookmarks, history, and crawlers that run JS see the page's own name.
const RouteMeta = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description } = pageMeta(pathname.replace(/^\/+|\/+$/g, ""))
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute("content", description)
  }, [pathname])

  return null
}

export default RouteMeta
