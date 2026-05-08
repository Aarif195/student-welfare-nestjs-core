import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Search,
    BookmarkCheck,
    Wrench,
    Bell,
    LogOut,
    Star,
    User,
    BookOpen
} from 'lucide-react';

export const StudentDashboardLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Discover', path: '/dashboard/student', icon: <Search size={20} /> },
        { name: 'Study Spaces', path: '/dashboard/student/study-spaces', icon: <BookOpen size={20} /> },
        { name: 'My Bookings', path: '/dashboard/student/bookings', icon: <BookmarkCheck size={20} /> },
        { name: 'Maintenance', path: '/dashboard/student/maintenance', icon: <Wrench size={20} /> },
        { name: 'Notifications', path: '/dashboard/student/notifications', icon: <Bell size={20} /> },
        { name: 'Reviews', path: '/dashboard/student/reviews', icon: <Star size={20} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-primary-50/50">
            {/* Sidebar - Desktop Only */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-primary-200 flex-col sticky top-0 h-screen">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-brand italic">StudentPortal</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                    ? 'bg-brand text-white shadow-lg shadow-blue-100'
                                    : 'text-primary-600 hover:bg-primary-50'
                                }`}
                        >
                            {item.icon}
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-primary-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 pb-24 lg:pb-0">
                {/* Mobile Top Header */}
                <div className="lg:hidden bg-white border-b border-primary-100 p-4 flex justify-between items-center sticky top-0 z-30">
                    <h1 className="font-bold text-brand italic">StudentPortal</h1>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-brand">
                        <User size={18} />
                    </div>
                </div>

                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav - Only visible on small screens */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 px-2 py-3 flex justify-around items-center z-40">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === item.path ? 'text-brand' : 'text-primary-400'}`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-bold">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};