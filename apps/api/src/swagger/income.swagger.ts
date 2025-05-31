/**
 * @swagger
 * components:
 *   schemas:
 *     Income:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - source_id
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the income
 *         icon:
 *           type: string
 *           description: Icon representing the income
 *         name:
 *           type: string
 *           description: Name of the income
 *         description:
 *           type: string
 *           description: Description of the income
 *         amount:
 *           type: number
 *           format: float
 *           description: Income amount
 *         source:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             icon:
 *               type: string
 *           description: Source details
 *         source_id:
 *           type: string
 *           description: ID of the source
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the income
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         user:
 *           type: string
 *           description: User ID associated with the income
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         icon: "💰"
 *         name: "Salary"
 *         description: "Monthly salary"
 *         amount: 3000.00
 *         source:
 *           _id: "60d21b4667d0d8992e610c86"
 *           name: "Employment"
 *           icon: "💼"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/receipt.jpg"]
 *         user: "60d21b4667d0d8992e610c87"
 *         created_at: "2023-05-01T14:35:00Z"
 *         updated_at: "2023-05-01T14:35:00Z"
 *
 *     IncomeCreate:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - source_id
 *       properties:
 *         icon:
 *           type: string
 *           description: Icon representing the income
 *         name:
 *           type: string
 *           description: Name of the income
 *         description:
 *           type: string
 *           description: Description of the income
 *         amount:
 *           type: number
 *           format: float
 *           description: Income amount
 *         source_id:
 *           type: string
 *           description: ID of the source
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the income
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *       example:
 *         icon: "💰"
 *         name: "Salary"
 *         description: "Monthly salary"
 *         amount: 3000.00
 *         source_id: "60d21b4667d0d8992e610c86"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/receipt.jpg"]
 *
 *     IncomeUpdate:
 *       type: object
 *       properties:
 *         icon:
 *           type: string
 *           description: Icon representing the income
 *         name:
 *           type: string
 *           description: Name of the income
 *         description:
 *           type: string
 *           description: Description of the income
 *         amount:
 *           type: number
 *           format: float
 *           description: Income amount
 *         source_id:
 *           type: string
 *           description: ID of the source
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the income
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *       example:
 *         icon: "💰"
 *         name: "Updated Salary"
 *         description: "Monthly salary with bonus"
 *         amount: 3500.00
 *         source_id: "60d21b4667d0d8992e610c86"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/updated_receipt.jpg"]
 */

/**
 * @swagger
 * tags:
 *   name: Incomes
 *   description: Income management operations
 */

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: List all incomes
 *     description: Retrieve a list of incomes with optional filtering and pagination
 *     tags: [Incomes]
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
 *         description: Search term to filter incomes by name or description
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source ID or name
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes from this date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes until this date (YYYY-MM-DD)
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
 *                   example: Incomes listed successfully
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 incomes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Income'
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
 *     summary: Create a new income
 *     description: Add a new income record
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncomeCreate'
 *     responses:
 *       201:
 *         description: Income created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income created successfully
 *                 income:
 *                   $ref: '#/components/schemas/Income'
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
 */

/**
 * @swagger
 * /api/incomes/downloadExcel:
 *   get:
 *     summary: Download incomes as Excel file
 *     description: Generate and download an Excel report of incomes with optional date filtering
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes from this date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Excel file containing income data
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
 * /api/incomes/{id}:
 *   get:
 *     summary: Get income by ID
 *     description: Retrieve details of a specific income by its ID
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Income ID
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
 *                   example: Income found successfully
 *                 income:
 *                   $ref: '#/components/schemas/Income'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Income not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income not found
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
 *     summary: Update income by ID
 *     description: Update an existing income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Income ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncomeUpdate'
 *     responses:
 *       200:
 *         description: Income updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income updated successfully
 *                 income:
 *                   $ref: '#/components/schemas/Income'
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
 *         description: Income or source not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income not found
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
 *     summary: Delete income by ID
 *     description: Delete an income and its associated images
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Income ID
 *     responses:
 *       200:
 *         description: Income deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Income not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income not found
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
