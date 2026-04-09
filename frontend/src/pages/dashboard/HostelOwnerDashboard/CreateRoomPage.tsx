import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useHostelControllerCreateRoom } from '../../../api/generated/hostels/hostels';
import { useCloudinaryControllerGetSignature } from '../../../api/generated/cloudinary/cloudinary';
import { CreateRoomResourceDtoFileType } from '../../../api/model';


import { ArrowLeft, Bed } from 'lucide-react';
import toast from 'react-hot-toast';

import axios from 'axios';

export const CreateRoomPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const createRoomMutation = useHostelControllerCreateRoom();
    const queryClient = useQueryClient();
    const [images, setImages] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            room_number: '',
            capacity: 1,
            price: 0,
            availability: true
        }
    });

    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'avatars' },
        { query: { enabled: false } }
    );

    const handleFileUpload = async (file: File) => {
        try {
            const result = await signatureQuery.refetch();
            const signData = (result.data as any)?.data || result.data;

            if (!signData) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signData.apiKey);
            formData.append('timestamp', String(signData.timestamp));
            formData.append('signature', signData.signature);
            formData.append('folder', signData.folder);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
                formData
            );

            setUploadedUrls(prev => [...prev, res.data.secure_url]);

        } catch (err) {
            toast.error("Upload failed");
        }
    };

    const onSubmit = (data: any) => {
        // Converting numeric strings from form to actual numbers as per DTO @Type(() => Number)
        const payload = {
            hostelId: Number(id),
            data: {
                room_number: data.room_number,
                capacity: Number(data.capacity),
                price: Number(data.price),
                availability: Boolean(data.availability),

                resources: uploadedUrls.map(url => ({
                    file_url: url,
                    file_type: CreateRoomResourceDtoFileType.IMAGE
                }))
            }
        };
        createRoomMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Room created successfully!");
                queryClient.invalidateQueries({ queryKey: ['hostelControllerGetRoomsByHostel'] });
                navigate(`/dashboard/owner/hostels/${id}`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to create room.");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary-500 hover:text-brand transition-colors cursor-pointer"
            >
                <ArrowLeft size={20} />
                <span>Back to Hostel Details</span>
            </button>

            <div className="bg-white border border-primary-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand/10 p-2 rounded-lg text-brand">
                        <Bed size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-700">Add New Room</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary-600">Room Number/Name</label>
                        <input
                            {...register('room_number', { required: "Room number is required" })}
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            placeholder="e.g. Room 101 or Executive Suite"
                        />
                        {errors.room_number && <p className="text-red-500 text-xs">{errors.room_number.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-primary-600">Capacity (Students)</label>
                            <input
                                type="number"
                                {...register('capacity', { required: "Capacity is required", min: 1 })}
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-primary-600">Price (Per Session/Year)</label>
                            <input
                                type="number"
                                {...register('price', { required: "Price is required", min: 0 })}
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="availability"
                            {...register('availability')}
                            className="w-4 h-4 text-brand border-primary-300 rounded focus:ring-brand"
                        />
                        <label htmlFor="availability" className="text-sm font-medium text-primary-700">
                            Available for immediate booking
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-primary-600">Room Images</label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setImages(files);

                                files.forEach(file => handleFileUpload(file));

                            }}
                            className="w-full"
                        />

                        {/* Preview */}
                        <div className="flex gap-2 flex-wrap mt-2">
                            {images.map((file, index) => (
                                <img
                                    key={index}
                                    src={URL.createObjectURL(file)}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createRoomMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {createRoomMutation.isPending && (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {createRoomMutation.isPending ? 'Adding Room...' : 'Create Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};