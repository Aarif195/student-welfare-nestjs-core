import React, { useState } from 'react';
import {
    useStudentControllerGetMyMaintenance,
    useStudentControllerCreateRequest,
    getStudentControllerGetMyMaintenanceQueryKey,
    useStudentControllerDeleteRequest
} from '../../../api/generated/student/student';
import {
    Plus, Loader2, X, Building2, UploadCloud,
    ClipboardList,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCloudinaryControllerGetSignature } from '../../../api/generated/cloudinary/cloudinary';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export const StudentMaintenancePage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // State management
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // API Hooks
    const { data, isLoading } = useStudentControllerGetMyMaintenance({ page: 1, limit: 10 });
    const { mutate: createRequest, isPending } = useStudentControllerCreateRequest();
    const { mutate: deleteRequest, isPending: isDeleting } = useStudentControllerDeleteRequest();

    // Cloudinary Signature Hook
    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'maintenance' },
        { query: { enabled: false } }
    );

    const requests = (data as any)?.data?.MaintenanceRequests || [];

    // Image Upload Handler
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file, signatureQuery, setUploadedUrls);

            if (url) {
                toast.success("Image uploaded successfully");
                console.log("URL saved to state:", url);
            }
        } catch (error) {
            setPreviewUrl('');
            toast.error("Image upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    // handleSubmit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const imageToSubmit = uploadedUrls.length > 0 ? uploadedUrls[uploadedUrls.length - 1] : "";

        const payload = {
            title: formData.title,
            description: formData.description,
            image_url: imageToSubmit,
        };

        createRequest({ data: payload as any }, {
            onSuccess: () => {
                toast.success("Request submitted successfully");
                setIsModalOpen(false);
                setFormData({ title: '', description: '' });
                setUploadedUrls([]);
                setPreviewUrl('');
                queryClient.invalidateQueries({
                    queryKey: getStudentControllerGetMyMaintenanceQueryKey({ page: 1, limit: 10 })
                });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to submit request");
            }
        });
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteRequest({ id: deleteId }, {
                onSuccess: () => {
                    toast.success("Record deleted successfully");
                    setDeleteId(null);
                    queryClient.invalidateQueries({
                        queryKey: ['/api/v1/student/maintenance']
                    });
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Delete failed");
                }
            });
        }
    };

    // getStatusStyles
    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">Maintenance</h1>
                    <p className="text-sm text-primary-500">Report issues with your room or hostel facilities.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                    <Plus size={18} /> New Request
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-primary-200">
                    <div className="p-4 bg-primary-50 rounded-full mb-4">
                        <ClipboardList size={32} className="text-primary-300" />
                    </div>
                    <p className="text-primary-500 font-medium">No requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                    {requests.map((req: any) => (
                        <div key={req.id} className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusStyles(req.status)}`}>
                                    {req.status?.replace('_', ' ')}
                                </div>
                                <span className="text-[10px] text-primary-400 font-medium">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                            </div>



                            {req.image_url ? (
                                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-primary-50">
                                    <img
                                        src={req.image_url}
                                        alt={req.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {

                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-40 mb-4 rounded-xl bg-primary-50 flex flex-col items-center justify-center border border-primary-100">
                                    <UploadCloud size={32} className="text-primary-200 mb-2" />
                                    <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">No Image Provided</span>
                                </div>
                            )}

                            <h3 className="font-bold text-primary-800 mb-1">{req.title}</h3>
                            <p className="text-xs text-primary-500 line-clamp-2 mb-4">{req.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-primary-50">
                                <div className="flex items-center gap-2 text-[10px] text-primary-600 font-semibold">
                                    <Building2 size={14} className="text-brand" />
                                    {req.hostel?.name} • {req.room?.room_number}
                                </div>

                                {req.status === 'resolved' && (
                                    <button
                                        onClick={() => setDeleteId(req.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                            </div>
                        </div>
                    ))}


                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-primary-800">New Maintenance Request</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-primary-400 hover:text-primary-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-primary-500 mb-1.5">Issue Title</label>
                                <input
                                    required
                                    className="w-full bg-primary-50 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 ring-brand/20 transition-all"
                                    placeholder="e.g., Leaking Tap"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-primary-500 mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-primary-50 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 ring-brand/20 transition-all"
                                    placeholder="Describe the problem in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-primary-500 mb-1.5">Evidence Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="maintenance-upload"
                                />
                                <label
                                    htmlFor="maintenance-upload"
                                    className="flex items-center justify-center gap-2 w-full bg-primary-50 border-2 border-dashed border-primary-200 rounded-xl p-4 text-primary-500 cursor-pointer hover:bg-primary-100 transition-all"
                                >
                                    {isUploading ? <Loader2 size={20} className="animate-spin text-brand" /> : <UploadCloud size={20} className="text-brand" />}
                                    <span className="text-xs font-semibold">
                                        {previewUrl ? "Image Selected" : "Click to upload photo"}
                                    </span>
                                </label>

                                {previewUrl && (
                                    <div className="mt-2 w-12 h-12 rounded-lg border overflow-hidden">
                                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || isUploading}
                                className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                {isPending ? <Loader2 size={18} className="animate-spin" /> : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                open={deleteId !== null}
                title="Delete Record"
                message="Are you sure you want to delete this maintenance record? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
            />

        </div>
    );
};