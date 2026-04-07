import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthControllerResetPassword } from '../../api/generated/authentication/authentication';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validation Schema
const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp_code: z.string().length(6, 'OTP must be exactly 6 digits'),
    newPassword: z.string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Include an uppercase letter')
        .regex(/[a-z]/, 'Include a lowercase letter')
        .regex(/[0-9]/, 'Include a number')
        .regex(/[^A-Za-z0-9]/, 'Include a special character'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const resetMutation = useAuthControllerResetPassword();

    // React Hook Form Setup
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: location.state?.email || '',
            otp_code: '',
            newPassword: ''
        }
    });

    // Sync OTP state to React Hook Form
    useEffect(() => {
        setValue('otp_code', otp.join(''), { shouldValidate: true });
    }, [otp, setValue]);

    const handleOtpChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const onResetSubmit = (data: ResetPasswordFormData) => {
        resetMutation.mutate({
            data: {
                email: data.email,
                otp_code: data.otp_code,
                newPassword: data.newPassword
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

                <form onSubmit={handleSubmit(onResetSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.email ? 'border-red-500' : 'border-primary-200'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
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
                                    className={`w-12 h-12 text-center text-xl font-bold border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.otp_code ? 'border-red-500' : 'border-primary-200'}`}
                                />
                            ))}
                        </div>
                        {errors.otp_code && <p className="text-xs text-red-500 mt-2">{errors.otp_code.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">New Password</label>
                        <input
                            type="password"
                            {...register('newPassword')}
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.newPassword ? 'border-red-500' : 'border-primary-200'}`}
                        />
                        {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={resetMutation.isPending || otp.includes('')}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        {resetMutation.isPending ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};