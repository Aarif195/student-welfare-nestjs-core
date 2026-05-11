import { 
    useStudentControllerGetMyNotifications, 
    useStudentControllerMarkAsRead 
} from '../../../api/generated/student/student';
import { 
    Bell, Clock, 
    Info, Megaphone, Check,
    Building2, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const StudentNotificationsPage = () => {
    const queryClient = useQueryClient();
    
    const { data, isLoading } = useStudentControllerGetMyNotifications({
        page: 1,
        limit: 10
    });

    const { mutate: markAsRead } = useStudentControllerMarkAsRead();

    const notifications = (data as any)?.data?.notifications || [];

    const handleMarkRead = (notificationId: number) => {
        markAsRead({ notificationId }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Error updating notification");
            }
        });
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'hostel': return <Building2 size={18} className="text-brand" />;
            case 'announcement': return <Megaphone size={18} className="text-blue-500" />;
            default: return <Info size={18} className="text-primary-400" />;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">Notifications</h1>
                    <p className="text-sm text-primary-500">Stay updated with hostel and campus alerts.</p>
                </div>
                {notifications.length > 0 && (
                    <div className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        {notifications.length} Total
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {notifications.map((notif: any) => {
                        const isRead = notif.readBy && notif.readBy.length > 0;
                        
                        return (
                            <div 
                                key={notif.id} 
                                className={`group bg-white rounded-2xl border transition-all p-4 ${
                                    isRead ? 'border-primary-50 opacity-75' : 'border-brand/20 shadow-sm'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                        isRead ? 'bg-primary-50' : 'bg-brand/5'
                                    }`}>
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-bold ${isRead ? 'text-primary-600' : 'text-primary-800'}`}>
                                                {notif.title}
                                            </h3>
                                            {!isRead && (
                                                <button 
                                                    onClick={() => handleMarkRead(notif.id)}
                                                    className="text-[10px] font-bold text-brand uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Check size={12} /> Mark as read
                                                </button>
                                            )}
                                        </div>
                                        
                                        <p className="text-xs text-primary-500 leading-relaxed">
                                            {notif.message}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] font-medium text-primary-400">
                                            <span className="flex items-center gap-1 uppercase tracking-tight">
                                                <Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={12} /> {notif.author?.firstName} ({notif.creator_role})
                                            </span>
                                            {notif.hostel && (
                                                <span className="flex items-center gap-1 text-brand/70 font-bold">
                                                    <Building2 size={12} /> {notif.hostel.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {notifications.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary-200">
                            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell size={24} className="text-primary-300" />
                            </div>
                            <p className="text-primary-500 text-sm italic font-medium">No new notifications.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};