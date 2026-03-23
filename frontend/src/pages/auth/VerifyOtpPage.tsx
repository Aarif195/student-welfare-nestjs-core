import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthControllerVerifyOTP } from '../../api/generated/authentication/authentication';

export const VerifyOtpPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    
    // 6 individual boxes state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyMutation = useAuthControllerVerifyOTP();

    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        verifyMutation.mutate({
            data: { email, otp_code: otpString } as any
        }, {
            onSuccess: () => {
                alert("Email Verified Successfully!");
                navigate('/login');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700">Verify Email</h2>
                <p className="text-primary-500 mb-6 text-sm">Sent to: <b>{email}</b></p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-12 text-center text-xl font-bold border border-primary-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={verifyMutation.isPending || otp.includes('')}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
                    >
                        {verifyMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
};