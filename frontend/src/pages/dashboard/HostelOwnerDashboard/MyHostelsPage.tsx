import { useNavigate } from 'react-router-dom';
import { useHostelControllerGetMyHostels } from '../../../api/generated/hostels/hostels';
import { Plus, Building2, MapPin, Bed } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreateHostelResourceDtoFileType } from '../../../api/model';


export const MyHostelsPage = () => {
    const navigate = useNavigate();

    const { data: hostels, isLoading, error } = useHostelControllerGetMyHostels();

    if (error) {
        toast.error("Failed to load hostels");
    }

    const hostelsArray = (hostels?.data?.data as any[]) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primary-700">My Hostels</h2>
                    <p className="text-primary-500 text-sm">Manage your properties and room availability</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/owner/hostels/create')}
                    className="bg-brand text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    <Plus size={20} />
                    Add New Hostel
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : hostelsArray.length === 0 ? (
                <div className="bg-white border border-dashed border-primary-300 rounded-xl p-12 text-center">
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-primary-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-primary-700">No hostels found</h3>
                    <p className="text-primary-500 mb-6">Start by adding your first hostel property.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {Array.isArray(hostels?.data?.data) && hostels.data.data.map((hostel) => {
                        return (
                            <div
                                key={hostel.id}
                                onClick={() => navigate(`/dashboard/owner/hostels/${hostel.id}`)}
                                className="bg-white border border-primary-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            >
                                {/* Image Section */}
                                <div className="h-40 bg-primary-200 relative">
                                    {(() => {
                                        const imageResource = hostel.resources?.find(
                                            (r: { file_url: string; file_type: string }) => r.file_type === CreateHostelResourceDtoFileType.IMAGE
                                        );
                                        if (imageResource?.file_url) {
                                            return <img src={imageResource.file_url} alt={hostel.name} className="w-full h-full object-cover" />;
                                        }
                                        return (
                                            <div className="w-full h-full flex items-center justify-center text-primary-400">
                                                <Building2 size={48} />
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-bold text-primary-700 truncate">{hostel.name}</h3>
                                    <div className="flex items-center gap-2 text-primary-500 text-sm">
                                        <MapPin size={16} />
                                        <span className="truncate">{hostel.location}</span>
                                    </div>
                                    <div className="pt-3 border-t border-primary-100 flex justify-between items-center text-primary-600 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Bed size={16} />
                                            <span>{hostel._count.rooms || 0} Rooms</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hostel.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {hostel.status === 'APPROVED' ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};