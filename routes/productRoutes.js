import express from "express";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSingleProductController,
  getTopProductController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/get-all-products", getAllProductsController);

router.get("/get-top-products", getTopProductController);

router.get("/:id", getSingleProductController);

router.post(
  "/create-product",
  isAuth,
  isAdmin,
  singleUpload,
  createProductController
);

router.put("/:id", isAuth, isAdmin, updateProductController);

router.put(
  "/image/:id",
  isAuth,
  isAdmin,
  singleUpload,
  updateProductImageController
);

router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController
);

router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

router.put("/:id/review", isAuth, productReviewController);

export default router;
