import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  separator?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Postings', path: '/postings', icon: BriefcaseIcon },
  { name: 'Candidates', path: '/candidates', icon: UserGroupIcon },
  { name: 'Prospects', path: '/prospects', icon: ChartBarIcon },
  { name: 'Interviews', path: '/interviews', icon: CalendarIcon },
  { name: 'Settings', path: '/settings', icon: Cog6ToothIcon, separator: true },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-700">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold text-white">
              s<span className="text-indigo-400">HR</span>ewd
            </h1>
          </Link>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => (
            <React.Fragment key={item.name}>
              {item.separator && <div className="my-4 border-t border-gray-700" />}
              <Link
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 