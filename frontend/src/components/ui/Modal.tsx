import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-primary-50">
                    <h2 className="font-bold text-primary-800">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-primary-50 rounded-lg transition-colors">
                        <X size={20} className="text-primary-400" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};