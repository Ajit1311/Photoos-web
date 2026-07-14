"use client";

import Logo from "@/components/logo/Logo";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";
import { sidebar } from "@/constants/sidebar";
import { APP_VERSION } from "@/constants/app";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}

      <div className="border-b border-slate-200 px-6 py-6">

        <Logo />

      </div>

      {/* Navigation */}

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {sidebar.map((group) => (

          <SidebarGroup
            key={group.group}
            title={group.group}
          >

            {group.items.map((item) => (

              <SidebarItem
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
              />

            ))}

          </SidebarGroup>

        ))}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-200 p-5">

        <p className="text-center text-xs text-slate-400">
          PhotoOS {APP_VERSION}
        </p>

      </div>

    </aside>
  );
}