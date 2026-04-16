import { useParams, useNavigate } from 'react-router-dom';
import { useHostelControllerDeleteRoom, useHostelControllerGetOne, useHostelControllerGetRoomsByHostel } from '../../../api/generated/hostels/hostels';
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

    const deleteRoomMutation = useHostelControllerDeleteRoom();

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



    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/owner/hostels')}
                    className="p-2 hover:bg-primary-100 rounded-full transition-colors cursor-pointer"
                >
                    <ArrowLeft size={24} className="text-primary-600" />
                </button>

                <div className='flex items-center justify-between w-full gap-4'>

                    <div>
                        <h2 className="text-2xl font-bold text-primary-700">{hostelData?.name}</h2>
                        <div className="flex items-center gap-2 text-primary-500 text-sm">
                            <MapPin size={14} />
                            <span>{hostelData?.location}</span>
                        </div>
                    </div>

                    <div className=''>
                        <button
                            onClick={() => navigate(`/dashboard/owner/hostels/${id}/edit`)}
                            className="text-sm bg-brand text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            <Edit size={16} />
                            Edit Hostel
                        </button>
                    </div>

                    {/* de */}


                </div>


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Rooms List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-primary-700">Rooms Management</h3>
                        <button
                            onClick={() => navigate(`/dashboard/owner/hostels/${id}/rooms/create`)}
                            className="text-sm bg-brand text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Room
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {localRooms.length === 0 ? (
                            <div className="bg-white border border-primary-200 rounded-xl p-8 text-center text-primary-500">
                                No rooms added to this hostel yet.
                            </div>
                        ) : (
                            localRooms.map((room: any) =>
                            (
                                <div key={room.id} className="bg-white border border-primary-200 p-4 rounded-xl flex justify-between items-center">
                                    {/* image mapping */}

                                    <div className="flex items-center gap-4">
                                        {(() => {
                                            const image = room.resources?.find(
                                                (r: any) => r.type === "IMAGE"
                                            );

                                            return image?.url ? (
                                                <img
                                                    src={image.url}
                                                    alt="room"
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="bg-primary-100 p-3 rounded-lg text-brand">
                                                    <Bed size={24} />
                                                </div>
                                            );
                                        })()}

                                        <div>
                                            <p className="font-bold text-primary-700">Room {room.room_number}</p>
                                            <p className="text-sm text-primary-500">
                                                {room.type} • {room.capacity} Students
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/owner/hostels/${id}/rooms/${room.id}/edit`)}
                                                className="p-2 text-primary-400 hover:text-brand hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Edit3 size={18} className='cursor-pointer' />
                                            </button>
                                        </div>

                                        {/* delete */}
                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} className='cursor-pointer' />
                                            </button>
                                        </div>


                                    </div>


                                    <div className="text-right">
                                        <p className="font-bold text-brand">₦{room.price.toLocaleString()}</p>
                                        <p className={`text-xs font-medium ${room.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                            {room.isAvailable ? 'Available' : 'Occupied'}
                                        </p>
                                    </div>



                                </div>
                            ))
                        )}
                    </div>

                </div>

                {/* Right: Hostel Status Stats */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-primary-700">Hostel Status</h3>
                    <div className="bg-white border border-primary-200 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-primary-500 text-sm">Approval Status</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${hostelData?.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {hostelData?.isApproved ? 'Approved' : 'Pending Review'}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-primary-100">
                            <p className="text-xs text-primary-400 uppercase font-bold tracking-wider mb-2">Description</p>
                            <p className="text-sm text-primary-600 leading-relaxed">
                                {hostelData?.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={deleteRoomId !== null}
                title="Delete Room"
                message="This action cannot be undone. Do you want to continue?"
                confirmText="Delete"
                onClose={() => setDeleteRoomId(null)}
                onConfirm={confirmDeleteRoom}
            />

        </div>
    );
};