const buttons = document.querySelectorAll("button");

const deleteProduct = (el: HTMLButtonElement | HTMLInputElement) => {
  const prodId = el.parentElement?.querySelector(
    "[name=productId]"
  ) as HTMLInputElement;

  const csrf = el.parentElement?.querySelector(
    "[name=_csrf]"
  ) as HTMLInputElement;

  const productElement = el.closest("article");

  fetch(`/admin/product/${prodId.value}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf.value,
    },
  })
    .then((result) => result.json())
    .then((data) => {
      console.log(data);
      // productElement?.parentNode?.removeChild(productElement);
      productElement?.remove();
    })
    .catch((err) => console.log(err));
};

let btnEl: HTMLButtonElement;
for (let btn of buttons) {
  btnEl = btn;
  btn.addEventListener("click", deleteProduct.bind(null, btnEl));
}
