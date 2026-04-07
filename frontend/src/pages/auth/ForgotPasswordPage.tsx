import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthControllerForgotPassword } from '../../api/generated/authentication/authentication';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const forgotPasswordMutation = useAuthControllerForgotPassword();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        forgotPasswordMutation.mutate({
            data: { email }
        }, {
            onSuccess: () => {
                alert("Reset link sent! Please check your email.");
                navigate('/login');
            },
            onError: (error: any) => {
                alert(error.response?.data?.message || "Something went wrong.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-2">Forgot Password?</h2>
                <p className="text-primary-500 mb-6 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            placeholder="name@student.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
                    >
                        {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-primary-500 hover:text-brand text-sm font-medium"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};