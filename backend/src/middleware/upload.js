import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatterbox/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload an image file', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default upload;

/*
===============================================================================
UPLOADMIDDLEWARE.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file configures Multer to handle image uploads for the application.

Instead of storing uploaded files on the local server, uploaded images are
automatically sent to Cloudinary, where they are stored and optimized.

The exported "upload" middleware can be used in Express routes that accept
image uploads, such as user avatar uploads.

===============================================================================
1. CLOUDINARY STORAGE CONFIGURATION
===============================================================================

A CloudinaryStorage instance is created and passed to Multer.

Configuration includes:

• Storage provider:
      Cloudinary

• Upload folder:
      chatterbox/avatars

• Allowed image formats:
      - jpg
      - jpeg
      - png
      - webp

• Automatic image transformation:
      Width  : 300 px
      Height : 300 px
      Crop   : fill

This ensures every uploaded avatar has a consistent size before being stored.

===============================================================================
2. FILE FILTERING
===============================================================================

The fileFilter() function validates every uploaded file before it is accepted.

Validation process:

• If the uploaded file is an image
      (file.mimetype starts with "image/")

      → Accept the file.

• Otherwise

      → Reject the upload.
      → Return an AppError with status code 400.

This prevents users from uploading unsupported file types such as:

• PDF files
• ZIP archives
• Videos
• Executable files
• Text documents

===============================================================================
3. MULTER CONFIGURATION
===============================================================================

Multer is configured using:

• Cloudinary storage

• Custom file filter

• Maximum upload size:
      2 MB

If an uploaded file exceeds 2 MB, Multer automatically rejects it.

===============================================================================
4. EXPORTED MIDDLEWARE
===============================================================================

The configured Multer instance is exported as:

      upload

This middleware can be used in Express routes, for example:

    upload.single('avatar')

When a request containing an image reaches the route:

1. Multer receives the uploaded file.

2. The file type is validated.

3. The file size is checked.

4. The image is uploaded directly to Cloudinary.

5. Cloudinary returns information such as the image URL.

6. The route handler can then save that URL in the database.

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file centralizes all image upload configuration for the application.

It is responsible for:

✓ Receiving uploaded image files.
✓ Validating file types.
✓ Enforcing a maximum file size.
✓ Uploading images directly to Cloudinary.
✓ Automatically resizing uploaded avatars.
✓ Exporting reusable upload middleware for Express routes.

By keeping all upload-related configuration in one place, this file makes image
handling consistent, secure, and easy to maintain throughout the application.
===============================================================================
*/




