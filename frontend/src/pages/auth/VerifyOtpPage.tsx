import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthControllerVerifyOTP, useAuthControllerResendOTP } from '../../api/generated/authentication/authentication';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Validation Schema
const otpSchema = z.object({
    otp_code: z.string().length(6, 'OTP must be exactly 6 digits'),
    email: z.string().email(),
});

type OtpFormData = z.infer<typeof otpSchema>;

export const VerifyOtpPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    // 6 individual boxes state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 2. React Hook Form Setup
    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { email, otp_code: '' }
    });

    // Initialize resend & verify hook
    const verifyMutation = useAuthControllerVerifyOTP();
    const resendMutation = useAuthControllerResendOTP();

    // Sync individual boxes to react-hook-form
    useEffect(() => {
        setValue('otp_code', otp.join(''), { shouldValidate: true });
    }, [otp, setValue]);

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

    // handleVerify logic
    const onSubmit = (data: OtpFormData) => {
        verifyMutation.mutate({
            data: { email: data.email, otp_code: data.otp_code } as any
        }, {
            onSuccess: () => {
                alert("Email Verified Successfully!");
                navigate('/login');
            },
            onError: (error: any) => {
                alert(error.response?.data?.message || "Invalid OTP code.");
            }
        });
    };

    // handleResend logic
    const handleResend = () => {
        if (!email) return alert("Email is missing.");
        resendMutation.mutate({
            data: { email }
        }, {
            onSuccess: () => {
                alert("A new OTP code has been sent to your email.");
            },
            onError: (error: any) => {
                alert(error.response?.data?.message || "Failed to resend OTP.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700">Verify Email</h2>
                <p className="text-primary-500 mb-6 text-sm">Sent to: <b>{email}</b></p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col items-center">
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
                                    className={`w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.otp_code ? 'border-red-500' : 'border-primary-200'}`}
                                />
                            ))}
                        </div>
                        {errors.otp_code && <p className="text-xs text-red-500 mt-2">{errors.otp_code.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={verifyMutation.isPending || otp.includes('')}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        {verifyMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    {/* Resend Button UI */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendMutation.isPending}
                            className="text-brand font-medium hover:underline disabled:opacity-50 text-sm cursor-pointer"
                        >
                            {resendMutation.isPending ? 'Sending...' : "Didn't get a code? Resend"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};