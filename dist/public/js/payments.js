const paymentForm = document.getElementById("paymentForm");
const swipeBtn = document.getElementById("swipe-btn");
const swipeWidget = document.getElementById("swipe-modal");
paymentForm.addEventListener("submit", payWithPaystack, false);
function payWithPaystack(evt) {
    evt.preventDefault();
    const emailInput = document.getElementById("email-address");
    const amountInput = document.getElementById("amount");
    // @ts-ignore
    const handler = PaystackPop.setup({
        key: `pk_test_f3d22f397b9d064d5acd5cca37a3c68bdaa2f88a`,
        email: emailInput.value,
        amount: +amountInput.value * 100,
        currency: "NGN",
        ref: "" + Math.floor(Math.random() * 1000000000 + 1),
        callback: function (response) {
            fetch(`/verify-order?reference=${response.reference}`)
                .then((res) => {
                return res.json();
            })
                .then((data) => {
                window.location.href = "/orders";
            })
                .catch((err) => {
                console.log(err);
            });
        },
        onClose: function () { },
    });
    handler.openIframe();
}
const showSwipeWidget = (evt) => {
    evt.preventDefault();
    swipeWidget.style.display = "block";
};
swipeBtn.addEventListener("click", showSwipeWidget);
export {};
//# sourceMappingURL=payments.js.map