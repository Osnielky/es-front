// Admin shell: cards, bars and inputs on admin pages render as frosted glass over the site backdrop
// (see .admin-glass rules in globals.css).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-glass min-h-screen">{children}</div>
}
