import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStudentControllerBookRoom } from '../../../api/generated/student/student';
import { CheckCircle2, Loader2, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasCalled = useRef(false);
    
    const reference = searchParams.get('reference');
    const { mutate: finalizeBooking, isPending } = useStudentControllerBookRoom();

    useEffect(() => {
        if (reference && !hasCalled.current) {
            hasCalled.current = true;
            
            finalizeBooking({
                data: {
                    reference: reference,
                    room_id: 0 
                } as any
            }, {
                onSuccess: () => {
                    toast.success("Room booked successfully!");
                },
                onError: (err: any) => {
                    toast.error("Payment verified but booking failed. Please contact support.");
                }
            });
        }
    }, [reference, finalizeBooking]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-primary-100">
                {isPending ? (
                    <>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="text-brand animate-spin" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-primary-800 mb-2">Verifying Payment</h2>
                        <p className="text-primary-500">Please wait while we confirm your booking...</p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-primary-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-primary-500 mb-8 text-sm">
                            Your payment was successful and your room has been allocated.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-primary-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-900 transition-colors"
                        >
                            <Home size={18} /> Back to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};