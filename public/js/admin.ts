const buttons = document.querySelectorAll("button");

const deleteProduct = (el: HTMLButtonElement | HTMLInputElement) => {
  const input = el.parentElement?.querySelector(
    "[name=productId]"
  ) as HTMLInputElement;
  console.log(input.value);
};
let btnEl: HTMLButtonElement;
for (let btn of buttons) {
  btnEl = btn;
  btn.addEventListener("click", deleteProduct.bind(null, btnEl));
}

// document.getElementById("btn-sel")!.addEventListener("click", deleteProduct);
