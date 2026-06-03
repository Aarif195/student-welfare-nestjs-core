import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuthControllerGoogleLogin, useAuthControllerLogin } from '../../api/generated/authentication/authentication';

import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAdminControllerLogin } from '../../api/generated/superadmin-dashboard/superadmin-dashboard';

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
    const adminMutation = useAdminControllerLogin();
    const googleLoginMutation = useAuthControllerGoogleLogin();


    // React Hook Form Setup
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    // onLoginSubmit: handle both login and admin login
    const onLoginSubmit = (data: LoginFormData) => {
        const normalizedEmail = data.email.toLowerCase().trim();
        const isAdminAccount = normalizedEmail.includes('admin');

        const targetedMutation = isAdminAccount ? adminMutation : loginMutation;

        targetedMutation.mutate({
            data: { email: data.email, password: data.password }
        }, {
            onSuccess: (response: any) => {
                const apiResponse = response.data;
                login(apiResponse);
                
                const role = apiResponse.user?.role || apiResponse.admin?.role;
                if (role === 'superadmin') {
                    navigate('/dashboard/admin');
                } else if (role === 'hostelOwner') {
                    navigate('/dashboard/owner');
                } else {
                    navigate('/dashboard/student');
                }
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Invalid credentials");
            }
        });
    };

    // handleGoogleSuccess
    const handleGoogleSuccess = (credentialResponse: any) => {
        googleLoginMutation.mutate({
            data: {
                idToken: credentialResponse.credential,
            }
        }, {
            onSuccess: (res: any) => {
                const data = res?.data ?? res;

                const user = data?.user;
                const token = data?.token;

                if (!user || !token) {
                    toast.error("Invalid login response");
                    return;
                }

                login({ user, token });

                const userRole = user.role;

                if (userRole === 'superadmin') navigate('/dashboard/admin');
                else if (userRole === 'hostelOwner') navigate('/dashboard/owner');
                else navigate('/dashboard/student');
            },
            onError: () => toast.error("Google login failed")
        });
    };

    const isLoading = loginMutation.isPending || adminMutation.isPending || googleLoginMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Login</h2>

                {<GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google login failed")}
                />}

                <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-primary-100 w-full"></div>
                    <span className="bg-white px-3 text-xs text-primary-400 absolute">OR</span>
                </div>

                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand ${errors.email ? 'border-red-500' : 'border-primary-200'}`}
                            placeholder="yomoyeh345@nyspring.com"
                        // value="admin@hostel.com"
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
                        // value="Admin@123"
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {isLoading ? 'Logging in...' : 'Login'}
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