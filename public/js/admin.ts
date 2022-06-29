const buttons = document.querySelectorAll("button");

const deleteProduct = (el: HTMLButtonElement | HTMLInputElement) => {
  const prodId = el.parentElement?.querySelector(
    "[name=productId]"
  ) as HTMLInputElement;

  const csrf = el.parentElement?.querySelector(
    "[name=_csrf]"
  ) as HTMLInputElement;

  fetch(`/product/${prodId.value}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf.value,
    },
  })
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
};

let btnEl: HTMLButtonElement;
for (let btn of buttons) {
  btnEl = btn;
  btn.addEventListener("click", deleteProduct.bind(null, btnEl));
}
