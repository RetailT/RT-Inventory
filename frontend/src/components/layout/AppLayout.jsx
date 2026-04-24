import React from "react";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen theme-bg">
      <Navbar />
      {/* 
        On mobile: no left padding (sidebar is a drawer overlay).
        On desktop: pl-60 when expanded, pl-16 when collapsed is handled via JS
        We use a simpler approach: always pad for desktop sidebar via md:pl-60
        The Navbar itself pushes the topbar offset.
      */}
      <main className="pt-14 md:pl-60 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;