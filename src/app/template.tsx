// Re-mounts on every navigation, so each page enters with a short fade/rise (see .page-enter in globals.css).
// prefers-reduced-motion disables it.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
