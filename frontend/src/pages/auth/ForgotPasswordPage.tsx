import { useNavigate } from 'react-router-dom';
import { useAuthControllerForgotPassword } from '../../api/generated/authentication/authentication';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

// Validation Schema
const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const forgotPasswordMutation = useAuthControllerForgotPassword();

    // React Hook Form Setup
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        forgotPasswordMutation.mutate({
            data: { email: data.email }
        }, {
            onSuccess: () => {
                toast.success("Reset link sent! Please check your email.");
                navigate('/reset-password', { state: { email: data.email } });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Something went wrong.");
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand outline-none ${errors.email ? 'border-red-500' : 'border-primary-200'}`}
                            placeholder="name@student.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {forgotPasswordMutation.isPending && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="flex flex-col items-center mt-6 space-y-3">

                        <button
                            type="button"
                            onClick={() => navigate('/reset-password')}
                            className="text-primary-500 hover:text-brand text-sm font-medium cursor-pointer"
                        >
                            Already have a code? Reset Password
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-primary-500 hover:text-brand text-sm font-medium cursor-pointer"
                        >
                            Back to Login
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-primary-500 hover:text-brand text-sm font-medium cursor-pointer"
                        >
                            Back to Register
                        </button>

                    </div>


                </form>
            </div>
        </div>
    );
};