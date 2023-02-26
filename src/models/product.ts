import mongoose, { Types } from "mongoose";

export interface ProductType {
  _id?: Types.ObjectId;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId: Types.ObjectId;
  quantity?: number;
}
const { Schema, model } = mongoose;
const productSchema = new Schema<ProductType>({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model<ProductType>("Product", productSchema);
