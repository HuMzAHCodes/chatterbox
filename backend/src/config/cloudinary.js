import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/*
===============================================================================
CLOUDINARY.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file configures and initializes the Cloudinary SDK for the application.

Cloudinary is a cloud-based media management service that stores, optimizes,
and delivers images and videos. Instead of saving uploaded files on the local
server, the application uploads them directly to Cloudinary.

===============================================================================
1. LOAD ENVIRONMENT VARIABLES
===============================================================================

The dotenv package loads environment variables from the ".env" file into
process.env.

The following Cloudinary credentials are loaded:

• CLOUDINARY_CLOUD_NAME
• CLOUDINARY_API_KEY
• CLOUDINARY_API_SECRET

Keeping these values in environment variables protects sensitive credentials
from being hardcoded into the source code.

===============================================================================
2. CONFIGURE CLOUDINARY
===============================================================================

The cloudinary.config() method initializes the Cloudinary SDK using the
credentials stored in the environment variables.

Once configured, the application can securely communicate with the Cloudinary
API to perform operations such as:

• Uploading images
• Deleting images
• Transforming images
• Retrieving image URLs

===============================================================================
3. EXPORT THE CONFIGURED INSTANCE
===============================================================================

The configured Cloudinary instance is exported so it can be reused throughout
the application.

Other modules can import this instance whenever they need to interact with
Cloudinary, such as:

• Multer upload middleware
• Controllers that manage user avatars
• Services that upload or delete media files

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file serves as the central configuration point for Cloudinary.

It is responsible for:

✓ Loading Cloudinary credentials from environment variables.
✓ Initializing the Cloudinary SDK.
✓ Authenticating requests to the Cloudinary service.
✓ Exporting a reusable Cloudinary instance for the rest of the application.

By keeping the configuration in a single file, the application avoids
duplicating setup code and makes Cloudinary integration easier to maintain.
===============================================================================
*/



