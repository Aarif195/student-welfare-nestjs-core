import React, { useState } from 'react';
import {
    useStudentControllerGetMyReviews,
    useStudentControllerCreateReview,
    useStudentControllerGetMyBookings
} from '../../../api/generated/student/student';
import {
    Star, Plus,
    X, Loader2, Quote,
    Reply, Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const StudentReviewsPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hover, setHover] = useState(0);
    const [formData, setFormData] = useState({ hostel_id: 0, rating: 0, comment: '' });

    const { data: reviewData, isLoading } = useStudentControllerGetMyReviews({ page: 1, limit: 10 });
    const { data: bookingData } = useStudentControllerGetMyBookings({ page: 1, limit: 50 });
    const { mutate: createReview, isPending } = useStudentControllerCreateReview();

    const reviews = (reviewData as any)?.data?.reviews || [];
    // Only allow reviewing hostels the student has actually booked
    const approvedBookings = (bookingData as any)?.data?.filter((b: any) => b.booking_status === 'approved') || [];

    const getStarColor = (rating: number) => {
        if (rating >= 4) return 'text-green-500';
        if (rating >= 3) return 'text-yellow-500';
        return 'text-red-500';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.rating === 0) return toast.error("Please select a rating");
        if (formData.hostel_id === 0) return toast.error("Please select a hostel");

        createReview({ data: formData }, {
            onSuccess: () => {
                toast.success("Review submitted!");
                setIsModalOpen(false);
                setFormData({ hostel_id: 0, rating: 0, comment: '' });
                queryClient.invalidateQueries({ queryKey: ['student', 'reviews'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to submit review");
            }
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">My Reviews</h1>
                    <p className="text-sm text-primary-500">Share your experience with the hostels you've stayed in.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-blue-100"
                >
                    <Plus size={18} /> Write Review
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-44 bg-white animate-pulse rounded-3xl border border-primary-100" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Review Grid */}
                    {reviews.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="bg-white rounded-3xl border border-primary-50 p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-primary-800 flex items-center gap-2">
                                                <Building2 size={16} className="text-brand" /> {review.hostel?.name}
                                            </h3>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.rating ? `${getStarColor(review.rating)} fill-current` : 'text-primary-100'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-primary-300 uppercase italic">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -left-2 -top-2 text-primary-50 opacity-50" size={24} />
                                        <p className="text-xs text-primary-600 leading-relaxed italic pl-4">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    {review.owner_reply && (
                                        <div className="mt-4 p-4 bg-primary-50/50 rounded-2xl border border-primary-50 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-brand uppercase">
                                                <Reply size={12} className="rotate-180" /> Owner Response
                                            </div>
                                            <p className="text-xs text-primary-500 leading-relaxed italic">
                                                {review.owner_reply}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {reviews.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-[2.5rem] border border-dashed border-primary-200">
                            <div className="bg-primary-50 p-4 rounded-full mb-4">
                                <Quote className="text-primary-200" size={32} />
                            </div>
                            <h3 className="text-primary-800 font-bold text-lg mb-1">No reviews yet</h3>
                            <p className="text-primary-500 font-medium italic text-sm max-w-xs">
                                You haven't shared your experience with any hostels yet.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-primary-800">Submit a Review</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-primary-400 hover:bg-primary-50 p-2 rounded-full cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-primary-400 mb-2">Select Hostel</label>
                                <select
                                    className="w-full bg-primary-50 border-none rounded-2xl p-4 text-sm outline-none font-semibold text-primary-800 appearance-none"
                                    value={formData.hostel_id}
                                    onChange={e => setFormData({ ...formData, hostel_id: Number(e.target.value) })}
                                    required
                                >
                                    <option value={0}>Choose a hostel...</option>
                                    {approvedBookings.map((b: any) => (
                                        <option key={b.booking_id} value={b.room.hostel.id}>
                                            {b.room.hostel.name} ({b.room.room_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-center">
                                <label className="block text-[10px] font-bold uppercase text-primary-400 mb-3 text-left">Your Rating</label>
                                <div className="flex justify-center gap-2">
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={ratingValue}
                                                className="cursor-pointer transition-transform active:scale-90 "
                                                onClick={() => setFormData({ ...formData, rating: ratingValue })}
                                                onMouseEnter={() => setHover(ratingValue)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                <Star
                                                    size={32}
                                                    className={`${ratingValue <= (hover || formData.rating)
                                                            ? `${getStarColor(hover || formData.rating)} fill-current`
                                                            : 'text-primary-100'
                                                        } transition-colors`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-primary-400 mb-2 text-left">Feedback</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-primary-50 border-none rounded-3xl p-4 text-sm outline-none focus:ring-2 ring-brand/20 transition-all resize-none"
                                    placeholder="Tell us what you liked or what could be improved..."
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary-800 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-100 cursor-pointer"
                            >
                                {isPending ? <Loader2 size={20} className="animate-spin" /> : "Publish Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};