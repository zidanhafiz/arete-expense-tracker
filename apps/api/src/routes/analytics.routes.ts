import { Router } from "express";
import analyticController from "../controllers/analytic.controllers";
import "../swagger/analytics.swagger";

const analyticsRouter: Router = Router();

analyticsRouter.get("/totalIncome", analyticController.getTotalIncome);
analyticsRouter.get("/totalExpense", analyticController.getTotalExpense);
analyticsRouter.get("/netBalance", analyticController.getNetBalance);
analyticsRouter.get("/transactions", analyticController.getTransactions);
analyticsRouter.get("/expenseSummary", analyticController.getExpenseSummary);
analyticsRouter.get("/incomeSummary", analyticController.getIncomeSummary);

export default analyticsRouter;
