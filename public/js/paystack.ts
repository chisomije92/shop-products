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
    key: "pk_test_f3d22f397b9d064d5acd5cca37a3c68bdaa2f88a", // Replace with your public key
    email: emailInput.value,
    amount: +amountInput.value * 100, //
    currency: "NGN", // Use GHS for Ghana Cedis or USD for US Dollars
    ref: "" + Math.floor(Math.random() * 1000000000 + 1),
    callback: function (response: any) {
      //this happens after the payment is completed successfully
      fetch(`/verify-order?reference=${response.reference}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
      // const reference = response.reference;
      // alert("Payment complete! Reference: " + reference);
      // Make an AJAX call to your server with the reference to verify the transaction
    },
    onClose: function () {
      // alert("Transaction was not completed, window closed.");
    },
  });
  handler.openIframe();
}
