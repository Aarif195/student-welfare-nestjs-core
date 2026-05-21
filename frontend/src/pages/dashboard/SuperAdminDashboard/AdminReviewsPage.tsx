import React, { useState } from 'react';
import {
    useAdminControllerGetAllReviews,
    useAdminControllerAdminReplyToReview
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import {
    Star, MessageSquare, CornerDownRight,
    Search, User, Building2, Calendar,
    X, Loader2, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const AdminReviewsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    
    // Modal controls for admin reply
    const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: reviewsData, isLoading } = useAdminControllerGetAllReviews({ page: 1, limit: 50 });
    const { mutate: sendReply, isPending: isSubmittingReply } = useAdminControllerAdminReplyToReview();

    const reviewsList = (reviewsData as any)?.data?.reviews || [];

    const filteredReviews = reviewsList.filter((review: any) => {
        const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              review.hostel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              review.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;
        return matchesSearch && matchesRating;
    });

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyingReviewId || !replyText.trim()) return;

        sendReply({
            reviewId: replyingReviewId,
            data: { reply: replyText.trim() }
        }, {
            onSuccess: () => {
                toast.success("Review replied to successfully");
                setReplyingReviewId(null);
                setReplyText('');
                queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Reply submission failed");
            }
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={14} 
                        className={i < rating ? "fill-amber-400 text-amber-400" : "text-primary-200"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Feedback & Ratings moderation</h1>
                <p className="text-sm text-primary-500">Monitor student impressions, evaluate accommodation conditions, and issue administrative responses.</p>
            </div>

            {/* Filtering Tools Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                    <input 
                        className="w-full bg-white border border-primary-100 rounded-2xl py-2.5 p-3 pl-11 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                        placeholder="Search student, commentary, or hostel name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-1.5 bg-primary-100/50 p-1 rounded-2xl border border-primary-100/40 w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => setRatingFilter('all')}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            ratingFilter === 'all' ? 'bg-primary-900 text-white shadow-sm' : 'text-primary-500 hover:text-primary-800'
                        }`}
                    >
                        All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setRatingFilter(rating)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                ratingFilter === rating ? 'bg-primary-900 text-white shadow-sm' : 'text-primary-500 hover:text-primary-800'
                            }`}
                        >
                            {rating} <Star size={12} className="fill-current" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Render Framework */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-40 bg-primary-300 animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">No Feedback Records</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No submitted evaluation logs correspond to your sorting filter criteria index.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review: any) => (
                        <div key={review.id} className="bg-white rounded-2xl border border-primary-100 p-6 shadow-sm space-y-4">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-primary-800 flex items-center gap-2 text-sm">
                                        <Building2 size={15} className="text-primary-900 shrink-0" /> {review.hostel?.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-primary-400 font-semibold">
                                        <span className="flex items-center gap-1"><User size={12} /> {review.student?.firstName}</span>
                                        <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="bg-primary-50/60 px-3 py-1.5 rounded-xl border border-primary-100/50">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <p className="text-xs font-medium text-primary-700 leading-relaxed pl-1">
                                "{review.comment}"
                            </p>

                            {/* Response Section */}
                            {review.owner_reply ? (
                                <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-50 flex gap-3 text-xs">
                                    <CornerDownRight size={16} className="text-primary-400 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 block">System Response Log</span>
                                        <p className="font-semibold text-primary-800">"{review.owner_reply}"</p>
                                        {review.replied_at && (
                                            <span className="text-[9px] font-bold text-primary-400 block">{new Date(review.replied_at).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end pt-2 border-t border-primary-50/60">
                                    <button
                                        onClick={() => setReplyingReviewId(review.id)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white hover:bg-green-700  text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                                    >
                                        <Send size={12} /> Dispatch Response
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Response Form Context Portal Overlay */}
            {replyingReviewId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wider">Formulate Review Reply</h2>
                            <button onClick={() => setReplyingReviewId(null)} className="text-primary-400 hover:bg-primary-50 p-1.5 rounded-full cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleReplySubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase text-primary-400">Response Transcript</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full bg-primary-50 border-none rounded-2xl p-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all resize-none"
                                    placeholder="Write back official commentary response message..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setReplyingReviewId(null)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingReply}
                                    className="flex-1 bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    {isSubmittingReply ? <Loader2 size={14} className="animate-spin" /> : 'Transmit Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};