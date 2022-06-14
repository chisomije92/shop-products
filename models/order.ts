import mongoose, { Types } from "mongoose";
import { ProductType } from "./product.js";

const { Schema, model } = mongoose;

export interface OrderType {
  _id?: Types.ObjectId;
  products: ProductType[];
  quantity: number;
  user: {
    name: string;
    userId: Types.ObjectId;
  };
}

const OrderSchema = new Schema<OrderType>({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

export default model<OrderType>("Order", OrderSchema);
