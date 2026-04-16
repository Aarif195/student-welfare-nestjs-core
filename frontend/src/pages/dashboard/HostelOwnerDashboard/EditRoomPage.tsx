import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useHostelControllerGetSingleRoom,
    useHostelControllerUpdateRoom
} from '../../../api/generated/hostels/hostels';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditRoomPage = () => {
    const { id: hostelId, roomId } = useParams<{ id: string, roomId: string }>();
    const navigate = useNavigate();

    const { data: room, isLoading } = useHostelControllerGetSingleRoom(Number(hostelId), Number(roomId));
    const updateMutation = useHostelControllerUpdateRoom();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (room?.data) {
            reset({
                room_number: room.data.room_number,
                capacity: room.data.capacity,
                price: room.data.price,
                availability: room.data.availability
            });
        }
    }, [room, reset]);

    const onSubmit = (data: any) => {
        updateMutation.mutate({
            hostelId: Number(hostelId),
            roomId: Number(roomId),
            data: {
                room_number: data.room_number,
                capacity: Number(data.capacity),
                price: Number(data.price),
                availability: Boolean(data.availability)
            }
        }, {
            onSuccess: () => {
                toast.success("Room updated successfully!");
                navigate(`/dashboard/owner/hostels/${hostelId}`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to update room");
            }
        });
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Room Data...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500">
                <ArrowLeft size={20} /> Back
            </button>

            <div className="bg-white border border-primary-200 rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-primary-700 mb-6">
                    Edit Room {(room?.data as any)?.room_number || ''}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-primary-600">Room Number</label>
                        <input
                            {...register('room_number')}
                            className="w-full p-2.5 border border-primary-200 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-semibold text-primary-600">Capacity</label>
                            <input
                                type="number"
                                {...register('capacity')}
                                className="w-full p-2.5 border border-primary-200 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-primary-600">Price</label>
                            <input
                                type="number"
                                {...register('price')}
                                className="w-full p-2.5 border border-primary-200 rounded-lg outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...register('availability')} id="avail" className="w-4 h-4" />
                        <label htmlFor="avail" className="text-sm text-primary-700">Available</label>
                    </div>

                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full bg-brand text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {updateMutation.isPending ? 'Saving...' : 'Update Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};