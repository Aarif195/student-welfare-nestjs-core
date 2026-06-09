import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    Bell,
    LogOut,
    CalendarCheck,
    Star,
    User, 
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

export const HostelOwnerDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Overview', path: '/dashboard/owner', icon: <LayoutDashboard size={20} /> },
        { name: 'My Hostels', path: '/dashboard/owner/hostels', icon: <Building2 size={20} /> },
        { name: 'Bookings', path: '/dashboard/owner/bookings', icon: <CalendarCheck size={20} /> },
        { name: 'Maintenance', path: '/dashboard/owner/maintenance', icon: <ClipboardList size={20} /> },
        { name: 'Notifications', path: '/dashboard/owner/notifications', icon: <Bell size={20} /> },
        { name: 'Reviews', path: '/dashboard/owner/reviews', icon: <Star size={20} /> },
        { name: 'Profile', path: '/dashboard/owner/profile', icon: <User size={20} /> },

    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-primary-50">
            {/* Mobile Header Bar - Visible only on mobile screens */}
            <div className="md:hidden bg-white border-b border-primary-200 p-4 sticky top-0 z-30 flex items-center justify-between">
                <h1 className="text-xl font-bold text-brand">HostelOwner</h1>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop Overlay for Mobile Sidebar - Closes menu when backdrop is clicked */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-primary-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } pt-16 md:pt-0`}>
                
                {/* Brand Title - Hidden on mobile view since it is in the mobile top-bar */}
                <div className="p-6 hidden md:block">
                    <h1 className="text-xl font-bold text-brand">HostelOwner</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)} // Auto close menu on nav selection
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-brand text-white'
                                    : 'text-primary-600 hover:bg-primary-100'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-primary-200">
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area Layout Container */}
            <main className="md:ml-64 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-65px)] md:min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};