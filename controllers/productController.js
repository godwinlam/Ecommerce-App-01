import productModel from "../models/productModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const allProducts = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        // category: category ? category : null,
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "All Products Fetched successfully",
      totalProducts: allProducts.length,
      allProducts,
    });
  } catch (error) {
    console.log("🚀 ~ getAllProductsController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Products Api",
      error,
    });
  }
};

//Get Top Product
export const getTopProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "Top 3 Product",
      products,
    });
  } catch (error) {
    console.log("🚀 ~ getTopProductController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get Top Product Api",
      error,
    });
  }
};

//Get Single Product
export const getSingleProductController = async (req, res) => {
  try {
    //Get Product ID
    const singleProduct = await productModel.findById(req.params.id);

    //validation
    if (!singleProduct) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Single Product Fetched successfully",
      singleProduct,
    });
  } catch (error) {
    console.log("🚀 ~ getSingleProductController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get Single Product Api",
      error,
    });
  }
};

//Create a new product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    //if (!name || !description || !price || !stock) {
    // return res.status(500).send({
    // success: false,
    //message: "Please Provide All Fields",
    //});
    //}
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Product Image",
      });
    }
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });
    res.status(200).send({
      success: true,
      message: "Product Created successfully",
    });
  } catch (error) {
    console.log("🚀 ~ createProductController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Create Product Api",
      error,
    });
  }
};

//Update Product Detail
export const updateProductController = async (req, res) => {
  try {
    //find product
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found ",
      });
    }

    const { name, description, price, category, stock } = req.body;
    //validation || Update
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product Detail Update successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updateProductController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Update Product Api",
      error,
    });
  }
};

//Update Product Image
export const updateProductImageController = async (req, res) => {
  try {
    //find product
    const productImage = await productModel.findById(req.params.id);

    //validation
    if (!productImage) {
      return res.status(404).send({
        success: false,
        message: "Product Image Not Found ",
      });
    }
    //Check Product Image File
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product Image Not Found",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //save
    productImage.images.push(image);
    await productImage.save();
    res.status(200).send({
      success: true,
      message: "Product Image Updated successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updateProductImageController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Update Product Image Api",
      error,
    });
  }
};

//delete Product Image
export const deleteProductImageController = async (req, res) => {
  try {
    //find product
    const productImage = await productModel.findById(req.params.id);

    //validation
    if (!productImage) {
      return res.status(404).send({
        success: false,
        message: "Product Image Not Found ",
      });
    }

    //Find Image ID
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Product Image Selected Not Found ",
      });
    }
    let isExist = -1;
    productImage.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Selected Not Found ",
      });
    }

    //Delete Product Image
    await cloudinary.v2.uploader.destroy(
      productImage.images[isExist].public_id
    );
    productImage.images.splice(isExist, 1);
    await productImage.save();
    res.status(200).send({
      success: true,
      message: "Product Image Delete successfully",
    });
  } catch (error) {
    console.log("🚀 ~ deleteProductImageController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Delete Product Image Api",
      error,
    });
  }
};

//delete Product
export const deleteProductController = async (req, res) => {
  try {
    //find product
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found ",
      });
    }

    //find and delete image from cloudinary database
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log("🚀 ~ deleteProductController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Delete Product Api",
      error,
    });
  }
};

// Create Product review || Comment
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    // find product
    const product = await productModel.findById(req.params.id);
    // check previous review
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "Product Already Reviewed",
      });
    }
    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    //passing review object to reviews array
    product.reviews.push(review);
    // number or reviews
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    //save
    await product.save();
    res.status(200).send({
      success: true,
      message: "Reviews Added successfully",
    });
  } catch (error) {
    console.log("🚀 ~ productReviewController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Product Review Api",
      error,
    });
  }
};
