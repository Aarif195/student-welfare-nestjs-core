import { useState } from 'react';
import { useAuthControllerRegister } from '../../api/generated/authentication/authentication';
import { useCloudinaryControllerGetSignature } from '../../api/generated/cloudinary/cloudinary';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Validation Schema
const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Include an uppercase letter')
        .regex(/[a-z]/, 'Include a lowercase letter')
        .regex(/[0-9]/, 'Include a number')
        .regex(/[^A-Za-z0-9]/, 'Include a special character'),
    role: z.enum(['student', 'hostelOwner']),
    image: z.string().min(1, 'Profile image is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'student', image: '' }
    });

    const role = watch('role');
    const image = watch('image');

    const registerMutation = useAuthControllerRegister();

    const handleRegister = (data: RegisterFormData) => {
        if (isUploading) return toast.error("Please wait for image to upload");
        if (!data.image) return toast.error("Please upload a profile image first.");

        registerMutation.mutate({
            data: {
                email: data.email,
                password: data.password,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                image: data.image as unknown as Blob
            }
        }, {
            onSuccess: () => {
                toast.success("Registration Successful!");
                navigate('/verify-otp', { state: { email: data.email } });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Registration failed.");
            }
        });
    };

    const signatureQuery = useCloudinaryControllerGetSignature(
        { folder: 'avatars' },
        { query: { enabled: false } }
    );

    const handleFileUpload = (file: File) => uploadToCloudinary(file, signatureQuery, setUploadedUrls);

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700">Create Account</h2>
                <p className="text-primary-500 mb-6 mt-2">Join the Student Welfare Platform</p>

                <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                    {/* Role Selection */}
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setValue('role', 'student')}
                            className={`flex-1 py-2 rounded-lg border font-medium transition-all ${role === 'student' ? 'bg-brand text-white border-brand' : 'bg-white text-primary-600 border-primary-200 cursor-pointer'
                                }`}
                        >
                            Student
                        </button>


                        <button
                            type="button"
                            onClick={() => setValue('role', 'hostelOwner')}
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
                                {...register('firstName')}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.firstName ? 'border-red-500' : 'border-primary-200'}`}
                            />
                            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-primary-600 mb-1">Last Name</label>
                            <input
                                {...register('lastName')}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.lastName ? 'border-red-500' : 'border-primary-200'}`}
                            />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Phone Number</label>
                        <input
                            {...register('phone')}
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.phone ? 'border-red-500' : 'border-primary-200'}`}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.email ? 'border-red-500' : 'border-primary-200'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.password ? 'border-red-500' : 'border-primary-200'}`}
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
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
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image.message}</p>}
                    </div>

                    {isUploading && <p className="text-xs text-brand animate-pulse">Uploading to Cloudinary...</p>}
                    {image && <p className="text-xs text-green-600 font-bold">✓ Image Ready</p>}

                    <button
                        type="submit"
                        disabled={registerMutation.isPending || isUploading}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {(registerMutation.isPending || isUploading) && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {registerMutation.isPending ? 'Creating Account...' : isUploading ? 'Uploading Image...' : 'Register'}
                    </button>

                    <p className="text-center text-sm text-primary-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>


                </form>

                {registerMutation.isError && (
                    <p className="mt-4 text-red-500 text-sm text-center">Registration failed. Try again.</p>
                )}
            </div>
        </div>
    );
};