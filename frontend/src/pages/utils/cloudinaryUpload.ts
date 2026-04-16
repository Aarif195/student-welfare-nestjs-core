import axios from 'axios';
import toast from 'react-hot-toast';

export const uploadToCloudinary = async (file: File, signatureQuery: any, setUploadedUrls: React.Dispatch<React.SetStateAction<string[]>>) => {
    try {
        const result = await signatureQuery.refetch();
        const signData = (result.data as any)?.data || result.data;
        if (!signData) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', String(signData.timestamp));
        formData.append('signature', signData.signature);
        formData.append('folder', signData.folder);

        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
            formData
        );

        setUploadedUrls(prev => [...prev, res.data.secure_url]);
        return res.data.secure_url;
    } catch (err) {
        toast.error("Upload failed");
        console.error(err);
    }
};