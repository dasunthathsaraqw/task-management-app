import User, { IUser } from "../models/User";

export const createUser = async (userData: Partial<IUser>) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    return await User.findOne({ email }).select("+password");
  } catch (error) {
    return null;
  }
};

export const findUserById = async (id: string) => {
  try {
    return await User.findById(id);
  } catch (error) {
    return null;
  }
};

export const findUserByFilter = async (filter: any) => {
  try {
    return await User.findOne(filter).select("+password");
  } catch (error) {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    return await User.find().select("-password");
  } catch (error) {
    return [];
  }
};

export const updateUserRole = async (id: string, role: "admin" | "user") => {
  try {
    return await User.findByIdAndUpdate(id, { role }, { new: true });
  } catch (error) {
    return null;
  }
};
