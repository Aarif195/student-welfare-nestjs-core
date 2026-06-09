import { useParams, useNavigate } from 'react-router-dom';
import { useHostelControllerDeleteHostel, useHostelControllerDeleteRoom, useHostelControllerGetOne, useHostelControllerGetRoomsByHostel } from '../../../api/generated/hostels/hostels';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Bed, MapPin, Edit, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';


export const HostelDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const hostelId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
    const [localRooms, setLocalRooms] = useState<any[]>([]);
    const [deleteHostelOpen, setDeleteHostelOpen] = useState(false);

    // Mutation Functions
    const deleteRoomMutation = useHostelControllerDeleteRoom();
    const deleteHostelMutation = useHostelControllerDeleteHostel();

    // Query Functions
    const { data: hostel, isLoading: hostelLoading } = useHostelControllerGetOne<{ data: any }>(hostelId);
    const { data: rooms, isLoading: roomsLoading } = useHostelControllerGetRoomsByHostel(hostelId);

    const hostelData = hostel?.data?.data;
    const roomsList = rooms?.data?.MyRooms;


    useEffect(() => {
        if (Array.isArray(roomsList)) {
            setLocalRooms(
                roomsList.map((room: any) => ({
                    ...room,
                    isAvailable: room.availability
                }))
            );
        }
    }, [roomsList]);

    if (hostelLoading || roomsLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }


    // handleDeleteRoom
    const handleDeleteRoom = (roomId: number) => {
        setDeleteRoomId(roomId);
    };

    // confirmDeleteRoom
    const confirmDeleteRoom = () => {
        if (deleteRoomId === null) return;

        deleteRoomMutation.mutate({
            hostelId: Number(id),
            roomId: deleteRoomId
        }, {
            onSuccess: () => {
                toast.success("Room deleted successfully");
                queryClient.invalidateQueries({ queryKey: ['hostelControllerGetRoomsByHostel', hostelId] });
                setLocalRooms(prev => prev.filter(room => room.id !== deleteRoomId));
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to delete room");
            },
            onSettled: () => {
                setDeleteRoomId(null);
            }
        });
    };

    // handleDeleteHostel
    const handleDeleteHostel = () => {
        setDeleteHostelOpen(true);
    };

    // confirmDeleteHostel
    const confirmDeleteHostel = () => {
        deleteHostelMutation.mutate(
            { id: Number(id) },
            {
                onSuccess: () => {
                    toast.success("Hostel deleted successfully");
                    navigate('/dashboard/owner/hostels');
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to delete hostel");
                },
                onSettled: () => {
                    setDeleteHostelOpen(false);
                }
            }
        );
    };


    return (
        <div className="space-y-6 sm:space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-primary-100 sm:border-none pb-4 sm:pb-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/owner/hostels')}
                        className="p-2 hover:bg-primary-100 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={22} className="text-primary-600" />
                    </button>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-primary-700 truncate max-w-[250px] sm:max-w-none">
                            {hostelData?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-primary-500 text-xs sm:text-sm mt-0.5">
                            <MapPin size={14} className="shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-none">{hostelData?.location}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Stacked on mobile, row on desktop */}
                <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto justify-start sm:justify-end">
                    {/* Edit Hostel */}
                    <button
                        onClick={() => navigate(`/dashboard/owner/hostels/${id}/edit`)}
                        className="text-xs sm:text-sm bg-brand text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer flex-1 sm:flex-none font-medium"
                    >
                        <Edit size={16} />
                        <span>Edit Hostel</span>
                    </button>

                    {/* Delete Hostel */}
                    <button
                        onClick={handleDeleteHostel}
                        disabled={deleteHostelMutation.isPending}
                        className="text-xs sm:text-sm flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 flex-1 sm:flex-none font-medium"
                    >
                        <Trash2 size={16} />
                        <span>{deleteHostelMutation.isPending ? 'Deleting...' : 'Delete'}</span>
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                
                {/* Left: Rooms List */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-bold text-primary-700">Rooms Management</h3>
                        <button
                            onClick={() => navigate(`/dashboard/owner/hostels/${id}/rooms/create`)}
                            className="text-xs sm:text-sm bg-brand text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                        >
                            <Plus size={16} />
                            <span>Add Room</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {localRooms.length === 0 ? (
                            <div className="bg-white border border-primary-200 rounded-xl p-8 text-center text-primary-500 text-sm">
                                No rooms added to this hostel yet.
                            </div>
                        ) : (
                            localRooms.map((room: any) => (
                                <div key={room.id} className="bg-white border border-primary-200 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                                    
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                        {/* Image/Icon mapping */}
                                        {(() => {
                                            const image = room.resources?.find(
                                                (r: any) => r.type === "IMAGE"
                                            );

                                            return image?.url ? (
                                                <img
                                                    src={image.url}
                                                    alt="room"
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0"
                                                />
                                            ) : (
                                                <div className="bg-primary-100 p-3 rounded-lg text-brand shrink-0 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16">
                                                    <Bed size={22} />
                                                </div>
                                            );
                                        })()}

                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-primary-700 text-sm sm:text-base truncate">
                                                Room {room.room_number}
                                            </p>
                                            <p className="text-xs text-primary-500 mt-0.5 truncate">
                                                {room.type} • {room.capacity} Students
                                            </p>
                                            
                                            {/* Action Icon buttons placed beneath textual details for touch optimization on mobile */}
                                            <div className="flex items-center gap-1 mt-1">
                                                <button
                                                    onClick={() => navigate(`/dashboard/owner/hostels/${id}/rooms/${room.id}/edit`)}
                                                    className="p-1.5 text-primary-400 hover:text-brand hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRoom(room.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Alignment: Status & Price */}
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-brand text-sm sm:text-base">₦{room.price.toLocaleString()}</p>
                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                                            room.isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {room.isAvailable ? 'Available' : 'Occupied'}
                                        </span>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Hostel Status Stats */}
                <div className="space-y-4 order-1 lg:order-2">
                    <h3 className="text-base sm:text-lg font-bold text-primary-700">Hostel Status</h3>
                    <div className="bg-white border border-primary-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-primary-500 text-xs sm:text-sm">Approval Status</span>
                            <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                                hostelData?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {hostelData?.status === 'APPROVED' ? 'Approved' : 'Pending Review'}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-primary-100">
                            <p className="text-[10px] text-primary-400 uppercase font-bold tracking-wider mb-1.5">Description</p>
                            <p className="text-xs sm:text-sm text-primary-600 leading-relaxed wrap-break-word">
                                {hostelData?.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <ConfirmModal
                open={deleteRoomId !== null}
                title="Delete Room"
                message="This action cannot be undone. Do you want to continue?"
                confirmText="Delete"
                onClose={() => setDeleteRoomId(null)}
                onConfirm={confirmDeleteRoom}
            />

            <ConfirmModal
                open={deleteHostelOpen}
                title="Delete Hostel"
                message="Deleting this hostel will remove all its rooms and data. This cannot be undone."
                confirmText="Delete"
                onClose={() => setDeleteHostelOpen(false)}
                onConfirm={confirmDeleteHostel}
            />
        </div>
    );
};