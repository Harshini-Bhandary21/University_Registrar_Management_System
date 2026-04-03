import React from 'react';
import { NavLink } from 'react-router-dom';

import { 
    LayoutDashboard, 
    Database, 
    Search, 
    FileText, 
    Settings,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Award,
    UserPlus
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/data-entry', icon: Database, label: 'Data Entry' },
         { path: '/enrollment', icon: UserPlus, label: 'Course Enrollment' },
        { path: '/view-search', icon: Search, label: 'View & Search' },
        { path: '/exams', icon: Calendar, label: 'Exam Management' },
        { path: '/results', icon: Award, label: 'Result Management' },
        { path: '/student-report', icon: FileText, label: 'Student Report' },
        { path: '/advanced', icon: Settings, label: 'Advanced' },
    ];

    return (
        <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out`}>
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <div className={`flex items-center space-x-3 ${!isOpen && 'justify-center w-full'}`}>
                    <GraduationCap size={28} className="text-blue-400 flex-shrink-0" />
                    {isOpen && (
                        <div>
                            <h1 className="text-lg font-bold">UniRegistrar</h1>
                            <p className="text-xs text-gray-400">Admin Portal</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>
            
            <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} px-3 py-3 rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title={!isOpen ? item.label : ''}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {isOpen && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
            
            <div className="p-3 border-t border-gray-700">
                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold text-white">Administrator</p>
                    <p className="text-xs text-gray-400">Registrar Office</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} w-full px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200`}
                    title={!isOpen ? 'Logout' : ''}
                >
                    <Settings size={20} />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;