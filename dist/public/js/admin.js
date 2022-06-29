const buttons = document.querySelectorAll("button");
const deleteProduct = (el) => {
    var _a, _b;
    const prodId = (_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("[name=productId]");
    const csrf = (_b = el.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector("[name=_csrf]");
    fetch(`/product/${prodId.value}`, {
        method: "DELETE",
        headers: {
            "csrf-token": csrf.value,
        },
    })
        .then((result) => console.log(result))
        .catch((err) => console.log(err));
};
let btnEl;
for (let btn of buttons) {
    btnEl = btn;
    btn.addEventListener("click", deleteProduct.bind(null, btnEl));
}
export {};
//# sourceMappingURL=admin.js.map