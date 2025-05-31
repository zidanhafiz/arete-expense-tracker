/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - category_id
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the expense
 *         icon:
 *           type: string
 *           description: Icon representing the expense
 *         name:
 *           type: string
 *           description: Name of the expense
 *         description:
 *           type: string
 *           description: Description of the expense
 *         amount:
 *           type: number
 *           format: float
 *           description: Expense amount
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             icon:
 *               type: string
 *           description: Category details
 *         category_id:
 *           type: string
 *           description: ID of the category
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the expense
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         user:
 *           type: string
 *           description: User ID associated with the expense
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
 *         name: "Groceries"
 *         description: "Weekly groceries"
 *         amount: 125.50
 *         category:
 *           _id: "60d21b4667d0d8992e610c86"
 *           name: "Food"
 *           icon: "🍔"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/receipt.jpg"]
 *         user: "60d21b4667d0d8992e610c87"
 *         created_at: "2023-05-01T14:35:00Z"
 *         updated_at: "2023-05-01T14:35:00Z"
 *
 *     ExpenseCreate:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - category_id
 *       properties:
 *         icon:
 *           type: string
 *           description: Icon representing the expense
 *         name:
 *           type: string
 *           description: Name of the expense
 *         description:
 *           type: string
 *           description: Description of the expense
 *         amount:
 *           type: number
 *           format: float
 *           description: Expense amount
 *         category_id:
 *           type: string
 *           description: ID of the category
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the expense
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *       example:
 *         icon: "💰"
 *         name: "Groceries"
 *         description: "Weekly groceries"
 *         amount: 125.50
 *         category_id: "60d21b4667d0d8992e610c86"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/receipt.jpg"]
 *
 *     ExpenseUpdate:
 *       type: object
 *       properties:
 *         icon:
 *           type: string
 *           description: Icon representing the expense
 *         name:
 *           type: string
 *           description: Name of the expense
 *         description:
 *           type: string
 *           description: Description of the expense
 *         amount:
 *           type: number
 *           format: float
 *           description: Expense amount
 *         category_id:
 *           type: string
 *           description: ID of the category
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the expense
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *       example:
 *         icon: "💰"
 *         name: "Updated Groceries"
 *         description: "Monthly groceries"
 *         amount: 150.75
 *         category_id: "60d21b4667d0d8992e610c86"
 *         date: "2023-05-01T14:30:00Z"
 *         images: ["https://cloudinary.com/example/updated_receipt.jpg"]
 */

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management operations
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: List all expenses
 *     description: Retrieve a list of expenses with optional filtering and pagination
 *     tags: [Expenses]
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
 *         description: Search term to filter expenses by name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID or name
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses until this date (YYYY-MM-DD)
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
 *                   example: Expenses listed successfully
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
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
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
 *     summary: Create a new expense
 *     description: Add a new expense record
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseCreate'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense created successfully
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
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
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category not found
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
 * /api/expenses/downloadExcel:
 *   get:
 *     summary: Download expenses as Excel file
 *     description: Generate and download an Excel report of expenses with optional date filtering
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Excel file containing expense data
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
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     description: Retrieve details of a specific expense by its ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
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
 *                   example: Expense found successfully
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense not found
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
 *     summary: Update expense by ID
 *     description: Update an existing expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseUpdate'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense updated successfully
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
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
 *         description: Expense or category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense not found
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
 *     summary: Delete expense by ID
 *     description: Delete an expense and its associated images
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense not found
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
