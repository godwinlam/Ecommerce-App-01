import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;

    //validation
    // create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      //find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();

      res.status(200).send({
        success: true,
        message: "Orders Placed Successfully",
      });
    }
  } catch (error) {
    console.log("🚀 ~ createOrderController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Create Order Api",
      error,
    });
  }
};

//Get My Order
export const getMyOrdersController = async (req, res) => {
  try {
    //find my order
    const orders = await orderModel.find({ user: req.user._id });
    //validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "Orders Not Found ",
      });
    }
    res.status(200).send({
      success: true,
      message: "My Orders Data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log("🚀 ~ getMyOrderController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get My Order Api",
      error,
    });
  }
};

//Get Single Order Info
export const getSingleOrderDetailController = async (req, res) => {
  try {
    //find orders
    const order = await orderModel.findById(req.params.id);
    //validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order Not Found ",
      });
    }
    res.status(200).send({
      success: true,
      message: "My Order Data",
      order,
    });
  } catch (error) {
    console.log("🚀 ~ getSingleOrderDetailController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get Single Order Detail Api",
      error,
    });
  }
};

//Payment Gateway
export const paymentGatewayController = async (req, res) => {
  try {
    // get amount
    const { totalAmount } = req.body;
    // validation
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount Is Require",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });
    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log("🚀 ~ paymentGatewayController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Payment Gateway Api",
      error,
    });
  }
};

// ==============ADMIN SECTION=================

// Get All ORDERS
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All Orders Data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log("🚀 ~ getAllOrdersController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Orders Api",
      error,
    });
  }
};

// Change Order Status
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);
    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }
    if (order.orderStatus === "processing") {
      order.orderStatus = "shipped";
    } else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "Order Already Delivered",
      });
    }
    await order.save();
    res.status(200).send({
      success: true,
      message: "Order Status Updated",
    });
  } catch (error) {
    console.log("🚀 ~ changeOrderStatusController ~ error:", error);

    // cast error || Object Id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      massage: "Error In Change Order Status Api",
      error,
    });
  }
};
