import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    useHostelControllerGetMyHostels,
    useHostelControllerGetHostelReviews,
    useHostelControllerReplyToReview
} from '../../../api/generated/hostels/hostels';
import { Star, MessageSquare, Send, Building2, User } from 'lucide-react';

export const ReviewsPage = () => {
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const { data: reviews, refetch, isLoading } = useHostelControllerGetHostelReviews(
        selectedHostelId!,
        undefined,
        { query: { enabled: !!selectedHostelId } }
    );

    const { data: hostels } = useHostelControllerGetMyHostels();
    // const hostelList = (hostels?.data as any) || [];
    const hostelList: any = hostels?.data?.data || [];
    const reviewsList: any[] =
        (reviews as any)?.data?.reviews || [];

    // replyMutation function
    const replyMutation = useHostelControllerReplyToReview();
    const { register, handleSubmit, reset } = useForm();

    const onReply = (data: any) => {
        if (!replyingTo) return;

        replyMutation.mutate({
            reviewId: replyingTo,
            data: { reply: data.reply }
        }, {
            onSuccess: () => {
                toast.success("Reply posted");
                setReplyingTo(null);
                reset();
                refetch();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to reply")
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                    <Star className="text-brand fill-brand" size={24} /> Student Reviews
                </h1>
                <select
                    onChange={(e) => setSelectedHostelId(Number(e.target.value))}
                    className="p-2.5 border border-primary-200 rounded-lg bg-white text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-brand"
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
                    <p>Select a hostel to view student feedback</p>
                </div>
            ) : isLoading ? (
                <div className="text-center py-10 animate-pulse text-primary-500">Loading reviews...</div>
            ) : (
                <div className="space-y-4">
                    {reviewsList.map((review: any) => (
                        <div key={review.id} className="bg-white border border-primary-100 rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-100 p-2 rounded-full text-primary-600">
                                        <User size={18} />
                                    </div>

                                    <div>
                                        <p className="font-bold text-primary-700">{review.student?.name || 'Student'}</p>

                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-primary-200"} />
                                            ))}
                                        </div>


                                    </div>
                                </div>
                                <span className="text-[10px] text-primary-400 uppercase font-medium">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-primary-600 text-sm leading-relaxed pl-11">
                                {review.comment}
                            </p>

                            {review.reply ? (
                                <div className="ml-11 bg-primary-50 p-4 rounded-lg border-l-4 border-brand">
                                    <p className="text-[10px] font-bold text-brand uppercase mb-1">Your Response</p>
                                    <p className="text-sm text-primary-700">{review.reply}</p>
                                </div>
                            ) : replyingTo === review.id ? (
                                <form onSubmit={handleSubmit(onReply)} className="ml-11 space-y-3">
                                    <textarea
                                        {...register('reply', { required: true })}
                                        className="w-full p-3 border border-primary-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand"
                                        placeholder="Write your reply..."
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={replyMutation.isPending} className="bg-brand text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer">
                                            <Send size={14} /> Post Reply
                                        </button>
                                        <button type="button" onClick={() => setReplyingTo(null)} className="text-primary-500 px-4 py-1.5 text-xs font-bold cursor-pointer">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="ml-11">
                                    <button
                                        onClick={() => setReplyingTo(review.id)}
                                        className="text-xs text-brand font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                                    >
                                        <MessageSquare size={14} /> Reply to Student
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {reviewsList.length === 0 && (
                        <p className="text-center text-primary-400 py-20">No reviews found for this hostel yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};