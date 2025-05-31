/**
 * @swagger
 * components:
 *   schemas:
 *     Source:
 *       type: object
 *       required:
 *         - name
 *         - icon
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the source
 *         name:
 *           type: string
 *           description: Name of the income source
 *         icon:
 *           type: string
 *           description: Icon representing the source
 *         user:
 *           type: string
 *           description: User ID associated with the source
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         _id: "60d21b4667d0d8992e610c86"
 *         name: "Employment"
 *         icon: "💼"
 *         user: "60d21b4667d0d8992e610c87"
 *         created_at: "2023-05-01T14:35:00Z"
 *         updated_at: "2023-05-01T14:35:00Z"
 *
 *     SourceCreate:
 *       type: object
 *       required:
 *         - name
 *         - icon
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the income source
 *         icon:
 *           type: string
 *           description: Icon representing the source
 *       example:
 *         name: "Employment"
 *         icon: "💼"
 *
 *     SourceUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the income source
 *         icon:
 *           type: string
 *           description: Icon representing the source
 *       example:
 *         name: "Full-time Employment"
 *         icon: "👨‍💼"
 */

/**
 * @swagger
 * tags:
 *   name: Sources
 *   description: Income source management operations
 */

/**
 * @swagger
 * /api/sources:
 *   get:
 *     summary: List all sources
 *     description: Retrieve a list of income sources with optional filtering and pagination
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter sources by name
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sources fetched successfully
 *                 sources:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Source'
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
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
 *
 *   post:
 *     summary: Create a new source
 *     description: Add a new income source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SourceCreate'
 *     responses:
 *       201:
 *         description: Source created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source created successfully
 *                 source:
 *                   $ref: '#/components/schemas/Source'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
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

/**
 * @swagger
 * /api/sources/{id}:
 *   get:
 *     summary: Get source by ID
 *     description: Retrieve details of a specific income source by its ID
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source fetched successfully
 *                 source:
 *                   $ref: '#/components/schemas/Source'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Source not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source not found
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
 *   put:
 *     summary: Update source by ID
 *     description: Update an existing income source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SourceUpdate'
 *     responses:
 *       200:
 *         description: Source updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source updated successfully
 *                 source:
 *                   $ref: '#/components/schemas/Source'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Source not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source not found
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
 *     summary: Delete source by ID
 *     description: Delete an income source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source ID
 *     responses:
 *       200:
 *         description: Source deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Source not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source not found
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
