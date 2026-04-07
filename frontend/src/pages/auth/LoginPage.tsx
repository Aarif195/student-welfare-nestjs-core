import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthControllerLogin } from '../../api/generated/authentication/authentication';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const loginMutation = useAuthControllerLogin();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({
            data: { email, password }
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
                alert(error.response?.data?.message || "Invalid credentials");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-primary-200">
                <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Login</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                            placeholder="yomoyeh345@nyspring.com
"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm font-medium text-primary-700">Password</label>
                            <Link to="/forgot-password"  className="text-xs text-brand hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full bg-brand hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
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