import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FiGrid, FiPackage, FiShoppingCart, FiTruck,
  FiLogOut, FiChevronDown,
  FiUser, FiMenu, FiX, FiSun, FiMoon, FiLayers,
} from "react-icons/fi";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard",       icon: FiGrid,        path: "/dashboard",         perm: null },
      // { label: "Products",        icon: FiPackage,     path: "/products",          perm: "PRODUCTS" },
      // { label: "Purchase Orders", icon: FiShoppingCart,path: "/purchase-orders",   perm: "PORDER" },
      // { label: "GRN",             icon: FiTruck,       path: "/grn",               perm: "GRN" },
    ],
  },
  {
    label: "Master Details",
    items: [
      { label: "Department Details", icon: FiLayers, path: "/master/departments", perm: "MASTERFILE" },
      // { label: "Category Details",   icon: FiTag,    path: "/master/categories",  perm: "MASTERFILE" },
    ],
  },
  // {
  //   label: "Reports",
  //   items: [
  //     { label: "Stock Report", icon: FiBarChart2, path: "/reports/stock", perm: "STOCKREP" },
  //     { label: "Sales Report", icon: FiBarChart2, path: "/reports/sales", perm: "SALESREP" },
  //   ],
  // },
  // {
  //   label: "Settings",
  //   items: [
  //     { label: "Settings", icon: FiSettings, path: "/settings", perm: "CONTROL" },
  //   ],
  // },
];

const Navbar = () => {
  const { user, logout }        = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const hasPermission = (perm) => {
    if (!perm) return true;
    const p = user?.permissions || {};
    return p[perm] === true || p[perm] === 1 ||
           p[perm.toLowerCase()] === true || p[perm.toLowerCase()] === 1;
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleNav    = (path) => { navigate(path); setMobileOpen(false); };

  const SidebarContent = ({ isCollapsed }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5"
           style={{ borderBottom: "1px solid var(--bg-border)" }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M4 8h24M4 8v16a2 2 0 002 2h20a2 2 0 002-2V8M4 8l2-4h20l2 4M12 14h8M12 18h8"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="font-display text-lg leading-none tracking-wider"
               style={{ color: "var(--text-primary)" }}>RETAIL TARGET</p>
            <p className="text-[10px] tracking-widest uppercase mt-0.5 font-body"
               style={{ color: "var(--text-muted)" }}>Inventory Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navGroups.map((group) => {
          const visible = group.items.filter(i => hasPermission(i.perm));
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-2 font-body"
                   style={{ color: "var(--text-secondary)" }}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const Icon   = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button key={item.path}
                            onClick={() => handleNav(item.path)}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium font-body ${active ? "nav-item-active" : ""}`}
                            style={!active ? { color: "var(--text-muted)" } : {}}
                            onMouseEnter={(e) => {
                              if (!active) {
                                e.currentTarget.style.color = "var(--text-primary)";
                                e.currentTarget.style.background = "color-mix(in srgb, var(--text-primary) 5%, transparent)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                e.currentTarget.style.color = "var(--text-muted)";
                                e.currentTarget.style.background = "";
                              }
                            }}>
                      <Icon size={17} className="flex-shrink-0"/>
                      {!isCollapsed && <span className="truncate tracking-wide">{item.label}</span>}
                      {active && !isCollapsed && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0"/>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Theme toggle */}
      {!isCollapsed ? (
        <div className="px-4 py-3 flex items-center justify-between"
             style={{ borderTop: "1px solid var(--bg-border)" }}>
          <span className="text-xs font-semibold tracking-wider uppercase font-body"
                style={{ color: "var(--text-muted)" }}>
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </span>
          <button onClick={toggleTheme}
                  className={`theme-toggle ${theme === "light" ? "active" : ""}`}>
            <span className="theme-toggle-knob"/>
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-3"
             style={{ borderTop: "1px solid var(--bg-border)" }}>
          <button onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: "var(--text-muted)", background: "color-mix(in srgb, var(--text-primary) 5%, transparent)" }}>
            {theme === "dark" ? <FiSun size={15}/> : <FiMoon size={15}/>}
          </button>
        </div>
      )}

      {/* User */}
      <div className="p-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
        <div className="relative">
          <button onClick={() => !isCollapsed && setUserMenuOpen(v => !v)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--text-primary) 6%, transparent)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.35)" }}>
              <FiUser size={14} className="text-brand-orange"/>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-xs font-semibold truncate font-body"
                     style={{ color: "var(--text-primary)" }}>{user?.username || "User"}</p>
                </div>
                <FiChevronDown size={14} style={{ color: "var(--text-muted)" }}
                               className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}/>
              </>
            )}
          </button>

          {userMenuOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden shadow-card animate-fade-in"
                 style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)" }}>
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-body">
                <FiLogOut size={15}/>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay md:hidden" onClick={() => setMobileOpen(false)}/>
      )}

      {/* Mobile drawer */}
      <aside className="fixed top-0 left-0 h-full z-50 flex flex-col sidebar transition-transform duration-300 md:hidden"
             style={{ width: "260px", transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: "var(--text-muted)", background: "var(--bg-border)" }}>
          <FiX size={16}/>
        </button>
        <SidebarContent isCollapsed={false}/>
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 flex-col sidebar transition-all duration-300 hidden md:flex"
             style={{ width: collapsed ? "64px" : "240px" }}>
        <SidebarContent isCollapsed={collapsed}/>
        <button onClick={() => setCollapsed(v => !v)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", color: "var(--text-muted)" }}>
          {collapsed ? <FiMenu size={11}/> : <FiX size={11}/>}
        </button>
      </aside>

      {/* Topbar */}
      <header className="fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 topbar transition-all duration-300"
              style={{ left: 0 }}>
        <div className="flex items-center gap-3">
          <button className="flex md:hidden w-9 h-9 items-center justify-center rounded-lg"
                  style={{ color: "var(--text-muted)", background: "var(--bg-border)" }}
                  onClick={() => setMobileOpen(true)}>
            <FiMenu size={18}/>
          </button>
          <div className="hidden md:block transition-all duration-300"
               style={{ width: collapsed ? "64px" : "240px" }}/>
          <div className="hidden md:block w-px h-5" style={{ background: "var(--bg-border)" }}/>
          <p className="text-sm font-body capitalize" style={{ color: "var(--text-muted)" }}>
            {location.pathname.split("/").filter(Boolean).map(s => s.replace(/-/g, " ")).join(" / ") || "Dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono hidden sm:block" style={{ color: "var(--text-secondary)" }}>
            {new Date().toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button onClick={toggleTheme}
                  className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg"
                  style={{ color: "var(--text-muted)", background: "var(--bg-border)" }}>
            {theme === "dark" ? <FiSun size={15}/> : <FiMoon size={15}/>}
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;