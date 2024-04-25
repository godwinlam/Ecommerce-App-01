import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

//create category
export const createCategoryController = async (req, res) => {
  try {
    const { category } = req.body;

    //validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Please Provide Category Name",
      });
    }
    await categoryModel.create({ category });
    res.status(200).send({
      success: true,
      message: `${category} Category Created Successfully`,
    });
  } catch (error) {
    console.log("🚀 ~ createCategoryController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Create Category Api",
      error,
    });
  }
};

//Get All category
export const getAllCategoryController = async (req, res) => {
  try {
    const allCategories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories Fetched successfully",
      totalCategories: allCategories.length,
      allCategories,
    });
  } catch (error) {
    console.log("🚀 ~ getAllCategoryController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Category Api",
      error,
    });
  }
};

//Delete category
export const deleteCategoryController = async (req, res) => {
  try {
    //find category
    const category = await categoryModel.findById(req.params.id);

    //validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Name Not Found",
      });
    }

    //find product with this category id
    const products = await productModel.find({ category: category._id });

    //update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "Category Deleted successfully",
    });
  } catch (error) {
    console.log("🚀 ~ deleteCategoryController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Delete Category Api",
      error,
    });
  }
};

//Update category
export const updateCategoryController = async (req, res) => {
  try {
    //find category
    const category = await categoryModel.findById(req.params.id);

    //validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Name Not Found",
      });
    }
    //get new category
    const { updatedCategory } = req.body;

    //find product with this category id
    const products = await productModel.find({ category: category._id });

    //update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    if (updatedCategory) category.category = updatedCategory;

    await category.save();
    res.status(200).send({
      success: true,
      message: "Category Updated successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updateCategoryController ~ error:", error);

    // Cast Error || Object ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Update Category Api",
      error,
    });
  }
};


