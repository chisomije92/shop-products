import mongoose from "mongoose";
const { Schema, model } = mongoose;
const OrderSchema = new Schema({
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
        email: {
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
export default model("Order", OrderSchema);
//# sourceMappingURL=order.js.map