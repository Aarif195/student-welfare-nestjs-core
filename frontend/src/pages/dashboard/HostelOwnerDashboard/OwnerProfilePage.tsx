import React, { useState, useEffect, useRef } from 'react';
import { useProfileControllerGetProfile, useProfileControllerUpdateProfile } from '../../../api/generated/profile/profile';
import { useCloudinaryControllerGetSignature } from '../../../api/generated/cloudinary/cloudinary';

import {
    User, Mail, Phone, MapPin,
    Camera, Loader2, Save, Edit2,
    ShieldCheck, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

export const OwnerProfilePage = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [, setUploadedUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: response, isLoading } = useProfileControllerGetProfile();
    const { mutate: updateProfile, isPending } = useProfileControllerUpdateProfile();

    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'avatars' },
        { query: { enabled: false } }
    );

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        image: ''
    });

    useEffect(() => {
        const user = (response as any)?.data;
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                image: user.image || ''
            });
        }
    }, [response]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file, signatureQuery, setUploadedUrls);
            if (url) {
                setFormData(prev => ({ ...prev, image: url }));
                toast.success("Image uploaded successfully");
            }
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({ data: formData }, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Update failed");
            }
        });
    };

    if (isLoading) return <div className="h-60 bg-white animate-pulse rounded-3xl border border-primary-100" />;

    const profile = (response as any)?.data;

    return (
        <div className="max-w-4xl space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">Owner Settings</h1>
                    <p className="text-sm text-primary-500">Manage your business profile and contact information.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-primary-100 transition-all cursor-pointer"
                    >
                        <Edit2 size={14} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-primary-50 text-center shadow-sm">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img 
                                src={formData.image || 'https://via.placeholder.com/150'} 
                                alt="Profile" 
                                className={`w-full h-full rounded-full object-cover border-4 border-primary-50 shadow-inner ${isUploading ? 'opacity-50' : ''}`}
                            />
                            <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {isEditing && (
                                <div 
                                    onClick={handleImageClick}
                                    className="absolute bottom-0 right-0 bg-brand p-2 rounded-full text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                >
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-primary-800">{profile?.firstName} {profile?.lastName}</h2>
                        <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-brand/5 text-brand rounded-full text-[10px] font-bold uppercase border border-brand/10">
                            <ShieldCheck size={12} /> {profile?.role}
                        </div>
                        <p className="text-[10px] text-primary-400 mt-4 flex items-center justify-center gap-1">
                            <Calendar size={12} /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '...'}
                        </p>
                    </div>
                </div>

                {/* Information Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2.5rem] border border-primary-50 shadow-sm space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-primary-400 ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" size={16} />
                                    <input 
                                        disabled={!isEditing}
                                        className="w-full bg-primary-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-primary-800 outline-none focus:ring-2 ring-brand/20 disabled:opacity-70 transition-all"
                                        value={formData.firstName}
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-primary-400 ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" size={16} />
                                    <input 
                                        disabled={!isEditing}
                                        className="w-full bg-primary-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-primary-800 outline-none focus:ring-2 ring-brand/20 disabled:opacity-70 transition-all"
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-primary-400 ml-1">Business Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" size={16} />
                                <input 
                                    disabled
                                    className="w-full bg-primary-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-primary-400 outline-none cursor-not-allowed"
                                    value={profile?.email || ''}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-primary-400 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" size={16} />
                                <input 
                                    disabled={!isEditing}
                                    className="w-full bg-primary-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-primary-800 outline-none focus:ring-2 ring-brand/20 disabled:opacity-70 transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-primary-400 ml-1">Business Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" size={16} />
                                <input 
                                    disabled={!isEditing}
                                    className="w-full bg-primary-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-primary-800 outline-none focus:ring-2 ring-brand/20 disabled:opacity-70 transition-all"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending || isUploading}
                                    className="flex-1 bg-brand text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 cursor-pointer"
                                >
                                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};