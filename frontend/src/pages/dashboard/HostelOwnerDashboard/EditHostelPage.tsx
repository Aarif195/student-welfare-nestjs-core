import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useHostelControllerGetOne, useHostelControllerUpdate } from '../../../api/generated/hostels/hostels';
import { CreateHostelResourceDtoFileType, type UpdateHostelDto } from '../../../api/model';

import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCloudinaryControllerGetSignature } from '../../../api/generated/cloudinary/cloudinary';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';


export const EditHostelPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [images, setImages] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [, setIsUploading] = useState(false);

    const { data: hostel, isLoading } = useHostelControllerGetOne(Number(id));
    const updateMutation = useHostelControllerUpdate();

    const { register, handleSubmit, reset } = useForm();

    // Pre-fill the form when data arrives
    useEffect(() => {
        if (hostel?.data) {
            reset({
                name: hostel.data.name,
                location: hostel.data.location,
                description: hostel.data.description,
            });
        }
    }, [hostel, reset]);

    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'avatars' },
        { query: { enabled: false } }
    );

    // upload function
    const handleFilesUpload = async (files: File[]) => {
        setIsUploading(true);

        const uploadPromises = files.map(file =>
            uploadToCloudinary(file, signatureQuery, setUploadedUrls)
        );

        await Promise.all(uploadPromises);
        setIsUploading(false);
    };

    const onSubmit = (data: any) => {
        const payload: UpdateHostelDto = {
            name: data.name,
            location: data.location,
            description: data.description,
            resources: uploadedUrls.length > 0 ? uploadedUrls.map(url => ({
                file_url: url,
                file_type: CreateHostelResourceDtoFileType.IMAGE
            })) : undefined
        };

        updateMutation.mutate({
            id: Number(id),
            data: payload
        }, {
            onSuccess: () => {
                toast.success("Hostel updated successfully!");
                navigate(`/dashboard/owner/hostels/${id}`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Update failed");
            }
        });
    };

    if (isLoading) return <div className="animate-spin ..."></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500">
                <ArrowLeft size={20} /> Back
            </button>

            <div className="bg-white p-8 rounded-xl border border-primary-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Edit Hostel Details</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Hostel Name</label>
                        <input {...register('name')} className="w-full p-2.5 border rounded-lg" />
                    </div>
                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Location</label>
                        <input {...register('location')} className="w-full p-2.5 border rounded-lg" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Description</label>
                        <textarea {...register('description')} rows={4} className="w-full p-2.5 border rounded-lg" />
                    </div>


                    {/* Images Input */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary-600">Hostel Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async e => {
                                if (!e.target.files) return;

                                const files = Array.from(e.target.files);
                                setImages(files);
                                setUploadedUrls([]);

                                await handleFilesUpload(files);
                            }}

                            className="w-full border border-primary-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand outline-none"
                        />
                        {images.length > 0 && (
                            <p className="text-xs text-primary-500 mt-1">{images.length} file(s) selected</p>
                        )}
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {images.map((file, index) => (
                                    <div key={index} className="w-20 h-20 border rounded-lg overflow-hidden relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full bg-brand text-white py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Save size={20} />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>


                </form>
            </div>
        </div>
    );
};