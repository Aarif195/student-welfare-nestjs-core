import { useState } from 'react';
import { useStudentControllerGetAvailableHostels, useStudentControllerGetAvailableRooms } from '../../../api/generated/student/student';
import {
    Search, SlidersHorizontal, MapPin, Building2,
    Star, Info, ArrowLeft, BedDouble, Users
} from 'lucide-react';

export const StudentDiscoveryPage = () => {
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    //  Fetch Hostels
    const { data: hostelData, isLoading: loadingHostels } = useStudentControllerGetAvailableHostels({
        page: 1,
        limit: 10
    });

    //  Fetch Rooms (Only runs when a hostel is selected)
    const { data: roomData, isLoading: loadingRooms } = useStudentControllerGetAvailableRooms(
        { hostel_id: selectedHostelId || undefined },
        { query: { enabled: !!selectedHostelId } }
    );


    // console.log("FULL hostelData:", hostelData);

    const hostels = (hostelData as any)?.data?.AvailableHostels || [];
    console.log(hostels);

    const availableRooms = (roomData as any)?.AvailableRooms || [];

    //  HOSTEL LIST 
    if (!selectedHostelId) {
        return (
            <div className="min-h-screen bg-primary-50/50 pb-20">
                <div className="sticky top-0 z-20 bg-white border-b border-primary-100 p-4">
                    <div className="max-w-7xl mx-auto flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search hostels..."
                                className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border-none rounded-xl text-sm outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-yellow-600">
                    <h1 className="text-xl font-bold text-primary-800 mb-6">Available Hostels</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {loadingHostels && <div className="flex justify-center py-20 animate-pulse text-primary-400">Loading available hostels...</div>}
                        {!loadingHostels && hostels.length === 0 && <div className="flex justify-center py-20 text-primary-400">No available hostels found.</div>}


                        {hostels.map((hostel: any) => (
                            <div key={hostel.id} className="bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="h-44 bg-primary-200">


                                    {(() => {
                                        const imageResource = hostel.resources?.find(
                                            (r: any) => r.file_type === 'IMAGE'
                                        );

                                        if (imageResource?.file_url) {
                                            return (
                                                <img
                                                    src={imageResource.file_url}
                                                    className="w-full h-full object-cover"
                                                    alt={hostel.name}
                                                />
                                            );
                                        }

                                        return (
                                            <div className="w-full h-full flex items-center justify-center text-primary-400">
                                                <Building2 size={48} />
                                            </div>
                                        );
                                    })()}


                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-primary-800">{hostel.name}</h3>
                                    <p className="text-xs text-primary-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {hostel.location}</p>
                                    <button
                                        onClick={() => setSelectedHostelId(hostel.id)}
                                        className="w-full mt-4 bg-brand text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        View Rooms
                                    </button>
                                </div>
                            </div>
                        ))}



                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: ROOM SELECTION ---
    return (
        <div className="min-h-screen bg-primary-50/50 pb-20">
            <div className="bg-white border-b border-primary-100 p-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => setSelectedHostelId(null)} className="p-2 hover:bg-primary-50 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-primary-600" />
                    </button>
                    <h1 className="font-bold text-primary-800">Select a Room</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-8">
                {loadingRooms ? (
                    <div className="flex justify-center py-20 animate-pulse text-primary-400">Loading available rooms...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableRooms.map((room: any) => (
                            <div key={room.id} className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-col sm:flex-row gap-4 hover:border-brand transition-all cursor-pointer group">
                                <div className="w-full sm:w-32 h-32 bg-primary-100 rounded-xl overflow-hidden shrink-0">
                                    {room.images?.[0] ? (
                                        <img src={room.images[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BedDouble className="text-primary-300" /></div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-primary-800">Room {room.room_number}</h3>
                                            <span className="text-brand font-bold text-sm">₦{room.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-md">
                                                <Users size={10} /> {room.capacity} Students
                                            </span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 sm:mt-0 bg-primary-800 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider group-hover:bg-brand transition-colors">
                                        Select & Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};