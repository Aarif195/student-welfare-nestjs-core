import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthControllerResetPassword } from '../../api/generated/authentication/authentication';

export const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const resetMutation = useAuthControllerResetPassword();

    const handleOtpChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        resetMutation.mutate({
            data: {
                email,
                otp_code: otp.join(''),
                newPassword
            }
        }, {
            onSuccess: () => {
                alert("Password reset successful! Please login.");
                navigate('/login');
            },
            onError: (error: any) => {
                alert(error.response?.data?.message || "Reset failed.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-4">Reset Password</h2>
                
                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>

                    <label className="block text-sm font-medium text-primary-700 mb-1">6-Digit Code</label>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                className="w-12 h-12 text-center text-xl font-bold border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                            />
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={resetMutation.isPending || otp.includes('')}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
                    >
                        {resetMutation.isPending ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};