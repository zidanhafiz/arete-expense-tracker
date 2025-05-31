import { Router } from "express";
import categoryController from "../controllers/category.controllers";
import "../swagger/category.swagger";

const categoryRouter: Router = Router();

categoryRouter
  .route("/")
  .get(categoryController.listCategories)
  .post(categoryController.createCategory);

categoryRouter
  .route("/:id")
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategoryById)
  .delete(categoryController.deleteCategoryById);

export default categoryRouter;
