import React, { useState } from 'react';
import { useAuthControllerRegister } from '../../api/generated/authentication/authentication';

export const RegisterPage = () => {
    const [role, setRole] = useState<'student' | 'hostelOwner'>('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const registerMutation = useAuthControllerRegister();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Sending data exactly as your NestJS backend expects it
        registerMutation.mutate({
            data: { email, password, role, firstName, lastName, phone, image: image as unknown as Blob }
        });
    };


    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            // 1. Get signature from your backend (Update with your actual hook name)
            // const signatureData = await getSignatureMutation.mutateAsync(); 

            // 2. Upload to Cloudinary logic goes here...
            // const url = "https://cloudinary.com/..." 
            // setImage(url);
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
                            className={`flex-1 py-2 rounded-lg border font-medium transition-all ${role === 'student' ? 'bg-brand text-white border-brand' : 'bg-white text-primary-600 border-primary-200'
                                }`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('hostelOwner')}
                            className={`flex-1 py-2 rounded-lg border font-medium transition-all ${role === 'hostelOwner' ? 'bg-brand text-white border-brand' : 'bg-white text-primary-600 border-primary-200'
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

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
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