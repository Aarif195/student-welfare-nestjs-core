import { useState } from 'react';
import { 
    useAdminControllerGetAllMaintenance,
    useAdminControllerUpdateMaintenanceStatus
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import { 
    Wrench, Clock, CheckCircle2, XCircle, 
    Play, Search, User, Building2, Hash, 
    Calendar, Eye, Loader2, 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const AdminMaintenancePage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'rejected'>('all');
    
    // Modal state for active media view
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

    const { data: maintenanceData, isLoading } = useAdminControllerGetAllMaintenance({ page: 1, limit: 50 });
    const { mutate: updateStatus, isPending: isUpdating } = useAdminControllerUpdateMaintenanceStatus();

    const requestList = (maintenanceData as any)?.data?.MaintenanceRequests || [];

    const filteredRequests = requestList.filter((req: any) => {
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              req.hostel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.room?.room_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusTransition = (id: number, nextStatus: 'in_progress' | 'resolved' | 'rejected') => {
        updateStatus({ id, data: { status: nextStatus } }, {
            onSuccess: () => {
                toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
                queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Transition failure");
            }
        });
    };

    const getStatusBadge = (status: 'pending' | 'in_progress' | 'resolved' | 'rejected') => {
        switch (status) {
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase border border-green-100">
                        <CheckCircle2 size={11} /> Resolved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase border border-red-100">
                        <XCircle size={11} /> Rejected
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase border border-blue-100 animate-pulse">
                        <Play size={11} className="fill-blue-600" /> In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase border border-amber-100">
                        <Clock size={11} /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Campus Maintenance Pipeline</h1>
                <p className="text-sm text-primary-500">Track structural requests, transition execution workflows, and verify completed resolutions.</p>
            </div>

            {/* Filters Navigation Panel */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="relative w-full xl:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                    <input 
                        className="w-full bg-white border border-primary-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                        placeholder="Search title, hostel, or room allocation..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-1.5 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                    {(['all', 'pending', 'in_progress', 'resolved', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                statusFilter === status
                                ? 'bg-primary-900 text-white shadow-md'
                                : 'bg-white text-primary-500 border border-primary-100 hover:bg-primary-50'
                            }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Application Interface Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-60 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <Wrench size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">Pipeline Empty</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No maintenance tickets match the selected status index parameter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRequests.map((req: any) => (
                        <div key={req.id} className="bg-white rounded-2xl border border-primary-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                                            <Hash size={10} /> Ticket Ref: {req.id}
                                        </span>
                                        <h3 className="font-bold text-primary-800 text-sm tracking-tight">{req.title}</h3>
                                        <p className="text-xs text-primary-500 font-bold flex items-center gap-1">
                                            <Building2 size={13} className="text-primary-400" /> {req.hostel?.name} • <span className="text-primary-900">{req.room?.room_number}</span>
                                        </p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>

                                <p className="text-xs text-primary-600 leading-relaxed bg-primary-50/40 p-3.5 rounded-2xl border border-primary-50">
                                    {req.description}
                                </p>

                                {/* Media Attachment Deck & Student Info */}
                                <div className="flex items-center justify-between gap-4 border-t border-primary-50/80 pt-3">
                                    <div className="text-[11px] font-semibold text-primary-500 space-y-0.5">
                                        <p className="flex items-center gap-1"><User size={12} className="text-primary-400" /> Filed by: {req.student?.firstName} {req.student?.lastName}</p>
                                        <p className="flex items-center gap-1 text-primary-400"><Calendar size={11} /> {new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {req.image_url && (
                                        <button 
                                            type="button"
                                            onClick={() => setActiveImageUrl(req.image_url)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 text-[11px] font-bold rounded-xl transition-all border border-primary-100/50 cursor-pointer"
                                        >
                                            <Eye size={12} /> View Evidence
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Execution Deck State Controls */}
                            {['pending', 'in_progress'].includes(req.status) && (
                                <div className="flex gap-2 mt-5 pt-4 border-t border-primary-50">
                                    {req.status === 'pending' && (
                                        <>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleStatusTransition(req.id, 'rejected')}
                                                className="flex-1 border border-red-100 text-red-500 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleStatusTransition(req.id, 'in_progress')}
                                                className="flex-1 bg-orange-300 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                                            >
                                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Assign Progress'}
                                            </button>
                                        </>
                                    )}

                                    {req.status === 'in_progress' && (
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => handleStatusTransition(req.id, 'resolved')}
                                            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                                        >
                                            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Mark as Fixed'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Photographic Overlay Evidence Portal Box */}
            {activeImageUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm">
                    <div className="relative bg-white p-2 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col">
                        <button 
                            onClick={() => setActiveImageUrl(null)}
                            className="absolute top-4 right-4 bg-primary-900 text-white p-2 rounded-full hover:scale-105 transition-all shadow-md z-10 cursor-pointer"
                        >
                            <XCircle size={20} />
                        </button>
                        <img 
                            src={activeImageUrl} 
                            alt="Maintenance Field Assessment Evidence Documentation" 
                            className="w-full h-auto max-h-[80vh] object-contain rounded-[1.7rem]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};