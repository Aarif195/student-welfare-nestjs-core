import { useNavigate } from 'react-router-dom';
import {
    useAdminControllerGetAllHostels,
    useAdminControllerGetPendingBookings,
    useAdminControllerGetAllMaintenance,
    useAdminControllerGetAllNotifications
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import {
    Building2, ClipboardList,
    Wrench, Bell, ArrowRight, Activity,
    AlertCircle, CheckCircle2, Clock,
    ShieldAlert
} from 'lucide-react';

export const AdminOverviewPage = () => {
    const navigate = useNavigate();

    // Parallel fetch stream from system caches
    const { data: hostelsData, isLoading: hostelsLoading } = useAdminControllerGetAllHostels({ page: 1, limit: 100 });
    const { data: bookingsData, isLoading: bookingsLoading } = useAdminControllerGetPendingBookings({ page: 1, limit: 100 });
    const { data: maintenanceData, isLoading: maintenanceLoading } = useAdminControllerGetAllMaintenance({ page: 1, limit: 100 });
    const { data: notificationsData, isLoading: notificationsLoading } = useAdminControllerGetAllNotifications({ page: 1, limit: 100 });

    const isSystemLoading = hostelsLoading || bookingsLoading || maintenanceLoading || notificationsLoading;

    // Data Extraction Arrays
    const hostelsList = (hostelsData as any)?.data?.Hostels || [];
    const bookingsList = (bookingsData as any)?.data?.bookings || [];
    const requestList = (maintenanceData as any)?.data?.MaintenanceRequests || [];
    const notificationsList = (notificationsData as any)?.data?.notifications || [];

    // Summary Metric Aggregations
    const totalHostels = hostelsList.length;
    const pendingHostels = hostelsList.filter(
        (h: any) => h.status === 'PENDING'
    ).length;

    const totalPendingBookings = bookingsList.length;

    const activeMaintenance = requestList.filter((m: any) => m.status === 'pending' || m.status === 'in_progress').length;
    const urgentMaintenance = requestList.filter((m: any) => m.status === 'pending').slice(0, 3);

    const totalNotifications = notificationsList.length;

    const cards = [
        {
            name: 'Hostel Registry',
            value: totalHostels,
            subtext: `${pendingHostels} pending review`,
            icon: <Building2 size={22} className="text-blue-600" />,
            bg: 'bg-blue-50/50 border-blue-100/60',
            path: '/dashboard/admin/hostels'
        },
        {
            name: 'Booking Requests',
            value: totalPendingBookings,
            subtext: `${totalPendingBookings} awaiting approval`,
            icon: <ClipboardList size={22} className="text-amber-600" />,
            bg: 'bg-amber-50/50 border-amber-100/60',
            path: '/dashboard/admin/bookings'
        },
        {
            name: 'Maintenance Load',
            value: activeMaintenance,
            subtext: `${urgentMaintenance.length} unassigned tickets`,
            icon: <Wrench size={22} className="text-red-600" />,
            bg: 'bg-red-50/50 border-red-100/60',
            path: '/dashboard/admin/maintenance'
        },
        {
            name: 'Active Broadcasts',
            value: totalNotifications,
            subtext: 'Live network alerts',
            icon: <Bell size={22} className="text-purple-600" />,
            bg: 'bg-purple-50/50 border-purple-100/60',
            path: '/dashboard/admin/notifications'
        }
    ];

    if (isSystemLoading) {
        return (
            <div className="space-y-6 pb-10">
                <div className="h-12 w-64 bg-primary-300 animate-pulse rounded-xl border border-primary-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-white animate-pulse rounded-3xl border border-primary-100" />
                    ))}
                </div>
                <div className="h-64 bg-white animate-pulse rounded-3xl border border-primary-100" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Administrative Overview</h1>
                <p className="text-sm text-primary-500">Live operational monitoring index for campus nodes, lodging operations, and infrastructure status telemetry.</p>
            </div>

            {/* High-Impact Metric Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(card.path)}
                        className={`p-5 rounded-3xl border ${card.bg} shadow-sm flex justify-between items-start cursor-pointer hover:scale-[1.01] transition-all group`}
                    >
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400 block">{card.name}</span>
                            <span className="text-3xl font-black text-primary-800 block tracking-tight">{card.value}</span>
                            <span className="text-[10px] font-bold text-primary-500 flex items-center gap-1">
                                <Activity size={10} /> {card.subtext}
                            </span>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-primary-100/40 group-hover:shadow-sm transition-all">
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Split Operations Feed Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Maintenance Urgent Attention Queue */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-primary-100 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-primary-50/60 pb-3">
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-primary-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={14} className="text-red-500" /> Critical Infrastructure Incidents
                            </h3>
                            <p className="text-[11px] text-primary-400">Urgent pending maintenance tickets requiring operational review or engineer deployment.</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/admin/maintenance')}
                            className="text-primary-900 text-xs font-bold uppercase flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                        >
                            View Pipeline <ArrowRight size={12} />
                        </button>
                    </div>

                    {urgentMaintenance.length === 0 ? (
                        <div className="py-12 text-center space-y-2">
                            <div className="bg-emerald-50 text-emerald-500 p-3 rounded-full w-fit mx-auto border border-emerald-100">
                                <CheckCircle2 size={24} />
                            </div>
                            <h4 className="font-bold text-primary-800 text-xs uppercase tracking-wider">Zero Pending Failures</h4>
                            <p className="text-[11px] text-primary-400 max-w-xs mx-auto">All logged campus facilities maintenance logs have been successfully triaged into execution cycles.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {urgentMaintenance.map((ticket: any) => (
                                <div key={ticket.id} className="bg-primary-50/30 border border-primary-100/40 rounded-2xl p-4 flex justify-between items-center gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-primary-800 text-xs">{ticket.title || ticket.description}</h4>
                                        <p className="text-[11px] text-primary-500 font-medium">  Hostel: {ticket.hostel?.name || 'N/A'} • {ticket.room?.room_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-100 text-[10px] font-bold uppercase text-amber-600">
                                        <Clock size={11} /> Pending
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Operations Checklist Summary Box */}
                <div className="bg-white rounded-3xl border border-primary-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="border-b border-primary-50/60 pb-3">
                            <h3 className="font-bold text-primary-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle size={14} className="text-primary-900" /> Operational Directives
                            </h3>
                            <p className="text-[11px] text-primary-400">Immediate bottlenecks requiring authentication authorizations.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-primary-50/40 rounded-xl border border-primary-50 text-xs">
                                <span className="font-semibold text-primary-600">Unverified Accommodations</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-lg text-[11px] ${pendingHostels > 0 ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-500'}`}>
                                    {pendingHostels}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-primary-50/40 rounded-xl border border-primary-50 text-xs">
                                <span className="font-semibold text-primary-600">Stalled Bedspace Bookings</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-lg text-[11px] ${totalPendingBookings > 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-500'}`}>
                                    {totalPendingBookings}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-900 text-white rounded-2xl p-4 space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 block">System Integrity</span>
                        <p className="text-xs font-semibold leading-relaxed">Ensure all pending background structural approvals are synchronized to guarantee unhindered tenant placements across facilities.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};