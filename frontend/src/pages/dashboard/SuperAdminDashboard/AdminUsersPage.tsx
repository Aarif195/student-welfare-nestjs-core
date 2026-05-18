import { useState } from 'react';
import { 
    useAdminControllerGetAllOwners,
    useAdminControllerGetAllStudents
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import { 
    Users, UserCheck, Shield, Search, 
    Mail, Calendar, Hash
} from 'lucide-react';

export const AdminUsersPage = () => {
    const [activeTab, setActiveTab] = useState<'STUDENTS' | 'OWNERS'>('STUDENTS');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: ownersData, isLoading: isLoadingOwners } = useAdminControllerGetAllOwners({ page: 1, limit: 50 });
    const { data: studentsData, isLoading: isLoadingStudents } = useAdminControllerGetAllStudents({ page: 1, limit: 50 });

    const isLoading = activeTab === 'STUDENTS' ? isLoadingStudents : isLoadingOwners;

    const currentList = activeTab === 'STUDENTS' 
        ? ((studentsData as any)?.data?.students || [])
        : ((ownersData as any)?.data?.HostelOwners || []);

    const filteredUsers = currentList.filter((user: any) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-xl font-bold text-primary-800">User Registry Control</h1>
                <p className="text-sm text-primary-500">Audit system accounts, monitoring registration timelines for students and platform landlords.</p>
            </div>

            {/* Segment Controls & Filtering */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex bg-primary-100/50 p-1 rounded-2xl border border-primary-100/40 w-full sm:w-auto">
                    <button
                        onClick={() => { setActiveTab('STUDENTS'); setSearchTerm(''); }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'STUDENTS'
                            ? 'bg-primary-900 text-white shadow-md'
                            : 'text-primary-500 hover:text-primary-800'
                        }`}
                    >
                        <UserCheck size={14} /> Students
                    </button>
                    <button
                        onClick={() => { setActiveTab('OWNERS'); setSearchTerm(''); }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'OWNERS'
                            ? 'bg-primary-900 text-white shadow-md'
                            : 'text-primary-500 hover:text-primary-800'
                        }`}
                    >
                        <Shield size={14} /> Hostel Owners
                    </button>
                </div>

                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                    <input 
                        className="w-full bg-white border border-primary-100 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Presentation Workspace Layer */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-36 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <Users size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">No Accounts Matched</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No registered entries match your active searching parameters inside this sector.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredUsers.map((user: any) => (
                        <div key={user.id} className="bg-white rounded-2xl border border-primary-100 p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-0.5">
                                        <h3 className="font-bold text-primary-800 text-sm tracking-tight truncate max-w-[180px]">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                                            <Hash size={10} /> Account ID: {user.id}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                                        activeTab === 'STUDENTS'
                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                        : 'bg-purple-50 text-purple-600 border-purple-100'
                                    }`}>
                                        {activeTab === 'STUDENTS' ? 'Student' : 'Owner'}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <p className="text-primary-600 font-medium flex items-center gap-2 bg-primary-50/50 px-3 py-1.5 rounded-xl border border-primary-50/60 truncate">
                                        <Mail size={13} className="text-primary-400 shrink-0" /> {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-primary-50/80 pt-3 flex items-center justify-between text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} className="text-primary-300" /> Joined Platform:
                                </span>
                                <span className="text-primary-700 font-extrabold">{formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};