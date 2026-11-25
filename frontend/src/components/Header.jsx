import React from 'react';
import { Menu, Bell, Activity } from 'lucide-react';

export default function Header({ setMobileOpen }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Hospital Live System</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>General Hospital Central</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-bold text-xs flex items-center justify-center">
          DS
        </div>
      </div>
    </header>
  );
}
