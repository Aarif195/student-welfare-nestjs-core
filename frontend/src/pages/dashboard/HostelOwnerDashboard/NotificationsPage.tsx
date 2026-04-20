import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bell, Send, Trash2, Info, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHostelControllerCreateNotification, useHostelControllerDeleteNotification, useHostelControllerGetHostelNotifications, useHostelControllerGetMyHostels } from '../../../api/generated/hostels/hostels';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export const NotificationsPage = () => {
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [deleteNotificationId, setDeleteNotificationId] = useState<number | null>(null);

    // Fetch hostels to populate the selector
    const { data: hostels } = useHostelControllerGetMyHostels();

    // Fetch notifications for the selected hostel
    const { data: notifications, refetch } = useHostelControllerGetHostelNotifications(
        selectedHostelId!,
        { query: { enabled: !!selectedHostelId } }
    );

    const hostelList: any = hostels?.data?.data || [];
    const notificationsList: any[] =
        (notifications as any)?.data?.data || [];


    const createMutation = useHostelControllerCreateNotification();
    const deleteMutation = useHostelControllerDeleteNotification();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { title: '', message: '' }
    });

    const onSendNotification = (data: any) => {
        if (!selectedHostelId) return toast.error("Please select a hostel first");

        createMutation.mutate({
            hostelId: selectedHostelId,
            data: { title: data.title, message: data.message }
        }, {
            onSuccess: () => {
                toast.success("Notification sent to all residents");
                reset();
                refetch();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to send")
        });
    };

 
    const confirmDeleteNotification = () => {
    if (!deleteNotificationId) return;

    deleteMutation.mutate(
        { notificationId: deleteNotificationId },
        {
            onSuccess: () => {
                toast.success("Deleted");
                refetch();
            },
            onSettled: () => {
                setDeleteNotificationId(null);
            }
        }
    );
};

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
            {/* Header & Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                    <Bell className="text-brand" /> Notifications
                </h1>
                <select
                    onChange={(e) => setSelectedHostelId(Number(e.target.value))}
                    className="p-2.5 border border-primary-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand w-full md:w-64 text-sm"
                >
                    <option value="">Select a Hostel</option>
                    {hostelList.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Send Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-primary-200 shadow-sm h-fit">
                    <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
                        <Send size={18} /> New Broadcast
                    </h3>
                    <form onSubmit={handleSubmit(onSendNotification)} className="space-y-4">
                        <input
                            {...register('title', { required: true })}
                            placeholder="Title (e.g. Water Maintenance)"
                            className="w-full p-2.5 border border-primary-200 rounded-lg text-sm"
                        />
                        <textarea
                            {...register('message', { required: true })}
                            placeholder="Type your message to residents..."
                            rows={4}
                            className="w-full p-2.5 border border-primary-200 rounded-lg text-sm"
                        />
                        <button
                            disabled={createMutation.isPending || !selectedHostelId}
                            className="w-full bg-brand text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-all hover:bg-blue-700 cursor-pointer"
                        >
                            {createMutation.isPending ? 'Sending...' : 'Send to All Residents'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-primary-700 flex items-center gap-2">
                        <Info size={18} /> Sent History
                    </h3>

                    {!selectedHostelId ? (
                        <div className="bg-primary-50 border border-dashed border-primary-200 p-10 rounded-xl text-center text-primary-500">
                            Select a hostel above to view notification history
                        </div>
                    ) : (
                        <div className="space-y-3">

                            {
                                notificationsList.map((n: any) => (

                                    <div key={n.id} className="bg-white p-4 rounded-xl border border-primary-100 flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-primary-700">{n.title}</h4>
                                            <p className="text-sm text-primary-600 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-primary-400 font-medium uppercase pt-2">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDeleteNotificationId(n.id)}
                                            className="p-2 text-primary-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            {
                                notificationsList.length === 0 &&
                                (
                                    <p className="text-center text-primary-400 py-10">No notifications sent to this hostel yet.</p>
                                )}
                        </div>
                    )}
                </div>


            </div>

<ConfirmModal
    open={deleteNotificationId !== null}
    title="Delete Notification"
    message="This action cannot be undone. Do you want to continue?"
    confirmText="Delete"
    onClose={() => setDeleteNotificationId(null)}
    onConfirm={confirmDeleteNotification}
/>

        </div>
    );
};