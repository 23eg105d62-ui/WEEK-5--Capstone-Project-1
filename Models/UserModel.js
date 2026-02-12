import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email already existed"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        profileImageUrl: {
            type: String,
        },
        role: {
            type: String,
            enum: ["AUTHOR", "USER", "ADMIN"],
            required: [true, "{Value} is an invalid role"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        strict: "throw",
        versionKey: false,
    },
);

//create model - check if already compiled to prevent OverwriteModelError
//mongoose.models checks if model exists, if so return it
//otherwise create new model
const UserModel = mongoose.models.user || model("user", userSchema);

export default UserModel;
