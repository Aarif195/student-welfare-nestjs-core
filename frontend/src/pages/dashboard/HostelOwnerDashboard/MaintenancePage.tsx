import { useState } from 'react';
import {
    useHostelControllerGetMyHostels,
    useHostelControllerGetHostelMaintenance,
    useHostelControllerUpdateMaintenanceStatus
} from '../../../api/generated/hostels/hostels';
import { ClipboardList, CheckCircle, Clock, XCircle, Building2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const MaintenancePage = () => {
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);

    const { data: maintenanceRequests, refetch, isLoading } = useHostelControllerGetHostelMaintenance(
        selectedHostelId!,
        undefined,
        { query: { enabled: !!selectedHostelId } }
    );

    const { data: hostels } = useHostelControllerGetMyHostels();
    const hostelList: any = hostels?.data?.data || [];
    const maintenanceList: any[] =
        (maintenanceRequests as any)?.data?.MaintenanceRequests || [];




    // console.log(maintenanceList)

    const updateStatusMutation = useHostelControllerUpdateMaintenanceStatus();

    const handleStatusChange = (requestId: number, newStatus: any) => {
        updateStatusMutation.mutate({
            id: requestId,
            data: { status: newStatus }
        }, {
            onSuccess: () => {
                toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
                refetch();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Update failed")
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-primary-100 text-primary-700';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                    <ClipboardList className="text-brand" /> Maintenance Requests
                </h1>
                <select
                    onChange={(e) => setSelectedHostelId(Number(e.target.value))}
                    className="p-2.5 border border-primary-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand w-full md:w-64 text-sm"
                >
                    <option value="">Select a Hostel</option>
                    {Array.isArray(hostelList) &&
                        hostelList.map((h: any) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                </select>
            </div>

            {!selectedHostelId ? (
                <div className="bg-white border border-dashed border-primary-200 p-20 rounded-xl text-center text-primary-400">
                    <Building2 className="mx-auto mb-4 opacity-20" size={48} />
                    <p>Select a hostel to manage its maintenance tasks</p>
                </div>
            ) : isLoading ? (
                <div className="text-center py-10 animate-pulse text-primary-500">Loading requests...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {maintenanceList.map((req: any) => (
                        <div key={req.id} className="bg-white border border-primary-100 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusStyles(req.status)}`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                    <h3 className="font-bold text-primary-700 pt-1">{req.title || 'General Repair'}</h3>
                                </div>

                                <p className="text-xs text-primary-400 flex items-center gap-1">
                                    <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {req.image_url &&
                                req.image_url.trim() ? (
                                <img
                                    src={req.image_url}
                                    alt="maintenance"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-40 bg-primary-50 rounded-lg flex items-center justify-center text-primary-300">
                                    <ImageIcon size={28} />
                                </div>
                            )}

                            <p className="text-sm text-primary-600 bg-primary-50/50 p-3 rounded-lg italic">
                                "{req.description}"
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-primary-50">
                                <div className="text-xs text-primary-500">
                                    Room: <span className="font-bold text-primary-700">{req.room?.room_number || 'N/A'}</span>
                                </div>

                                <select
                                    value={req.status}
                                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                    disabled={updateStatusMutation.isPending}
                                    className="text-xs p-2 border border-primary-200 rounded-md outline-none bg-primary-50 font-semibold text-primary-700 cursor-pointer"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {maintenanceList.length === 0 && (
                        <div className="col-span-full py-20 text-center text-primary-400">
                            No maintenance requests found for this hostel.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};