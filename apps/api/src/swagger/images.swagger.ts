/**
 * @swagger
 * components:
 *   schemas:
 *     ImageUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: Images uploaded successfully
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Array of uploaded image URLs
 *           example:
 *             - https://res.cloudinary.com/example/image/upload/v1234567890/images/image1.jpg
 *             - https://res.cloudinary.com/example/image/upload/v1234567890/images/image2.jpg
 *
 *     ImageUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: Image updated successfully
 *         image:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: URL of the updated image
 *           example:
 *             - https://res.cloudinary.com/example/image/upload/v1234567890/images/updated_image.jpg
 *
 *     ImageDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: Image deleted successfully
 */

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image upload, update, and deletion operations
 */

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload multiple images
 *     description: Upload up to 3 images to Cloudinary
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload (max 3)
 *             required:
 *               - images
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *       400:
 *         description: No files uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: File size too large (>5MB)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File too large
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /api/images:
 *   put:
 *     summary: Update an image
 *     description: Replace an existing image with a new one by its public ID
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID of the image to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUpdateResponse'
 *       400:
 *         description: Missing publicId or image file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No publicId or file provided
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: File size too large (>5MB)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File too large
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *
 *   delete:
 *     summary: Delete an image
 *     description: Delete an image from Cloudinary by its public ID
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageDeleteResponse'
 *       400:
 *         description: Missing publicId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No publicId provided
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

export {};
