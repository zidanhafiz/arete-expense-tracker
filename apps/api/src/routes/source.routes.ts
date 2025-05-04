import { Router } from "express";
import sourceController from "../controllers/source.controllers";

const sourceRouter: Router = Router();

sourceRouter
  .route("/")
  .get(sourceController.listSources)
  .post(sourceController.createSource);

sourceRouter
  .route("/:id")
  .get(sourceController.getSourceById)
  .put(sourceController.updateSourceById)
  .delete(sourceController.deleteSourceById);

export default sourceRouter;
