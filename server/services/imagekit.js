import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

let imagekit = null;

// Built lazily (on first upload) rather than at import time, so simply importing this module
// — e.g. via productRoutes.js in a test file — doesn't crash when IMAGEKIT_* env vars aren't
// configured (the ImageKit constructor throws immediately if publicKey is missing).
const getImagekit = () => {
    if (imagekit) return imagekit;

    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
    return imagekit;
};

const uploadImage = async (file) => {
    try {
        const result = await getImagekit().upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "products",
        });
        return result;
    } catch (error) {
        console.log(error);
    }
};


export { uploadImage };