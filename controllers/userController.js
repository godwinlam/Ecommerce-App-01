import userModel from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
      role,
    } = req.body;

    //validation
    if (
      !name ||
      !email ||
      !password ||
      !country ||
      !phone ||
      !answer ||
      !city ||
      !address ||
      !role
    ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Required Fields",
      });
    }

    //Check existing user
    const existingUserEmail = await userModel.findOne({ email });

    if (existingUserEmail) {
      return res.status(500).send({
        success: false,
        message: "Email Already Registered",
      });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
      role,
    });
    res.status(201).send({
      success: true,
      message: "Registration successful, Please Login",
      user,
    });
  } catch (error) {
    console.log("🚀 ~ registerController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Register Api",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email and Password",
      });
    }

    //Check existing user
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return res.status(500).send({
        success: false,
        message: "Invalid User",
      });
    }

    //match user password
    const match = await existingUser.comparePassword(password);
    if (!match) {
      return res.status(500).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //Token
    const token = existingUser.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login successful",
        token,
        existingUser,
      });
  } catch (error) {
    console.log("🚀 ~ loginController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Login Api",
      error,
    });
  }
};

//Get USER PROFILE
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log("🚀 ~ getUserProfileController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get User Profile Api",
      error,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    console.log("🚀 ~ logoutController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Logout Api",
      error,
    });
  }
};

// Update User Profile
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, address, city, country, phone } = req.body;

    //validate + update
    if (name) user.name = name;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User update successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updateProfileController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile Api",
      error,
    });
  }
};
// Update User Password
export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id);

    //validation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Old Or New Password",
      });
    }

    //old Password Check
    const isMatch = await user.comparePassword(oldPassword);

    //validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Password update successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updatePasswordController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Update Password Api",
      error,
    });
  }
};

// update user profile photo
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    //file get from client photo
    const file = getDataUri(req.file);

    //delete previous image
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);

    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //save
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Pic update successfully",
    });
  } catch (error) {
    console.log("🚀 ~ updateProfilePicController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile Pic Api",
      error,
    });
  }
};

// Forgot Password
export const passwordResetController = async (req, res) => {
  try {
    // User get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    // validation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // Find User
    const user = await userModel.findOne({ email, answer });
    // validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid User Or Answer",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your Password Had Been Reset ! Please Login",
    });
  } catch (error) {
    console.log("🚀 ~ passwordResetController ~ error:", error);
    res.status(500).send({
      success: false,
      message: "Error In Password Reset Api",
      error,
    });
  }
};
