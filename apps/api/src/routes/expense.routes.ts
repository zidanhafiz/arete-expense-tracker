import { Router } from "express";
import expenseController from "../controllers/expense.controllers";

const expenseRouter: Router = Router();

expenseRouter
  .route("/")
  .get(expenseController.listExpenses)
  .post(expenseController.createExpense);

expenseRouter
  .route("/:id")
  .get(expenseController.getExpenseById)
  .put(expenseController.updateExpenseById)
  .delete(expenseController.deleteExpenseById);

export default expenseRouter;
