import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import { 
    LayoutDashboard, Building2, ClipboardList, 
    Users, BookOpen, Wrench, Star, 
    Bell, LogOut, Menu, X, ShieldAlert 
} from 'lucide-react';

export const SuperAdminDashboardLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth(); 

    const navItems = [
        { name: 'Overview', path: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
        { name: 'Hostel Approvals', path: '/dashboard/admin/hostels', icon: <Building2 size={18} /> },
        { name: 'Bookings', path: '/dashboard/admin/bookings', icon: <ClipboardList size={18} /> },
        { name: 'User Management', path: '/dashboard/admin/users', icon: <Users size={18} /> },
        { name: 'Study Spaces', path: '/dashboard/admin/facilities', icon: <BookOpen size={18} /> },
        { name: 'Maintenance', path: '/dashboard/admin/maintenance', icon: <Wrench size={18} /> },
        { name: 'Reviews', path: '/dashboard/admin/reviews', icon: <Star size={18} /> },
        { name: 'Communications', path: '/dashboard/admin/notifications', icon: <Bell size={18} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-primary-50/50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-primary-100 p-6 shrink-0 h-screen sticky top-0">
                <div className="flex items-center gap-3 px-2 py-4 border-b border-primary-50 mb-6">
                    <div className="bg-red-50 p-2.5 rounded-2xl text-red-600">
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-primary-800 tracking-tight">HQ Control</h2>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Superadmin</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    isActive
                                        ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/10'
                                        : 'text-primary-500 hover:bg-primary-50 hover:text-primary-800'
                                }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-4 border-t border-primary-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation Header */}
            <div className="flex flex-col flex-1 min-w-0">
                <header className="lg:hidden bg-white border-b border-primary-100 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-50 p-2 rounded-xl text-red-600">
                            <ShieldAlert size={18} />
                        </div>
                        <span className="text-xs font-black text-primary-800 uppercase tracking-wider">Admin HQ</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="text-primary-600 p-2 hover:bg-primary-50 rounded-xl cursor-pointer"
                    >
                        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </header>

                {/* Mobile Drawer Overlay */}
                {isMobileOpen && (
                    <div 
                        className="fixed inset-0 bg-primary-900/30 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                {/* Mobile Drawer Menu */}
                <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white p-6 border-r border-primary-100 flex flex-col transition-transform duration-300 lg:hidden ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex items-center justify-between pb-6 border-b border-primary-50 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-red-50 p-2 rounded-xl text-red-600">
                                <ShieldAlert size={18} />
                            </div>
                            <span className="text-xs font-black text-primary-800 uppercase tracking-wider">Admin HQ</span>
                        </div>
                        <button onClick={() => setIsMobileOpen(false)} className="text-primary-400 p-1 cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                                        isActive
                                            ? 'bg-primary-900 text-white'
                                            : 'text-primary-500 hover:bg-primary-50'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-primary-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Workspace */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};