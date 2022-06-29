const buttons = document.querySelectorAll("button");
const deleteProduct = (el) => {
    var _a;
    const input = (_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("[name=productId]");
    console.log(input.value);
};
let btnEl;
for (let btn of buttons) {
    btnEl = btn;
    btn.addEventListener("click", deleteProduct.bind(null, btnEl));
}
export {};
// document.getElementById("btn-sel")!.addEventListener("click", deleteProduct);
//# sourceMappingURL=admin.js.map