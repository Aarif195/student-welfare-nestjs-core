import React, { useState } from 'react';
import { useAuthControllerRegister } from '../../api/generated/authentication/authentication';

import { useCloudinaryControllerGetSignature } from
    '../../api/generated/cloudinary/cloudinary';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
    const [role, setRole] = useState<'student' | 'hostelOwner'>('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const registerMutation = useAuthControllerRegister();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) return alert("Please wait for image to upload");
        if (!image) return alert("Please upload a profile image first.");

        registerMutation.mutate({
            data: { email, password, role, firstName, lastName, phone, image: image as unknown as Blob }
        }, {
            onSuccess: () => {
                alert("Registration Successful!");
                navigate('/login');
            }
        });
    };

    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'avatars' },
        { query: { enabled: false } }
    );

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            //  Get signature and timestamp from your NestJS backend
            const result = await signatureQuery.refetch();
            const signData = (result.data as any)?.data || result.data;

            if (!signData) return;

            //  Prepare Form Data for Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signData.apiKey);
            formData.append('timestamp', String(signData.timestamp));
            formData.append('signature', signData.signature);
            formData.append('folder', signData.folder);

            //  Upload directly to Cloudinary
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
                formData
            ).catch(err => {
                console.error("Cloudinary Response Error:", err.response?.data);
                throw err;
            });

            //  Save the secure_url to our state for the Register DTO
            setImage(res.data.secure_url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700">Create Account</h2>
                <p className="text-primary-500 mb-6">Join the Student Welfare Platform</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Selection */}
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 rounded-lg border font-medium transition-all ${role === 'student' ? 'bg-brand text-white border-brand' : 'bg-white text-primary-600 border-primary-200 cursor-pointer'
                                }`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('hostelOwner')}
                            className={`flex-1 py-2 rounded-lg border font-medium transition-all ${role === 'hostelOwner' ? 'bg-brand text-white border-brand' : 'bg-white text-primary-600 border-primary-200 cursor-pointer'
                                }`}
                        >
                            Hostel Owner
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-primary-600 mb-1">First Name</label>
                            <input
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-primary-600 mb-1">Last Name</label>
                            <input
                                className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Phone Number</label>
                        <input
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2.5 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-primary-600">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-primary-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-lg file:border-0
      file:text-sm file:font-semibold
      file:bg-primary-100 file:text-primary-700
      hover:file:bg-primary-200 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                        />
                        {image && <p className="text-xs text-green-600">Image uploaded successfully!</p>}
                    </div>

                    {isUploading && <p className="text-xs text-brand animate-pulse">Uploading to Cloudinary...</p>}
                    {image && <p className="text-xs text-green-600 font-bold">✓ Image Ready</p>}

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        {registerMutation.isPending ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                {registerMutation.isError && (
                    <p className="mt-4 text-red-500 text-sm text-center">Registration failed. Try again.</p>
                )}
            </div>
        </div>
    );
};