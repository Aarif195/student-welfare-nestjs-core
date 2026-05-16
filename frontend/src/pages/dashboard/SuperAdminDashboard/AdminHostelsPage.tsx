import React, { useState } from 'react';
import { useAdminControllerGetAllHostels, useAdminControllerApproveHostel, useAdminControllerRejectHostel } from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import {
    Building2, CheckCircle2, XCircle,
    Clock, AlertCircle, MapPin,
    Mail, User, Loader2, Search, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';


export const AdminHostelsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    // Modal state for rejection
    const [rejectingHostelId, setRejectingHostelId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: hostelsData, isLoading } = useAdminControllerGetAllHostels({ page: 1, limit: 50 });
    const { mutate: approveHostel, isPending: isApproving } = useAdminControllerApproveHostel();
    const { mutate: rejectHostel, isPending: isRejecting } = useAdminControllerRejectHostel();

    const hostelsList = (hostelsData as any)?.data?.Hostels || [];

    const filteredHostels = hostelsList.filter((hostel: any) => {
        const matchesSearch = hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hostel.owner?.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'ALL' || hostel.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // handleApprove
    const handleApprove = (hostelId: number) => {
        approveHostel({ hostelId }, {
            onSuccess: () => {
                toast.success("Hostel approved successfully");
                queryClient.invalidateQueries({ queryKey: ['admin', 'hostels'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Approval failed");
            }
        });
    };

    // handleRejectSubmit
    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingHostelId || !rejectionReason.trim()) return;

        rejectHostel({
            hostelId: rejectingHostelId,
            data: { reason: rejectionReason }
        }, {
            onSuccess: () => {
                toast.success("Hostel execution updated to rejected");
                setRejectingHostelId(null);
                setRejectionReason('');
                queryClient.invalidateQueries({ queryKey: ['admin', 'hostels'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Rejection failed");
            }
        });
    };

    const getStatusBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase border border-green-100">
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase border border-red-100">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase border border-amber-100">
                        <Clock size={12} /> Pending Action
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Hostel Verification Queue</h1>
                <p className="text-sm text-primary-500">Review, approve, or decline incoming landlord property management submittals.</p>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                    <input
                        className="w-full bg-white border border-primary-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                        placeholder="Search by hostel name or owner email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedStatus === status
                                    ? 'bg-primary-900 text-white shadow-md'
                                    : 'bg-white text-primary-500 border border-primary-100 hover:bg-primary-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Presentation Layer */}
            {isLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-56 bg-primary-50 animate-pulse rounded-4x border border-primary-100" />
                    ))}
                </div>
            ) :

                filteredHostels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-4xl border border-dashed border-primary-200">
                        <div className="p-4 bg-primary-50 rounded-full mb-4">
                            <Building2 size={32} className="text-primary-300" />
                        </div>
                        <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider mb-1">No Hostels Found</h3>
                        <p className="text-xs text-primary-500 max-w-xs text-center px-4">There are no property submittals matching the selected filters or search parameters criteria.</p>
                    </div>
                ) :
                    (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredHostels.map((hostel: any) => (
                                <div key={hostel.id} className="bg-white rounded-4xl border border-primary-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-primary-800 flex items-center gap-2">
                                                    <Building2 size={16} className="text-primary-900" /> {hostel.name}
                                                </h3>
                                                <p className="text-xs text-primary-400 flex items-center gap-1">
                                                    <MapPin size={12} /> {hostel.location}
                                                </p>
                                            </div>
                                            {getStatusBadge(hostel.status)}
                                        </div>

                                        <p className="text-xs text-primary-600 leading-relaxed bg-primary-50/50 p-3.5 rounded-2xl border border-primary-50">
                                            {hostel.description}
                                        </p>

                                        {/* Owner Details Meta-Box */}
                                        <div className="border-t border-primary-50 pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-primary-500">
                                            <span className="flex items-center gap-1">
                                                <User size={12} className="text-primary-400" /> Owner: {hostel.owner?.firstName} {hostel.owner?.lastName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail size={12} className="text-primary-400" /> {hostel.owner?.email}
                                            </span>
                                        </div>

                                        {/* Rejection Display Area */}
                                        {hostel.status === 'REJECTED' && hostel.rejection_reason && (
                                            <div className="mt-2 p-3 bg-red-50/50 rounded-xl border border-red-50 text-xs text-red-600 flex gap-2 items-start">
                                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold uppercase text-[9px] block tracking-wide">Decline Reason:</span>
                                                    <span className="italic">"{hostel.rejection_reason}"</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Execution Controls for PENDING items */}
                                    {hostel.status === 'PENDING' && (
                                        <div className="flex gap-2 mt-5 pt-4 border-t border-primary-50">
                                            <button
                                                disabled={isApproving || isRejecting}
                                                onClick={() => setRejectingHostelId(hostel.id)}
                                                className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                disabled={isApproving || isRejecting}
                                                onClick={() => handleApprove(hostel.id)}
                                                className="flex-1 bg-green-600 text-white hover:bg-green-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                                            >
                                                {isApproving ? <Loader2 size={14} className="animate-spin" /> : 'Approve Submission'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}


                        </div>
                    )}

            {/* Rejection Modal System Context */}
            {rejectingHostelId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wider">Reject Documentation</h2>
                            <button onClick={() => setRejectingHostelId(null)} className="text-primary-400 hover:bg-primary-50 p-1.5 rounded-full cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-primary-400">Reason for decline</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-primary-50 border-none rounded-2xl p-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-red-500/10 transition-all resize-none"
                                    placeholder="Provide operational context or missing requirements details..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingHostelId(null)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRejecting}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    {isRejecting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};