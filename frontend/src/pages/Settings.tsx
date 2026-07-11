import { useAuth } from "@/context/AuthContext"
import { User, Mail, LogOut, Monitor, UploadCloud } from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account preferences, appearance, and study notifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Nav (Visual only for now) */}
        <div className="space-y-1">
          <button className="flex items-center gap-3 w-full px-4 py-2.5 bg-primary/10 text-primary rounded-lg font-medium text-sm transition-colors text-left">
            <User className="h-4 w-4" /> Account
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Profile Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Update your personal information.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold uppercase shrink-0">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <div>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" /> Change Avatar
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full pl-9 pr-4 py-2 bg-muted/50 text-muted-foreground border rounded-md text-sm cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Preferences</h2>
              <p className="text-sm text-muted-foreground mt-1">Customize how StudyAI looks and behaves.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">StudyAI is currently using your system default theme.</p>
                </div>
                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <Monitor className="h-5 w-5" />
                </div>
              </div>
              
              <hr className="border-border" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive daily study reminders and weekly summaries.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-red-500/5">
              <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mt-1">Irreversible and destructive actions.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Log out of all devices</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account on all browsers and devices.</p>
                </div>
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
