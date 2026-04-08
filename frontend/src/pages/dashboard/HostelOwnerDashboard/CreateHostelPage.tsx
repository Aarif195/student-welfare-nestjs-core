import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHostelControllerCreate } from '../../../api/generated/hostels/hostels';

export const CreateHostelPage = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<File[]>([]);
    const createMutation = useHostelControllerCreate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        // Ensuring images are included if your backend requires them
        if (images.length === 0) return toast.error("Please upload at least one image.");

        const formData = {
            ...data,
            images: images // Adjust based on how your generated hook expects files
        };

        createMutation.mutate({ data: formData }, {
            onSuccess: () => {
                toast.success("Hostel created successfully! Awaiting admin approval.");
                navigate('/dashboard/owner/hostels');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to create hostel.");
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary-500 hover:text-brand transition-colors cursor-pointer"
            >
                <ArrowLeft size={20} />
                <span>Back to Hostels</span>
            </button>

            <div className="bg-white border border-primary-200 rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-primary-700 mb-6">Register New Hostel</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-primary-600">Hostel Name</label>
                            <input 
                                {...register('name', { required: "Name is required" })}
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                placeholder="e.g. Sunshine Heights"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-primary-600">Category</label>
                            <select 
                                {...register('category', { required: true })}
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none bg-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary-600">Address</label>
                        <input 
                            {...register('address', { required: "Address is required" })}
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            placeholder="Full physical address"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-primary-600">Description</label>
                        <textarea 
                            {...register('description')}
                            rows={4}
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            placeholder="Tell students about the environment, security, and facilities..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {createMutation.isPending && (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {createMutation.isPending ? 'Registering...' : 'Create Hostel'}
                    </button>
                </form>
            </div>
        </div>
    );
};