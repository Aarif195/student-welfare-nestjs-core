import React, { useState } from 'react';
import { 
    useAdminControllerGetPendingBookings,
    useAdminControllerApproveBooking,
    useAdminControllerRejectBooking
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import { 
    ClipboardList, CheckCircle2, XCircle, 
    Clock, Search, User, Mail, Building2, 
    Hash, Calendar, CreditCard, Loader2, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const AdminBookingsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal controls for booking rejection
    const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: bookingsData, isLoading } = useAdminControllerGetPendingBookings({ page: 1, limit: 50 });
    const { mutate: approveBooking, isPending: isApproving } = useAdminControllerApproveBooking();
    const { mutate: rejectBooking, isPending: isRejecting } = useAdminControllerRejectBooking();

    const bookingsList = (bookingsData as any)?.data?.bookings || [];

    const filteredBookings = bookingsList.filter((booking: any) => {
        const studentName = `${booking.student?.firstName || ''} ${booking.student?.lastName || ''}`.toLowerCase();
        const studentEmail = (booking.student?.email || '').toLowerCase();
        const hostelName = (booking.room?.hostel?.name || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return studentName.includes(search) || studentEmail.includes(search) || hostelName.includes(search);
    });

    const handleApprove = (bookingId: number) => {
        approveBooking({ bookingId }, {
            onSuccess: () => {
                toast.success("Booking approved and email sent to student");
                queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Approval failed");
            }
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingBookingId || !rejectionReason.trim()) return;

        rejectBooking({
            bookingId: rejectingBookingId,
            data: { reason: rejectionReason }
        }, {
            onSuccess: () => {
                toast.success("Booking rejected and notification sent");
                setRejectingBookingId(null);
                setRejectionReason('');
                queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Rejection failed");
            }
        });
    };

    const formatCurrency = (amount: string) => {
        const numericAmount = parseFloat(amount);
        return isNaN(numericAmount) ? '₦0.00' : `₦${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Pending Bookings Matrix</h1>
                <p className="text-sm text-primary-500">Audit matching payment parameters and secure room reservations across active student portals.</p>
            </div>

            {/* Operational Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                <input 
                    className="w-full bg-white border border-primary-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                    placeholder="Search student, email, or hostel..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Data Presentation Layer */}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-64 bg-white animate-pulse rounded-4xl border border-primary-100" />
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-4xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <ClipboardList size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">Queue Clear</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No pending student reservations require verification at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredBookings.map((booking: any) => {
                        const payment = booking.payments?.[0];
                        return (
                            <div key={booking.booking_id} className="bg-white rounded-4xl border border-primary-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                                <div className="space-y-4">
                                    {/* Header Context Meta */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-0.5">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                                                <Hash size={10} /> Booking ID: {booking.booking_id}
                                            </span>
                                            <h3 className="font-bold text-primary-800 flex items-center gap-2">
                                                <Building2 size={16} className="text-primary-900" /> {booking.room?.hostel?.name}
                                            </h3>
                                            <p className="text-xs text-primary-500 font-medium">
                                                Unit Allocation: <span className="text-primary-900 font-bold">{booking.room?.room_number || 'N/A'}</span>
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase border border-amber-100">
                                            <Clock size={12} /> Pending Approval
                                        </span>
                                    </div>

                                    {/* Core Information Split Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-primary-50/50 p-4 rounded-2xl border border-primary-50 text-xs">
                                        <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-primary-100/60 pb-3 sm:pb-0 sm:pr-3">
                                            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider block">Student Profiling</span>
                                            <p className="font-bold text-primary-800 flex items-center gap-1.5">
                                                <User size={13} className="text-primary-400" /> {booking.student?.firstName} {booking.student?.lastName}
                                            </p>
                                            <p className="text-primary-500 font-medium flex items-center gap-1.5 truncate">
                                                <Mail size={13} className="text-primary-400" /> {booking.student?.email}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5 sm:pl-1">
                                            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider block">Tenancy Window</span>
                                            <p className="text-primary-700 font-semibold flex items-center gap-1.5">
                                                <Calendar size={13} className="text-primary-400" /> {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                                            </p>
                                            <p className="text-primary-900 font-bold flex items-center gap-1.5">
                                                <CreditCard size={13} className="text-primary-500" /> Value: {formatCurrency(booking.price)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Paystack Financial Settlement Audit Box */}
                                    {payment ? (
                                        <div className="bg-green-50/40 border border-green-100/70 rounded-xl p-3 flex flex-wrap justify-between items-center text-[11px] font-semibold text-green-700 gap-2">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 size={13} className="text-green-500" /> Paystack Reference: <span className="font-bold">{payment.reference}</span>
                                            </span>
                                            <span className="text-green-600/90 bg-white border border-green-100 px-2 py-0.5 rounded-md text-[10px]">
                                                Captured: {new Date(payment.paid_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50/40 border border-red-100/70 rounded-xl p-3 text-[11px] font-semibold text-red-600 flex items-center gap-1.5">
                                            <XCircle size={13} /> Missing Paystack Meta Reference Array Data
                                        </div>
                                    )}
                                </div>

                                {/* Operational Verification Execution Bar */}
                                <div className="flex gap-2 mt-5 pt-4 border-t border-primary-50">
                                    <button
                                        disabled={isApproving || isRejecting}
                                        onClick={() => setRejectingBookingId(booking.booking_id)}
                                        className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40"
                                    >
                                        Deny Request
                                    </button>
                                    <button
                                        disabled={isApproving || isRejecting}
                                        onClick={() => handleApprove(booking.booking_id)}
                                        className="flex-1 bg-green-600 text-white hover:bg-green-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                                    >
                                        {isApproving ? <Loader2 size={14} className="animate-spin" /> : 'Approve Lease'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rejection Overlay Portal Modal */}
            {rejectingBookingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wider">Decline Booking Assignment</h2>
                            <button onClick={() => setRejectingBookingId(null)} className="text-primary-400 hover:bg-primary-50 p-1.5 rounded-full cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-primary-400">Rejection Cause Context</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full bg-primary-50 border-none rounded-2xl p-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-red-500/10 transition-all resize-none"
                                    placeholder="State precise transactional issue (e.g., Incomplete Payment, Discrepancy)..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setRejectingBookingId(null)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isRejecting}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    {isRejecting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Denial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};