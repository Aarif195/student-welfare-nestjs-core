import {
    useHostelControllerGetMyHostels,
    useHostelControllerGetOwnerBookings,
    useHostelControllerGetHostelMaintenance,
    useHostelControllerGetHostelReviews,
    useHostelControllerGetHostelNotifications
} from '../../../api/generated/hostels/hostels';
import {
    LayoutDashboard, Building2, Users, ClipboardList,
    Star, Calendar, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerOverviewPage = () => {
    const { data: hostels } = useHostelControllerGetMyHostels();
    const { data: bookings } = useHostelControllerGetOwnerBookings();

    // Mapping of Hooks
    const hostelList: any[] = (hostels?.data?.data as any[]) || [];
    const bookingList: any[] = (bookings?.data?.data as any[]) || [];

    const firstHostelId = hostelList?.[0]?.id;

    const { data: maintenance } = useHostelControllerGetHostelMaintenance(
        firstHostelId!,
        undefined,
        { query: { enabled: !!firstHostelId } }
    );

    const { data: reviews } = useHostelControllerGetHostelReviews(
        firstHostelId!,
        undefined,
        { query: { enabled: !!firstHostelId } }
    );

    const { data: notifications } = useHostelControllerGetHostelNotifications(
        firstHostelId!,
        { query: { enabled: !!firstHostelId } }
    );

    // Mapping of Hooks
    const maintenanceList: any[] =
        (maintenance as any)?.data?.MaintenanceRequests || [];
    const reviewList: any[] = (reviews?.data?.data as any[]) || [];
    const notificationList: any[] = (notifications as any)?.data?.data || [];

    const pendingMaintenance = maintenanceList.filter(
        (m: any) => m.status === 'pending'
    );


    const stats = [
        {
            label: 'Total Hostels',
            value: hostelList.length,
            icon: Building2,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/dashboard/owner/hostels'
        },
        {
            label: 'Total Bookings',
            value: bookingList.length,
            icon: Users,
            color: 'text-brand',
            bg: 'bg-blue-50',
            link: '/dashboard/owner/bookings'
        },
        {
            label: 'Pending Repairs',
            value: pendingMaintenance.length,
            icon: ClipboardList,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/dashboard/owner/maintenance'
        },
        {
            label: 'Avg Rating',
            value: '4.8',
            icon: Star,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            link: '/dashboard/owner/reviews'
        },
    ];

    return (
        <div className="space-y-8 px-4 sm:px-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-primary-800 flex items-center gap-2">
                    <LayoutDashboard className="text-brand" /> Dashboard Overview
                </h1>
                <p className="text-primary-500 text-sm">Real-time update across all your managed hostels.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Link key={i} to={stat.link} className="bg-white p-5 rounded-xl border border-primary-100 shadow-sm hover:border-brand transition-all">
                        <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-xl font-bold text-primary-800">{stat.value}</h3>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section: Recent Bookings */}
                <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary-50 flex justify-between items-center bg-primary-50/30">
                        <h3 className="font-bold text-sm text-primary-800 flex items-center gap-2">
                            <Calendar size={16} className="text-brand" /> Recent Bookings
                        </h3>
                        <Link to="/dashboard/owner/bookings" className="text-[10px] font-bold text-brand uppercase">View All</Link>
                    </div>
                    <div className="divide-y divide-primary-50">
                        {bookingList.slice(0, 3).map((b: any) => (
                            <div key={b.id} className="p-4 flex justify-between items-center hover:bg-primary-50/20">
                                <div>
                                    <p className="text-sm font-bold text-primary-700">{b.student ? `${b.student.firstName} ${b.student.lastName}` : 'Unknown'}</p>
                                    <p className="text-[10px] text-primary-400">{b.hostel?.name} • Room {b.room?.room_number}</p>
                                </div>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">PAID</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Latest Notifications */}
                <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary-50 flex justify-between items-center bg-primary-50/30">
                        <h3 className="font-bold text-sm text-primary-800 flex items-center gap-2">
                            <Bell size={16} className="text-brand" /> Recent Sent Updates
                        </h3>
                        <Link to="/dashboard/owner/notifications" className="text-[10px] font-bold text-brand uppercase">History</Link>
                    </div>
                    <div className="divide-y divide-primary-50">
                        {notificationList.slice(0, 3).map((n: any) => (
                            <div key={n.id} className="p-4">
                                <p className="text-sm font-bold text-primary-700">{n.title}</p>
                                <p className="text-xs text-primary-500 truncate">{n.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Maintenance Alerts */}
                <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary-50 flex justify-between items-center bg-primary-50/30">
                        <h3 className="font-bold text-sm text-primary-800 flex items-center gap-2">
                            <ClipboardList size={16} className="text-orange-500" /> Maintenance Alerts
                        </h3>
                        <Link to="/dashboard/owner/maintenance" className="text-[10px] font-bold text-brand uppercase">Manage</Link>
                    </div>
                    <div className="divide-y divide-primary-50">
                        {pendingMaintenance.slice(0, 3).map((m: any) => (
                            <div key={m.id} className="p-4 flex justify-between items-center">
                                <p className="text-sm text-primary-700 font-medium">{m.description}</p>
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">PENDING</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Recent Reviews */}
                <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary-50 flex justify-between items-center bg-primary-50/30">
                        <h3 className="font-bold text-sm text-primary-800 flex items-center gap-2">
                            <Star size={16} className="text-yellow-500" /> Latest Reviews
                        </h3>
                        <Link to="/dashboard/owner/reviews" className="text-[10px] font-bold text-brand uppercase">Reply</Link>
                    </div>
                    <div className="divide-y divide-primary-50">
                        {reviewList.slice(0, 2).map((r: any) => (
                            <div key={r.id} className="p-4">
                                <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={10}
                                            className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-primary-200"}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-primary-600 italic">"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};