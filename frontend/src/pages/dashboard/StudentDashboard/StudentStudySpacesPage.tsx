import  { useState } from 'react';
import { useStudentControllerGetAvailableStudySpaces } from '../../../api/generated/student/student';
import { BookOpen, MapPin, Clock, Users, Circle, Calendar } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal'; 

export const StudentStudySpacesPage = () => {
    const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
    const { data, isLoading } = useStudentControllerGetAvailableStudySpaces({
        page: 1,
        limit: 10
    });

    const spaces = (data?.data as any)?.studySpaces || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-primary-800">Study Spaces</h1>
                <p className="text-sm text-primary-500">View available campus study locations.</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-primary-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spaces.map((space: any) => (
                        <div key={space.id} className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-brand">
                                    <BookOpen size={20} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md flex items-center gap-1 ${
                                    space.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    <Circle size={8} className="fill-current" />
                                    {space.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-primary-800 mb-1">{space.name}</h3>
                            <p className="text-xs text-primary-500 flex items-center gap-1">
                                <MapPin size={14} /> {space.location}
                            </p>

                            <button 
                                onClick={() => setSelectedSpace(space)}
                                className="w-full mt-4 py-2 bg-primary-50 text-primary-700 hover:bg-brand hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                View Availability
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedSpace} 
                onClose={() => setSelectedSpace(null)} 
                title="Study Space Details"
            >
                {selectedSpace && (
                    <div className="space-y-4">
                        <div className="bg-primary-50 p-4 rounded-xl">
                            <h4 className="font-bold text-primary-800 text-lg">{selectedSpace.name}</h4>
                            <p className="text-sm text-primary-500 flex items-center gap-1 mt-1">
                                <MapPin size={16} /> {selectedSpace.location}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-primary-100 rounded-xl">
                                <p className="text-[10px] uppercase text-primary-400 font-bold mb-1 flex items-center gap-1">
                                    <Clock size={12}/> Hours
                                </p>
                                <p className="text-sm font-bold text-primary-700">
                                    {selectedSpace.opening_time} - {selectedSpace.closing_time}
                                </p>
                            </div>
                            <div className="p-3 border border-primary-100 rounded-xl">
                                <p className="text-[10px] uppercase text-primary-400 font-bold mb-1 flex items-center gap-1">
                                    <Users size={12}/> Capacity
                                </p>
                                <p className="text-sm font-bold text-primary-700">
                                    {selectedSpace.available_slots} / {selectedSpace.total_capacity} Slots
                                </p>
                            </div>
                        </div>

                        <div className="p-3 border border-primary-100 rounded-xl flex items-center gap-3">
                            <Calendar size={18} className="text-primary-400" />
                            <div>
                                <p className="text-[10px] uppercase text-primary-400 font-bold">Status</p>
                                <p className={`text-sm font-bold capitalize ${selectedSpace.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                                    Currently {selectedSpace.status}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedSpace(null)}
                            className="w-full py-3 bg-primary-800 text-white rounded-xl font-bold text-sm hover:bg-primary-900 transition-colors cursor-pointer"
                        >
                            Close Details
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};