import React, { useState } from 'react';
import { 
    useAdminControllerGetAllNotifications,
    useAdminControllerCreateNotification,
    useAdminControllerDeleteNotification,
    useAdminControllerGetAllHostels
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

import { 
    Bell, Trash2, Megaphone, Plus, X, 
    Loader2, Users, Building2,
    Calendar, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';


export const AdminNotificationsPage = () => {
    const queryClient = useQueryClient();
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notificationIdToDelete, setNotificationIdToDelete] = useState<number | null>(null);

    // Form inputs state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'global' | 'hostel'>('global');
    const [hostelId, setHostelId] = useState<string>('');

    // API Hooks
    const { data: notificationsData, isLoading } = useAdminControllerGetAllNotifications({ page: 1, limit: 50 });
    const { data: hostelsData } = useAdminControllerGetAllHostels({ page: 1, limit: 100 });
    const { mutate: createNotification, isPending: isCreating } = useAdminControllerCreateNotification();
    const { mutate: deleteNotification } = useAdminControllerDeleteNotification();

    const notificationsList = (notificationsData as any)?.data?.notifications || [];
    const hostelsList = (hostelsData as any)?.data?.Hostels || [];

    // handleCreateSubmit
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        const payload: any = {
            title: title.trim(),
            message: message.trim(),
            type
        };

        if (type === 'hostel') {
            if (!hostelId) {
                toast.error("Please select a target hostel");
                return;
            }
            payload.hostelId = Number(hostelId);
        }

        createNotification({ data: payload }, {
            onSuccess: () => {
                toast.success("Notification successfully published and sent to students");
                setIsCreateOpen(false);
                resetForm();
                queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Notification publication failed");
            }
        });
    };

    // handleConfirmDelete
    const handleConfirmDelete = () => {
        if (!notificationIdToDelete) return;

        deleteNotification({ notificationId: notificationIdToDelete }, {
            onSuccess: () => {
                toast.success("Notification deleted successfully");
                setIsDeleteModalOpen(false);
                setNotificationIdToDelete(null);
                queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to delete notification");
            }
        });
    };

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setType('global');
        setHostelId('');
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">Broadcast Channels</h1>
                    <p className="text-sm text-primary-500">Dispatch urgent warnings, policy updates, or direct announcements to systemic nodes.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-400 hover:opacity-90 text-green text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                    <Plus size={14} /> New Broadcast
                </button>
            </div>

            {/* Notifications Feed */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-white animate-pulse rounded-3xl border border-primary-100" />
                    ))}
                </div>
            ) : notificationsList.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <Bell size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">No Broadcast Dispatches</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No administrative bulletins or targeted alerts exist within the network payload history.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notificationsList.map((notif: any) => (
                        <div key={notif.id} className="bg-white rounded-3xl border border-primary-100 p-6 shadow-sm flex justify-between gap-4 items-start">
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        notif.type === 'global' 
                                            ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                        {notif.type === 'global' ? <Users size={11} /> : <Building2 size={11} />}
                                        {notif.type} broadcast
                                    </span>
                                    {notif.hostel && (
                                        <span className="text-xs font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100/30">
                                            Target: {notif.hostel.name}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-bold text-primary-800 text-sm">{notif.title}</h3>
                                    <p className="text-xs text-primary-600 leading-relaxed font-medium">{notif.message}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center text-[11px] font-semibold text-primary-400 border-t border-primary-50/50 pt-2">
                                    <span className="flex items-center gap-1">
                                        <Mail size={12} /> {notif.author?.firstName} {notif.author?.lastName} ({notif.creator_role})
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(notif.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setNotificationIdToDelete(notif.id);
                                    setIsDeleteModalOpen(true);
                                }}
                                className="text-primary-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer shrink-0"
                                title="Purge announcement"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Broadcast Form Context Modal Overlay */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-primary-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Megaphone size={16} className="text-primary-900" />
                                <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wider">Configure Broadcast Vector</h2>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="text-primary-400 hover:bg-primary-50 p-1.5 rounded-full cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3 bg-primary-50 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('global')}
                                    className={`py-2 text-[11px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                        type === 'global' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400'
                                    }`}
                                >
                                    Global Network
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('hostel')}
                                    className={`py-2 text-[11px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                        type === 'hostel' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400'
                                    }`}
                                >
                                    Hostel Specific
                                </button>
                            </div>

                            {type === 'hostel' && (
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase text-primary-400">Target Demarcation Node</label>
                                    <select
                                        required
                                        className="w-full bg-primary-50 border-none rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all cursor-pointer"
                                        value={hostelId}
                                        onChange={e => setHostelId(e.target.value)}
                                    >
                                        <option value="">Select target destination structure...</option>
                                        {hostelsList.map((h: any) => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-primary-400">Broadcast Subject / Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-primary-50 border-none rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                                    placeholder="e.g. System Maintenance Notice"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-primary-400">Alert Payload Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-primary-50 border-none rounded-2xl p-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all resize-none"
                                    placeholder="Write formal telemetry dispatch statement payload data here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500 text-primary-400 hover:bg-red-300 transition-all cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 bg-green-600 text-white hover:bg-green py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Publish Alert'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Purge Safety Check Barrier */}
            <ConfirmModal
                open={isDeleteModalOpen}
                title="Delete Notification"
                message="Are you sure you want to delete this notification alert? This action cannot be undone and will strip visibility logs for all targets."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setNotificationIdToDelete(null);
                }}
            />
        </div>
    );
};