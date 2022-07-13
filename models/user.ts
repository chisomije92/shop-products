import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface ItemObjType {
  productId: Types.ObjectId;
  quantity: number;
}
export interface CartItemType {
  items: ItemObjType[];
}

export interface UserType {
  id?: Types.ObjectId;
  password: string;
  email: string;
  cart: CartItemType;
  resetToken?: string;
  resetTokenExpiration?: Date | number;
}

const UserSchema = new Schema<UserType>({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date || Number,
});

UserSchema.methods.addToCart = function (product: any) {
  const cartProductIndex = this.cart.items.findIndex((item: any) => {
    return item.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;

  const updatedCartItems: ItemObjType[] = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  let updatedItems = {
    items: updatedCartItems,
  };
  this.cart = updatedItems;
  return this.save();
};

UserSchema.methods.deleteItemFromCart = function (productId: string) {
  const updatedCartItems = this.cart.items.filter(
    (item: any) => item.productId.toString() !== productId.toString()
  );
  this.cart = { items: updatedCartItems };
  return this.save();
};

UserSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

export default model<UserType>("User", UserSchema);
