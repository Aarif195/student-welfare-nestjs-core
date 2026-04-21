import { useHostelControllerGetOwnerBookings } from '../../../api/generated/hostels/hostels';
import { CalendarCheck, User, Building2, CreditCard, Clock } from 'lucide-react';


export const OwnerBookingsPage = () => {
    const { data: bookings, isLoading } = useHostelControllerGetOwnerBookings();

    if (isLoading) {
        return <div className="p-6 animate-pulse text-primary-500 text-center">Loading Bookings...</div>;
    }

    const bookingsList: any = bookings?.data?.data || [];

    return (
        <div className="space-y-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                    <CalendarCheck className="text-brand" />
                    Manage Bookings
                </h1>
                <div className="text-sm text-primary-500 bg-primary-100 px-3 py-1 rounded-full w-fit">
                    Total: {bookingsList.length}
                </div>
            </div>

            {/* Mobile View: Cards | Desktop View: Table */}
            <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-primary-50 border-b border-primary-100 text-primary-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Hostel / Room</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-100">
                            {bookingsList.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-primary-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand/10 p-2 rounded-full text-brand hidden sm:block">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary-700">{booking.student?.name || 'Unknown Student'}</p>
                                                <p className="text-xs text-primary-500">{booking.student?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-primary-700 flex items-center gap-1">
                                                <Building2 size={14} /> {booking.hostel?.name}
                                            </p>
                                            <p className="text-xs text-primary-500">Room: {booking.room?.room_number}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-primary-700">₦{booking.amount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-primary-400 uppercase tracking-wider flex items-center gap-1">
                                            <CreditCard size={10} /> {booking.paymentStatus || 'Paid'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-primary-500 flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {bookingsList.length === 0 && (
                    <div className="p-10 text-center text-primary-500">
                        <p>No bookings found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};