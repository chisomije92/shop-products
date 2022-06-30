const paymentForm = document.getElementById("paymentForm")!;
paymentForm.addEventListener("submit", payWithPaystack, false);
function payWithPaystack(evt: Event) {
  evt.preventDefault();

  const emailInput = document.getElementById(
    "email-address"
  ) as HTMLInputElement;
  const amountInput = document.getElementById("amount") as HTMLInputElement;
  // @ts-ignore
  const handler = PaystackPop.setup({
    key: `pk_test_f3d22f397b9d064d5acd5cca37a3c68bdaa2f88a`,
    email: emailInput.value,
    amount: +amountInput.value * 100, //
    currency: "NGN",
    ref: "" + Math.floor(Math.random() * 1000000000 + 1),
    callback: function (response: any) {
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
    onClose: function () {},
  });
  handler.openIframe();
}
