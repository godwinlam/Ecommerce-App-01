import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name Is Required"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      unique: [true, "Email Already Taken"],
    },
    password: {
      type: String,
      required: [true, "Password Is Required"],
      min: [6, "Password must be at least 6 characters"],
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: [true, "Country Name Is Required"],
    },
    phone: {
      type: String,
      required: [true, "Phone Number Is Required"],
    },
    profilePic: {
      public_id: { type: String },
      url: { type: String },
    },
    answer: {
      type: String,
      required: [true, "Answer Is Required"],
    },
    role: {
      type: String,
      required: [true, "Role Is Required"],
      default: "user",
    },
  },
  { timestamps: true }
);

//function hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const userModel = mongoose.model("Users", userSchema);
export default userModel;
