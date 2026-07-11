import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, UploadCloud, LogOut, Settings, Home, FileText, Brain, HelpCircle, CalendarDays, Menu, X, Library } from "lucide-react"

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Home", path: "/app", icon: Home },
    { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { name: "Library", path: "/app/materials", icon: Library },
    { name: "Upload", path: "/app/upload", icon: UploadCloud },
    { name: "Summary", path: "/app/summary", icon: FileText },
    { name: "Flashcards", path: "/app/flashcards", icon: Brain },
    { name: "Quiz", path: "/app/quiz", icon: HelpCircle },
    { name: "Schedule", path: "/app/schedule", icon: CalendarDays },
  ]

  const SidebarContent = () => (
    <>
      <div>
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-2xl font-bold text-primary">StudyAI</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            <span className="font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col justify-between h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside 
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl transform transition-transform duration-300 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center px-4 md:px-8 justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="font-medium text-sm text-muted-foreground capitalize">
                  {(() => {
                    const segments = location.pathname.replace('/app', '').split('/').filter(Boolean)
                    if (segments.length === 0) return 'Home'
                    return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' > ')
                  })()}
              </div>
            </div>
            <div>
              <Link to="/app/settings" className="text-muted-foreground hover:text-primary">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-muted/20 pb-20 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
