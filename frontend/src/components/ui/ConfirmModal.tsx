import { X } from "lucide-react";

type Props = {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
};

export const ConfirmModal = ({
    open,
    title = "Confirm Action",
    message = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onClose,
}: Props) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-md space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg">{title}</h2>
                    <button onClick={onClose} className="cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-gray-600">{message}</p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};