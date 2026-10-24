const PRODUCTS = [
  { id: 1, name: "Кружка тестировщика", price: 590 },
  { id: 2, name: "Футболка «It works on my machine»", price: 1490 },
  { id: 3, name: "Стикерпак «Баги»", price: 290 },
  { id: 4, name: "Резиновая уточка для дебага", price: 750 },
];

const PROMO_CODES = { SALE10: 10 };
const DELIVERY_PRICE = 300;
const FREE_DELIVERY_FROM = 3000;

const cart = {};
let promoPercent = 0;

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function renderProducts() {
  const container = document.getElementById("products");
  container.innerHTML = PRODUCTS.map((p) => `
    <div class="product" data-testid="product-${p.id}">
      <h3>${p.name}</h3>
      <p class="price">${formatPrice(p.price)}</p>
      <button type="button" onclick="addToCart(${p.id})">В корзину</button>
    </div>`).join("");
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function changeQty(id, delta) {
  cart[id] = cart[id] + delta;
  renderCart();
}

function getSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    return sum + product.price * qty;
  }, 0);
}

function getDiscount(subtotal) {
  if (!promoPercent) return 0;
  return promoPercent;
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    container.innerHTML = '<p class="empty">Корзина пуста</p>';
  } else {
    container.innerHTML = ids.map((id) => {
      const product = PRODUCTS.find((p) => p.id === Number(id));
      return `
        <div class="cart-item" data-testid="cart-item-${id}">
          <span>${product.name}</span>
          <span class="qty">
            <button type="button" onclick="changeQty(${id}, -1)">−</button>
            <span data-testid="qty-${id}">${cart[id]}</span>
            <button type="button" onclick="changeQty(${id}, 1)">+</button>
          </span>
        </div>`;
    }).join("");
  }

  const subtotal = getSubtotal();
  const discount = getDiscount(subtotal);
  document.getElementById("subtotal").textContent = formatPrice(subtotal);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE;
  document.getElementById("discount").textContent = formatPrice(discount);
  document.getElementById("delivery").textContent = delivery === 0 && subtotal > 0 ? "бесплатно" : formatPrice(delivery);
  document.getElementById("total").textContent = formatPrice(subtotal - discount + delivery);
}

function applyPromo() {
  const code = document.getElementById("promo-input").value.trim().toUpperCase();
  const message = document.getElementById("promo-message");
  if (PROMO_CODES[code]) {
    promoPercent = PROMO_CODES[code];
    message.textContent = `Промокод ${code} применён: скидка ${promoPercent}%`;
    message.className = "promo-message ok";
  } else {
    promoPercent = 0;
    message.textContent = "Промокод не найден";
    message.className = "promo-message error";
  }
  renderCart();
}

async function loadBuildInfo() {
  try {
    const response = await fetch("version.json", { cache: "no-store" });
    if (!response.ok) return;
    const info = await response.json();
    document.getElementById("build-info").textContent =
      `${info.version} · ветка ${info.branch} · коммит ${info.commit} · раскатано ${info.deployed_at}`;
    const badge = document.getElementById("stand-badge");
    badge.textContent = info.stand.toUpperCase();
    badge.className = `badge ${info.stand}`;
  } catch (e) {
    // локальный запуск без version.json
  }
}

document.getElementById("promo-apply").addEventListener("click", applyPromo);
renderProducts();
renderCart();
loadBuildInfo();
