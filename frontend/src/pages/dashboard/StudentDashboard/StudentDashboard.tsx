import { useEffect, useState } from 'react';
import { useStudentControllerGetAvailableHostels, useStudentControllerGetAvailableRooms } from '../../../api/generated/student/student';
import { usePaymentControllerCreateIntent } from '../../../api/generated/payment/payment';
import {
    Search, MapPin, Building2,
    ArrowLeft, BedDouble, Users, CreditCard, Loader2
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { toast } from 'react-hot-toast';

export const StudentDiscoveryPage = () => {
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [, setDebouncedSearch] = useState("");

    // Booking State
    const [bookingRoom, setBookingRoom] = useState<any | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: hostelData, isLoading: loadingHostels } = useStudentControllerGetAvailableHostels(
        { page: 1, limit: 10, search: searchQuery || "" },
        { query: { enabled: true } }
    );

    const { data: roomData, isLoading: loadingRooms } = useStudentControllerGetAvailableRooms(
        { hostel_id: selectedHostelId || undefined },
        { query: { enabled: !!selectedHostelId } }
    );

    const { mutate: initPayment, isPending: isInitializing } = usePaymentControllerCreateIntent();

    const hostels = (hostelData as any)?.data?.AvailableHostels || [];
    const availableRooms = (roomData as any)?.data?.AvailableRooms || [];

    const handleInitiatePayment = () => {
        if (!bookingRoom) return;

        initPayment({
            data: {
                amount: bookingRoom.price,
                // Passing room_id in metadata so we know what room was paid for on the callback
                metadata: {
                    room_id: bookingRoom.id
                }
            } as any
        }, {
            onSuccess: (res: any) => {
                const { authorization_url } = res.data.data;
                window.location.href = authorization_url;
            },
            onError: () => {
                toast.error("Could not initialize payment. Please try again.");
            }
        });
    };

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
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setSearchQuery(search.trim());
                                        setSearch(""); 
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-4 sm:p-8">
                    <h1 className="text-xl font-bold text-primary-800 mb-6">Available Hostels</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingHostels && <div className="flex justify-center py-20 animate-pulse text-primary-400">Loading available hostels...</div>}
                        {!loadingHostels && hostels.length === 0 && <div className="flex justify-center py-20 text-primary-400">No available hostels found.</div>}

                        {hostels.map((hostel: any) => (
                            <div key={hostel.id} className="bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="h-44 bg-primary-200">
                                    {(() => {
                                        const imageResource = hostel.resources?.find((r: any) => r.file_type === 'IMAGE');
                                        return imageResource?.file_url ? (
                                            <img src={imageResource.file_url} className="w-full h-full object-cover" alt={hostel.name} />
                                        ) : (
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
                                        className="w-full mt-4 bg-brand text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
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

    return (
        <div className="min-h-screen bg-primary-50/50 pb-20">
            <div className="bg-white border-b border-primary-100 p-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => setSelectedHostelId(null)} className="p-2 hover:bg-primary-50 rounded-full transition-colors cursor-pointer">
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
                        {!loadingRooms && availableRooms.length === 0 && (
                            <div className="text-center py-10 text-primary-400">No rooms available for this hostel</div>
                        )}

                        {availableRooms.map((room: any) => (
                            <div key={room.id} className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-col sm:flex-row gap-4 hover:border-brand transition-all cursor-pointer group">
                                <div className="w-full sm:w-32 h-32 bg-primary-100 rounded-xl overflow-hidden shrink-0">
                                    {(() => {
                                        const image = room.resources?.find((r: any) => r.type === 'IMAGE');
                                        return image?.url ? (
                                            <img src={image.url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BedDouble className="text-primary-300" />
                                            </div>
                                        );
                                    })()}
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
                                    <button 
                                        onClick={() => setBookingRoom(room)}
                                        className="w-full mt-4 sm:mt-0 bg-primary-800 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider group-hover:bg-brand transition-colors cursor-pointer"
                                    >
                                        Select & Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={!!bookingRoom} onClose={() => setBookingRoom(null)} title="Confirm Room Booking">
                {bookingRoom && (
                    <div className="space-y-6">
                        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <p className="text-[10px] uppercase font-bold text-primary-400 mb-1">Selected Unit</p>
                            <h4 className="font-bold text-primary-800 text-lg">Room {bookingRoom.room_number}</h4>
                            <div className="flex items-center gap-2 mt-2 text-xs text-primary-600">
                                <Users size={14}/> {bookingRoom.capacity} Students Capacity
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-500">Rent Amount</span>
                                <span className="font-bold text-primary-800">₦{bookingRoom.price.toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-dashed border-primary-200 flex justify-between items-center">
                                <span className="font-bold text-primary-800 text-base">Total to Pay</span>
                                <span className="text-xl font-extrabold text-brand">₦{bookingRoom.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                            <CreditCard className="text-brand shrink-0 mt-0.5" size={16} />
                            <p className="text-[10px] text-primary-600 leading-relaxed font-medium">
                                Secure payment via Paystack. Your allocation will be processed immediately after successful transaction.
                            </p>
                        </div>

                        <button 
                            onClick={handleInitiatePayment}
                            disabled={isInitializing}
                            className="w-full py-4 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-70 cursor-pointer"
                        >
                            {isInitializing ? <Loader2 className="animate-spin" size={20} /> : "Proceed to Payment"}
                        </button>
                    </div>
                )}
            </Modal>


        </div>
    );
};