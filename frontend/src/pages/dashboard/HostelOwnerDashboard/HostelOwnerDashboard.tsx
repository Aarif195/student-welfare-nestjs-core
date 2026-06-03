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
    User
} from 'lucide-react';

export const HostelOwnerDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
        <div className="flex min-h-screen bg-primary-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-primary-200 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-brand">HostelOwner</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${location.pathname === item.path
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
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};