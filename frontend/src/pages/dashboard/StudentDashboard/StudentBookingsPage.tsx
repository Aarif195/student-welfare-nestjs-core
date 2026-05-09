import { useStudentControllerGetMyBookings } from '../../../api/generated/student/student';
import {
    Calendar, MapPin, Building2,
    CreditCard, Clock, CheckCircle2,
    XCircle, AlertCircle
} from 'lucide-react';

export const StudentBookingsPage = () => {
    const { data, isLoading } = useStudentControllerGetMyBookings({
        page: 1,
        limit: 10
    });

    const bookings = (data as any)?.data || [];

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-100'; // pending
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return <CheckCircle2 size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">My Bookings</h1>
                <p className="text-sm text-primary-500">Track your hostel applications and payment history.</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {bookings.map((booking: any) => (
                        <div key={booking.booking_id} className="bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-sm">
                            <div className="p-4 sm:p-6">
                                {/* Header: Status and Price */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusStyles(booking.booking_status)}`}>
                                        {getStatusIcon(booking.booking_status)}
                                        {booking.booking_status}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-primary-400 font-bold uppercase">Total Paid</p>
                                        <p className="text-lg font-bold text-primary-800">₦{Number(booking.price).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Body: Hostel and Room Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-50 rounded-lg text-brand">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-primary-800">{booking.room?.hostel?.name}</h3>
                                                <p className="text-xs text-primary-500 flex items-center gap-1">
                                                    <MapPin size={12} /> {booking.room?.hostel?.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-primary-600 pl-1">
                                            <span className="font-semibold text-primary-800">{booking.room?.room_number}</span>
                                            <span className="text-primary-300">|</span>
                                            <span className="text-xs">Capacity: {booking.room?.capacity}</span>
                                        </div>
                                    </div>

                                    {/* Footer Details: Date and Payment Ref */}
                                    <div className="flex flex-col justify-end space-y-2 pt-4 md:pt-0 border-t md:border-t-0 border-primary-50">
                                        <div className="flex items-center gap-2 text-xs text-primary-500">
                                            <Calendar size={14} />
                                            <span>Period: {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-primary-500">
                                            <CreditCard size={14} />
                                            <span>Ref: <span className="font-mono text-primary-700 uppercase">{booking.payments?.[0]?.reference || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {booking.booking_status === 'pending' && (
                                    <div className="mt-6 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-medium leading-relaxed">
                                        <AlertCircle size={14} className="shrink-0" />
                                        Your booking is awaiting SuperAdmin approval. You will be notified once confirmed.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {bookings.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary-200">
                            <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 size={30} className="text-primary-300" />
                            </div>
                            <p className="text-primary-500 font-medium italic">No booking history found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};