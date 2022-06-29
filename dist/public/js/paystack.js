const paymentForm = document.getElementById("paymentForm");
paymentForm.addEventListener("submit", payWithPaystack, false);
function payWithPaystack(evt) {
    evt.preventDefault();
    const emailInput = document.getElementById("email-address");
    const amountInput = document.getElementById("amount");
    // @ts-ignore
    const handler = PaystackPop.setup({
        key: "pk_test_f3d22f397b9d064d5acd5cca37a3c68bdaa2f88a",
        email: emailInput.value,
        amount: +amountInput.value * 100,
        currency: "NGN",
        ref: "" + Math.floor(Math.random() * 1000000000 + 1),
        callback: function (response) {
            //this happens after the payment is completed successfully
            const reference = response.reference;
            // alert("Payment complete! Reference: " + reference);
            // Make an AJAX call to your server with the reference to verify the transaction
        },
        onClose: function () {
            // alert("Transaction was not completed, window closed.");
        },
    });
    handler.openIframe();
}
export {};
//# sourceMappingURL=paystack.js.map