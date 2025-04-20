import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Home, LayoutDashboard, LineChart, List, Settings } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive, isCollapsed }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-foreground/60 hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/tasks', icon: <List size={20} />, label: 'Tasks' },
    { to: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
    { to: '/analytics', icon: <LineChart size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col flex-1 p-4 gap-1 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
      
      <button 
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
};

export default Sidebar;
