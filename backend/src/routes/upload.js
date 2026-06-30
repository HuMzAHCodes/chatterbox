import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import protect from '../middleware/protect.js';
import upload from '../middleware/upload.js';
import User from '../models/User.js';

const router = express.Router();

router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
    });
  })
);




export default router;

/*
===============================================================================
UPLOADROUTES.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file defines the API endpoint responsible for uploading a user's avatar.

It combines authentication, file upload handling, and database updates into a
single route so authenticated users can change their profile picture.

===============================================================================
ROUTE
===============================================================================

POST /avatar

This endpoint allows a logged-in user to upload a new profile image.

===============================================================================
MIDDLEWARE EXECUTION FLOW
===============================================================================

When a request is sent to POST /avatar, the middleware executes in the
following order:

1. protect
-----------
Authenticates the request.

Responsibilities:

• Verifies the user's JWT.
• Finds the authenticated user.
• Stores the user in:

      req.user

If authentication fails, the request is rejected before reaching the upload
logic.

-------------------------------------------------------------------------------

2. upload.single('avatar')
--------------------------
Processes the uploaded image.

Responsibilities:

• Looks for a file in the "avatar" field of the request.
• Validates that the uploaded file is an image.
• Checks that the file size is within the allowed limit.
• Uploads the image directly to Cloudinary.
• Stores information about the uploaded image in:

      req.file

If the upload fails, the request is terminated with an appropriate error.

-------------------------------------------------------------------------------

3. asyncHandler(...)
-------------------
Wraps the asynchronous route handler.

Responsibilities:

• Catches asynchronous errors automatically.
• Passes errors to Express's global error handler.
• Eliminates the need for try...catch blocks inside the route.

===============================================================================
ROUTE HANDLER LOGIC
===============================================================================

Once all middleware succeeds, the route handler:

1. Confirms that a file was uploaded.

2. If no file exists:

      Returns a 400 Bad Request error.

3. Updates the authenticated user's avatar field in MongoDB using the
   Cloudinary image URL stored in:

      req.file.path

4. Returns the updated avatar URL to the client.

===============================================================================
SUCCESS RESPONSE
===============================================================================

If the upload is successful, the server responds with:

• success: true
• The URL of the uploaded avatar image

Example:

{
    "success": true,
    "data": {
        "avatar": "<cloudinary-image-url>"
    }
}

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file manages avatar uploads for authenticated users.

It is responsible for:

✓ Protecting the upload endpoint.
✓ Receiving uploaded avatar images.
✓ Uploading images to Cloudinary.
✓ Updating the user's avatar URL in MongoDB.
✓ Returning the updated avatar information to the client.

By combining authentication, upload processing, and database updates into a
single route, this file provides a secure and organized way for users to
manage their profile pictures.
===============================================================================
*/