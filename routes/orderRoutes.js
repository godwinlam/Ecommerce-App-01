import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  changeOrderStatusController,
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  getSingleOrderDetailController,
  paymentGatewayController,
} from "../controllers/orderController.js";

//router object
const router = express.Router();

//routes
router.post("/create-order", isAuth, createOrderController);

router.get("/my-orders", isAuth, getMyOrdersController);

router.get("/my-single-orders/:id", isAuth, getSingleOrderDetailController);

router.post("/payment-gateway", isAuth, paymentGatewayController);

router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController);

router.put("/admin/order/:id", isAuth, isAdmin, changeOrderStatusController);

export default router;
