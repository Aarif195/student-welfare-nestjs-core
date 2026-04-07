import { useNavigate, Link } from 'react-router-dom';
import { useAuthControllerLogin } from '../../api/generated/authentication/authentication';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

// Validation Schema
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const loginMutation = useAuthControllerLogin();

    // React Hook Form Setup
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onLoginSubmit = (data: LoginFormData) => {
        loginMutation.mutate({
            data: { email: data.email, password: data.password }
        }, {
            onSuccess: (response: any) => {
                // Save to context and localStorage
                login(response.data);

                const role = response.data.user?.role || response.data.admin?.role;

                // Role-based redirection
                if (role === 'student') {
                    navigate('/dashboard/student');
                } else if (role === 'hostel_owner') {
                    navigate('/dashboard/owner');
                } else if (role === 'superadmin') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/'); // Fallback
                }
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Invalid credentials");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Login</h2>

                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.email ? 'border-red-500' : 'border-primary-200'}`}
                            placeholder="yomoyeh345@nyspring.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm font-medium text-primary-700">Password</label>
                            <Link to="/forgot-password" className="text-xs text-brand hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            {...register('password')}
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.password ? 'border-red-500' : 'border-primary-200'}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loginMutation.isPending && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {loginMutation.isPending ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="text-center text-sm text-primary-500 mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand font-medium hover:underline">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};