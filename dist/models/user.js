import mongoose from "mongoose";
const { Schema, model } = mongoose;
const UserSchema = new Schema({
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
UserSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex((item) => {
        return item.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
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
UserSchema.methods.deleteItemFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => item.productId.toString() !== productId.toString());
    this.cart = { items: updatedCartItems };
    return this.save();
};
UserSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};
export default model("User", UserSchema);
//# sourceMappingURL=user.js.map