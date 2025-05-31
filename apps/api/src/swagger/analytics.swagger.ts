/**
 * @swagger
 * components:
 *   schemas:
 *     IncomeSource:
 *       type: object
 *       properties:
 *         sourceId:
 *           type: string
 *           description: ID of the income source
 *         name:
 *           type: string
 *           description: Name of the income source
 *         icon:
 *           type: string
 *           description: Icon representing the source
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount from this source
 *         count:
 *           type: integer
 *           description: Number of income entries for this source
 *         percentage:
 *           type: string
 *           description: Percentage of total income from this source
 *       example:
 *         sourceId: "60d21b4667d0d8992e610c86"
 *         name: "Employment"
 *         icon: "💼"
 *         total: 3000.00
 *         count: 1
 *         percentage: "75.00%"
 *
 *     ExpenseCategory:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           description: ID of the expense category
 *         name:
 *           type: string
 *           description: Name of the expense category
 *         icon:
 *           type: string
 *           description: Icon representing the category
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount spent in this category
 *         count:
 *           type: integer
 *           description: Number of expense entries for this category
 *         percentage:
 *           type: string
 *           description: Percentage of total expenses in this category
 *       example:
 *         categoryId: "60d21b4667d0d8992e610c85"
 *         name: "Food"
 *         icon: "🍔"
 *         total: 400.00
 *         count: 4
 *         percentage: "40.00%"
 *
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           description: Type of transaction
 *         name:
 *           type: string
 *           description: Name of the transaction
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the transaction
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             icon:
 *               type: string
 *           description: Category or source of the transaction
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         type: "income"
 *         name: "Salary"
 *         amount: 3000.00
 *         date: "2023-05-01T14:30:00Z"
 *         category:
 *           _id: "60d21b4667d0d8992e610c86"
 *           name: "Employment"
 *           icon: "💼"
 *
 *     ExpenseSummary:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           description: ID of the expense category
 *         name:
 *           type: string
 *           description: Name of the category
 *         icon:
 *           type: string
 *           description: Icon representing the category
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount spent in this category
 *         count:
 *           type: integer
 *           description: Number of expense entries for this category
 *         averageExpense:
 *           type: number
 *           format: float
 *           description: Average expense amount in this category
 *         percentage:
 *           type: number
 *           format: float
 *           description: Percentage of total expenses in this category
 *         highestExpense:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               format: float
 *             name:
 *               type: string
 *             date:
 *               type: string
 *               format: date-time
 *             description:
 *               type: string
 *           description: Highest expense in this category
 *         recentExpenses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *           description: Recent expenses in this category
 *       example:
 *         categoryId: "60d21b4667d0d8992e610c85"
 *         name: "Food"
 *         icon: "🍔"
 *         total: 400.00
 *         count: 4
 *         averageExpense: 100.00
 *         percentage: 40
 *         highestExpense:
 *           amount: 150.00
 *           name: "Restaurant"
 *           date: "2023-05-01T14:30:00Z"
 *           description: "Dinner with family"
 *         recentExpenses:
 *           - amount: 150.00
 *             name: "Restaurant"
 *             date: "2023-05-01T14:30:00Z"
 *             description: "Dinner with family"
 *           - amount: 100.00
 *             name: "Groceries"
 *             date: "2023-05-05T10:30:00Z"
 *             description: "Weekly shopping"
 *
 *     IncomeSummary:
 *       type: object
 *       properties:
 *         sourceId:
 *           type: string
 *           description: ID of the income source
 *         name:
 *           type: string
 *           description: Name of the source
 *         icon:
 *           type: string
 *           description: Icon representing the source
 *         total:
 *           type: number
 *           format: float
 *           description: Total amount from this source
 *         count:
 *           type: integer
 *           description: Number of income entries for this source
 *         averageIncome:
 *           type: number
 *           format: float
 *           description: Average income amount from this source
 *         percentage:
 *           type: number
 *           format: float
 *           description: Percentage of total income from this source
 *         highestIncome:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               format: float
 *             name:
 *               type: string
 *             date:
 *               type: string
 *               format: date-time
 *             description:
 *               type: string
 *           description: Highest income from this source
 *         recentIncomes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *           description: Recent incomes from this source
 *       example:
 *         sourceId: "60d21b4667d0d8992e610c86"
 *         name: "Employment"
 *         icon: "💼"
 *         total: 3000.00
 *         count: 1
 *         averageIncome: 3000.00
 *         percentage: 75
 *         highestIncome:
 *           amount: 3000.00
 *           name: "Salary"
 *           date: "2023-05-01T14:30:00Z"
 *           description: "Monthly salary"
 *         recentIncomes:
 *           - amount: 3000.00
 *             name: "Salary"
 *             date: "2023-05-01T14:30:00Z"
 *             description: "Monthly salary"
 */

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Financial analytics and reporting operations
 */

/**
 * @swagger
 * /api/analytics/totalIncome:
 *   get:
 *     summary: Get total income
 *     description: Retrieve total income with breakdown by source
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for income calculation (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for income calculation (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Total income retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Total income fetched successfully
 *                 totalIncome:
 *                   type: number
 *                   format: float
 *                   example: 4000.00
 *                 incomeBySource:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IncomeSource'
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-31T23:59:59.999Z"
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
 * /api/analytics/totalExpense:
 *   get:
 *     summary: Get total expenses
 *     description: Retrieve total expenses with breakdown by category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for expense calculation (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for expense calculation (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Total expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Total expense fetched successfully
 *                 totalExpense:
 *                   type: number
 *                   format: float
 *                   example: 1000.00
 *                 expenseByCategory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpenseCategory'
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-31T23:59:59.999Z"
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
 * /api/analytics/netBalance:
 *   get:
 *     summary: Get net balance
 *     description: Calculate net balance (income - expenses)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for balance calculation (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for balance calculation (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Net balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Net balance fetched successfully
 *                 netBalance:
 *                   type: number
 *                   format: float
 *                   example: 3000.00
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-31T23:59:59.999Z"
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
 * /api/analytics/transactions:
 *   get:
 *     summary: Get combined transactions
 *     description: Retrieve combined list of income and expense transactions
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for transactions (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for transactions (YYYY-MM-DD)
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
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transactions fetched successfully
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
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
 * /api/analytics/expenseSummary:
 *   get:
 *     summary: Get detailed expense summary
 *     description: Retrieve detailed expense summary with statistics by category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for expense summary (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for expense summary (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Expense summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense summary fetched successfully
 *                 totalExpense:
 *                   type: number
 *                   format: float
 *                   example: 1000.00
 *                 expenseSummary:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpenseSummary'
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-31T23:59:59.999Z"
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
 * /api/analytics/incomeSummary:
 *   get:
 *     summary: Get detailed income summary
 *     description: Retrieve detailed income summary with statistics by source
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for income summary (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for income summary (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Income summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income summary fetched successfully
 *                 totalIncome:
 *                   type: number
 *                   format: float
 *                   example: 4000.00
 *                 incomeSummary:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IncomeSummary'
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-31T23:59:59.999Z"
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
