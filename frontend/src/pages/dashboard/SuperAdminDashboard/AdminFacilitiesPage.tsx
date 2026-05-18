import React, { useState } from 'react';
import { useStudentControllerGetAvailableStudySpaces } from '../../../api/generated/student/student';
import { 
    useAdminControllerCreateStudySpace,
    useAdminControllerUpdateStudySpace,
    useAdminControllerDeleteStudySpace
} from '../../../api/generated/superadmin-dashboard/superadmin-dashboard';
import { 
    BookOpen, Plus, Edit3, Trash2, 
    MapPin, Users, Clock, 
    X, Loader2, Search,  
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const AdminFacilitiesPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal Management System
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSpace, setEditingSpace] = useState<any | null>(null);

    // Controlled Form State fields
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        total_capacity: 50,
        available_slots: 50,
        status: 'open' as 'open' | 'closed' | 'full',
        opening_time: '08:00',
        closing_time: '22:00'
    });

    const { data: spacesData, isLoading } = useStudentControllerGetAvailableStudySpaces();
    const { mutate: createSpace, isPending: isCreating } = useAdminControllerCreateStudySpace();
    const { mutate: updateSpace, isPending: isUpdating } = useAdminControllerUpdateStudySpace();
    const { mutate: deleteSpace, isPending: isDeleting } = useAdminControllerDeleteStudySpace();

    const spacesList = (spacesData as any)?.data?.data || [];

    const filteredSpaces = spacesList.filter((space: any) => 
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingSpace(null);
        setFormData({
            name: '',
            location: '',
            total_capacity: 50,
            available_slots: 50,
            status: 'open',
            opening_time: '08:00',
            closing_time: '22:00'
        });
        setIsFormOpen(true);
    };

    const openEditModal = (space: any) => {
        setEditingSpace(space);
        setFormData({
            name: space.name,
            location: space.location,
            total_capacity: space.total_capacity,
            available_slots: space.available_slots,
            status: space.status,
            opening_time: space.opening_time || '08:00',
            closing_time: space.closing_time || '22:00'
        });
        setIsFormOpen(true);
    };

    const handleStatusChange = (newStatus: 'open' | 'closed' | 'full') => {
        setFormData(prev => ({
            ...prev,
            status: newStatus,
            available_slots: newStatus === 'full' || newStatus === 'closed' ? 0 : prev.available_slots
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            total_capacity: Number(formData.total_capacity),
            available_slots: Number(formData.available_slots)
        };

        if (editingSpace) {
            updateSpace({ id: editingSpace.id, data: payload }, {
                onSuccess: () => {
                    toast.success("Study space updated successfully");
                    setIsFormOpen(false);
                    queryClient.invalidateQueries();
                },
                onError: (err: any) => toast.error(err?.response?.data?.message || "Update failed")
            });
        } else {
            createSpace({ data: payload }, {
                onSuccess: () => {
                    toast.success("Study space created successfully");
                    setIsFormOpen(false);
                    queryClient.invalidateQueries();
                },
                onError: (err: any) => toast.error(err?.response?.data?.message || "Creation failed")
            });
        }
    };

    // handleDelete
    const handleDelete = (id: number) => {
        if (!window.confirm("Are you sure you want to delete this study space resource?")) return;
        deleteSpace({ id }, {
            onSuccess: () => {
                toast.success("Study space deleted successfully");
                queryClient.invalidateQueries();
            },
            onError: (err: any) => toast.error(err?.response?.data?.message || "Deletion failed")
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-primary-800">Study Space Allocation</h1>
                    <p className="text-sm text-primary-500">Provision, modify operational schedules, and manage seating thresholds for student hubs.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary-900 text-primary-500 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary-900/10 w-full sm:w-auto justify-center"
                >
                    <Plus size={16} /> Provision Hub
                </button>
            </div>

            {/* Filter controls layer */}
            <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
                <input 
                    className="w-full bg-white border border-primary-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-primary-800 outline-none focus:ring-2 ring-primary-900/10 transition-all"
                    placeholder="Search resources by designation or sector..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Cards Presentation Engine */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-white animate-pulse rounded-4xl border border-primary-100" />
                    ))}
                </div>
            ) : filteredSpaces.length === 0 ? (
                <div className="bg-white border border-primary-100 rounded-4xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="bg-primary-50 text-primary-400 p-4 rounded-full w-fit mx-auto">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider">No Resources Registered</h3>
                    <p className="text-xs text-primary-500 leading-relaxed">No infrastructure spaces match your dynamic searching queries.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSpaces.map((space: any) => (
                        <div key={space.id} className="bg-white rounded-4xl border border-primary-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-0.5">
                                        <h3 className="font-bold text-primary-800 tracking-tight flex items-center gap-1.5 text-sm">
                                            <BookOpen size={15} className="text-primary-900 shrink-0" /> {space.name}
                                        </h3>
                                        <p className="text-xs text-primary-400 flex items-center gap-1 font-semibold">
                                            <MapPin size={12} /> {space.location}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                                        space.status === 'open' ? 'bg-green-50 text-green-600 border-green-100' :
                                        space.status === 'full' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {space.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs bg-primary-50/50 p-3 rounded-xl border border-primary-50">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-bold text-primary-400 uppercase block tracking-wide">Capacity Configuration</span>
                                        <p className="text-primary-800 font-bold flex items-center gap-1">
                                            <Users size={12} className="text-primary-400" /> {space.available_slots} / {space.total_capacity} Slots
                                        </p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-bold text-primary-400 uppercase block tracking-wide">Operating Hours</span>
                                        <p className=" text-primary-700 font-semibold flex items-center gap-1">
                                            <Clock size={12} className="text-primary-400" /> {space.opening_time} - {space.closing_time}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Deck Controls */}
                            <div className="flex gap-2 mt-5 pt-3 border-t border-primary-50/80">
                                <button
                                    onClick={() => handleDelete(space.id)}
                                    className="p-2.5 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                                    title="De-provision space"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button
                                    onClick={() => openEditModal(space)}
                                    className="flex-1 bg-primary-50 text-primary-800 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Edit3 size={13} /> Adjust Settings
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Creation / Editing Modal Overlay Context */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="p-5 border-b border-primary-50 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wider">
                                {editingSpace ? 'Modify Parameters' : 'Provision Facility Hub'}
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-primary-400 hover:bg-primary-50 p-1.5 rounded-full cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-primary-400">Designation Name</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none"
                                    placeholder="e.g. Govok Library"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-primary-400">Location / Sector Desk</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none"
                                    placeholder="e.g. Block D, Floor 15"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-primary-400">Total Capacity</label>
                                    <input 
                                        type="number" required min={0}
                                        className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none"
                                        value={formData.total_capacity}
                                        onChange={e => setFormData({...formData, total_capacity: Number(e.target.value)})}
                                        onBlur={() => {
                                            if (!editingSpace) setFormData(prev => ({ ...prev, available_slots: prev.total_capacity }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-primary-400">Available Slots</label>
                                    <input 
                                        type="number" required min={0}
                                        disabled={formData.status === 'full' || formData.status === 'closed'}
                                        className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none disabled:opacity-50"
                                        value={formData.available_slots}
                                        onChange={e => setFormData({...formData, available_slots: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-primary-400">Opening Hours</label>
                                    <input 
                                        type="text" required pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                                        className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none"
                                        placeholder="08:00"
                                        value={formData.opening_time}
                                        onChange={e => setFormData({...formData, opening_time: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-primary-400">Closing Hours</label>
                                    <input 
                                        type="text" required pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                                        className="w-full bg-primary-50 rounded-xl p-3 text-xs font-semibold text-primary-800 outline-none"
                                        placeholder="22:00"
                                        value={formData.closing_time}
                                        onChange={e => setFormData({...formData, closing_time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-primary-400">Operational Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['open', 'closed', 'full'] as const).map(statusOption => (
                                        <button
                                            key={statusOption}
                                            type="button"
                                            onClick={() => handleStatusChange(statusOption)}
                                            className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                                                formData.status === statusOption
                                                ? 'bg-blue-400 text-white border-primary-900 shadow-sm'
                                                : 'bg-white text-primary-500 border-primary-100 hover:bg-primary-50'
                                            }`}
                                        >
                                            {statusOption}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isCreating || isUpdating}
                                    className="flex-1 bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    {isCreating || isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Save Parameters'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};