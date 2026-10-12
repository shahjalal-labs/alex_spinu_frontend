"use client";

import Sidebar from "@/components/Modules/Sidebar/Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#14161B]">
      <div className="flex min-h-screen flex-row bg-[#14161B]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#14161B] p-4 pb-24 pt-4 lg:pb-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
