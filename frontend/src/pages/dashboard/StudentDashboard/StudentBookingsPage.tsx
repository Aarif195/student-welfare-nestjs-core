import { useState } from 'react';
import { useStudentControllerGetMyBookings, useStudentControllerCancelBooking } from '../../../api/generated/student/student';
import {
    Calendar, MapPin, Building2,
    CreditCard, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const StudentBookingsPage = () => {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<number | null>(null);

    const { data, isLoading } = useStudentControllerGetMyBookings({
        page: 1,
        limit: 10
    });

    const { mutate: cancelBooking } = useStudentControllerCancelBooking();

    const bookings = (data as any)?.data || [];

    const handleCancel = (bookingId: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setProcessingId(bookingId);
        cancelBooking({ bookingId }, {
            onSuccess: () => {
                toast.success("Booking cancelled successfully");
                queryClient.invalidateQueries({ queryKey: ['student', 'bookings'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to cancel booking");
            },
            onSettled: () => setProcessingId(null)
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
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
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusStyles(booking.booking_status)}`}>
                                        {booking.booking_status}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-primary-400 font-bold uppercase">Total Paid</p>
                                        <p className="text-lg font-bold text-primary-800">₦{Number(booking.price).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-50 rounded-lg text-brand">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-primary-800">{booking.room?.hostel?.name}</h3>
                                                <p className="text-xs text-primary-500 flex items-center gap-1"><MapPin size={12} /> {booking.room?.hostel?.location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end space-y-2 text-xs text-primary-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Period: {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} />
                                            <span>Ref: <span className="font-mono text-primary-700 uppercase">{booking.payments?.[0]?.reference || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {booking.booking_status.toLowerCase() === 'pending' && (
                                    <div className="mt-6 pt-4 border-t border-primary-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-medium flex-1">
                                            <AlertCircle size={14} className="shrink-0" />
                                            Awaiting SuperAdmin approval. You can cancel this booking before it is approved.
                                        </div>
                                        <button
                                            onClick={() => handleCancel(booking.booking_id)}
                                            disabled={processingId === booking.booking_id}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {processingId === booking.booking_id ? <Loader2 size={14} className="animate-spin" /> : "Cancel Booking"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/*Empty bookings */}
                    {bookings.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary-200">
                            <p className="text-primary-500 font-medium italic">No booking history found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};