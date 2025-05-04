import { Router } from "express";
import incomeController from "../controllers/income.controllers";

const incomeRouter: Router = Router();

incomeRouter.get("/downloadExcel", incomeController.downloadExcel);

incomeRouter
  .route("/")
  .get(incomeController.listIncomes)
  .post(incomeController.createIncome);

incomeRouter
  .route("/:id")
  .get(incomeController.getIncomeById)
  .put(incomeController.updateIncomeById)
  .delete(incomeController.deleteIncomeById);

export default incomeRouter;
