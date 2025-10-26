import React, { useState } from "react";

// AdminDashboardLayout.jsx
// Single-file React component using Tailwind (no external icon libs required)
// Drop into your project (e.g. src/pages/AdminDashboardLayout.jsx)

export default function AdminDashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const nav = [
    { key: "home", label: "Home", icon: IconHome },
    { key: "residents", label: "Residents", icon: IconUsers },
    { key: "buildings", label: "Buildings", icon: IconBuilding },
    { key: "maintenance", label: "Maintenance", icon: IconWrench },
    { key: "billing", label: "Billing", icon: IconCard },
    { key: "announcements", label: "Announcements", icon: IconMegaphone },
    { key: "facilities", label: "Facilities", icon: IconCalendar },
    { key: "reports", label: "Reports", icon: IconChart },
    { key: "settings", label: "Settings", icon: IconCog },
  ];

  const toggleCollapse = () => setCollapsed((c) => !c);
  const toggleMobile = () => setMobileOpen((s) => !s);
  const toggleDark = () => {
    setDarkMode((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-900 text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out bg-slate-800 text-slate-100 border-r border-slate-700 p-4 flex flex-col ${collapsed ? "w-20" : "w-64"} lg:static lg:translate-x-0`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-600">
              <IconBuilding className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold">CondoManager</h2>
                <p className="text-xs text-slate-300">Admin Portal</p>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              aria-label="Toggle sidebar"
              className="ml-auto hidden lg:inline-flex items-center justify-center h-7 w-7 rounded bg-slate-700 hover:bg-slate-600"
            >
              <span className="text-xs">{collapsed ? '▶' : '◀'}</span>
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {nav.map((item) => (
              <a
                key={item.key}
                href="#"
                className={`group flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-700 transition-colors ${collapsed ? "justify-center" : ""}`}
              >
                <span className="flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </a>
            ))}
          </nav>

          <div className="mt-6 border-t border-slate-700 pt-4">
            <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm hover:bg-slate-700 transition-colors ${collapsed ? "justify-center" : ""}`} onClick={() => alert('Open settings')}>
              <IconCog className="h-5 w-5" />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        </aside>

        {/* Content wrapper */}
        <div className={`flex-1 min-h-screen ml-0 lg:ml-${collapsed ? "20" : "64"}`}>
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4">
            <button className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800" onClick={toggleMobile} aria-label="Open menu">☰</button>

            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <input className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none" placeholder="Search residents, units..." />
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button onClick={toggleDark} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">{darkMode ? '🌙' : '☀️'}</button>
                <img src="https://i.pravatar.cc/40" alt="profile" className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="p-6 lg:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
              <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening with your buildings today.</p>
            </div>

            {/* Summary cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Residents" value="1,248" />
              <StatCard title="Open Tickets" value="21" />
              <StatCard title="Units Occupied" value="87%" />
              <StatCard title="This Month Revenue" value="$12,430" />
            </section>

            {/* Charts & lists */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 min-h-[220px]">
                <h3 className="text-lg font-medium mb-2">Occupancy (this year)</h3>
                <div className="h-40 flex items-center justify-center text-slate-400">(Chart placeholder)</div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 min-h-[220px]">
                <h3 className="text-lg font-medium mb-2">Tickets by Type</h3>
                <div className="h-40 flex items-center justify-center text-slate-400">(Chart placeholder)</div>
              </div>
            </section>

            {/* Table */}
            <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recent Maintenance Tickets</h3>
                <button className="text-sm px-3 py-1 rounded-md border border-gray-200 dark:border-slate-700">View all</button>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="text-sm text-slate-500">
                      <th className="p-2">Ticket #</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Assigned</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-slate-700">
                        <td className="p-2 text-sm">#{1000 + i}</td>
                        <td className="p-2 text-sm">Leaky faucet</td>
                        <td className="p-2 text-sm">A-10{i}</td>
                        <td className="p-2 text-sm">Open</td>
                        <td className="p-2 text-sm">John D</td>
                        <td className="p-2 text-sm">2025-10-26</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="text-sm text-slate-500">© {new Date().getFullYear()} CondoManager</footer>
          </main>
        </div>
      </div>

      {/* Mobile overlay drawer */}
      <div className={`${mobileOpen ? 'fixed inset-0 z-40' : 'hidden'}`}> 
        <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)}></div>
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 text-slate-100 p-4 overflow-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-600"><IconBuilding className="h-5 w-5 text-white" /></div>
            <div>
              <h2 className="text-lg font-semibold">CondoManager</h2>
              <p className="text-xs text-slate-300">Admin Portal</p>
            </div>
            <button onClick={() => setMobileOpen(false)} className="ml-auto">✕</button>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <a key={item.key} href="#" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-slate-700">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/* ------------------ helper components & inline icons ------------------ */
function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

/* Simple inline SVG icons to avoid external deps */
function IconBuilding(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18" />
      <path d="M4 11h16v10H4z" />
      <path d="M8 7v4" />
      <path d="M12 7v4" />
      <path d="M16 7v4" />
      <path d="M2 11l10-8 10 8" />
    </svg>
  );
}
function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>
  );
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
  );
}
function IconWrench(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 2l-7 7"/><path d="M20.5 10.5a6 6 0 1 1-8.5-8.5L9 5"/></svg>
  );
}
function IconCard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
  );
}
function IconMegaphone(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 11v2a4 4 0 0 0 4 4h1"/><path d="M18 8v8"/><path d="M3 11l14-7v14L3 11z"/></svg>
  );
}
function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
  );
}
function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><path d="M9 17V9"/><path d="M13 17V5"/><path d="M17 17v-7"/></svg>
  );
}
function IconCog(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.27 18.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.28-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 5.94 2.27l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09c0 .7.39 1.28 1 1.51h.18a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 21.73 5.1l-.06.06a1.65 1.65 0 0 0-.33 1.82V8c.7 0 1.28.39 1.51 1H22a2 2 0 1 1 0 4h-.09c-.7 0-1.28.39-1.51 1z"/></svg>
  );
}
