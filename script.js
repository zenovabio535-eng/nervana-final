const forms = document.querySelectorAll("[data-order-form]");
const scrollLinks = document.querySelectorAll("[data-scroll-order]");
const accordions = document.querySelectorAll("[data-accordion]");
const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
const offerCards = document.querySelectorAll("[data-offer-card]");
const offerInputs = document.querySelectorAll("input[name='offer']");
const totalPriceDisplay = document.querySelector("[data-total-price-display]");
const orderQuantityInput = document.querySelector("[data-order-quantity]");
const orderTotalPriceInput = document.querySelector("[data-order-total-price]");
const WHATSAPP_NUMBER = "212602667636";
const WHATSAPP_MESSAGE = "سلام، بغيت نسول على NERVANA";
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxOTIVLSkv97dtcMTITAD3FBO54WWM9T8ZpLNEsZFSSbSLKP5y-M5KBqITwGm9TZmWB/exec";

const normalizePhone = (value) => value.replace(/\s+/g, "");
const isMoroccanPhone = (value) => /^(?:\+212|212|0)([5-7]\d{8})$/.test(normalizePhone(value));

const messages = {
  name: "كتب الاسم الكامل ديالك.",
  phone: "كتب رقم هاتف مغربي صحيح.",
  confirm: "تأكيد رقم الهاتف خاصو يكون نفس الرقم.",
  address: "كتب المدينة أو العنوان ديالك.",
  offer: "اختار العرض ديالك.",
  endpoint: "خاص رابط Google Sheets باش نسجلو الطلب.",
  success: "توصلنا بالطلب ديالك بنجاح. غادي نتاصلو بيك باش نأكدوه.",
  error: "وقع مشكل فإرسال الطلب. عاود جرب أو تواصل معنا فالواتساب.",
};

const offerLabels = {
  1: "كيس واحد",
  2: "كيسان",
  3: "3 أكياس",
};

const syncSelectedOffer = () => {
  const selectedOffer = document.querySelector("input[name='offer']:checked");
  if (!selectedOffer) return;

  const quantity = selectedOffer.dataset.quantity || "";
  const totalPrice = selectedOffer.dataset.totalPrice || "";

  offerCards.forEach((card) => {
    card.classList.toggle("is-selected", card.contains(selectedOffer));
  });

  if (totalPriceDisplay) totalPriceDisplay.textContent = `${totalPrice} DH`;
  if (orderQuantityInput) orderQuantityInput.value = quantity;
  if (orderTotalPriceInput) orderTotalPriceInput.value = totalPrice;
};

offerInputs.forEach((input) => {
  input.addEventListener("change", syncSelectedOffer);
});

syncSelectedOffer();

forms.forEach((form) => {
  const error = form.querySelector(".form-error");
  const submit = form.querySelector("button[type='submit']");
  const originalSubmitText = submit.textContent;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    const previousSuccess = form.querySelector(".form-success");
    if (previousSuccess) previousSuccess.remove();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const phoneConfirm = String(data.get("phoneConfirm") || "").trim();
    const address = String(data.get("address") || "").trim();
    const offer = String(data.get("offer") || "").trim();
    const quantity = String(data.get("quantity") || "").trim();
    const totalPrice = String(data.get("total_price") || "").trim();
    const orderPayload = {
      full_name: name,
      phone,
      phone_confirmation: phoneConfirm,
      city_address: address,
      selected_offer: offerLabels[quantity] || offer,
      quantity: Number(quantity),
      total_price: Number(totalPrice),
    };

    if (!name) return (error.textContent = messages.name);
    if (!isMoroccanPhone(phone)) return (error.textContent = messages.phone);
    if (normalizePhone(phone) !== normalizePhone(phoneConfirm)) return (error.textContent = messages.confirm);
    if (!address) return (error.textContent = messages.address);
    if (!offer) return (error.textContent = messages.offer);
    if (!GOOGLE_SHEETS_WEB_APP_URL) return (error.textContent = messages.endpoint);

    error.textContent = "";
    form.dataset.orderPayload = JSON.stringify(orderPayload);
    submit.disabled = true;
    submit.textContent = "كنرسلو الطلب...";

    try {
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(orderPayload),
      });

      const success = document.createElement("p");
      success.className = "form-success";
      success.textContent = messages.success;
      form.append(success);
      submit.textContent = "تم إرسال الطلب";
    } catch (sendError) {
      error.textContent = messages.error;
      submit.disabled = false;
      submit.textContent = originalSubmitText;
    }
  });
});

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

whatsappLinks.forEach((link) => {
  if (WHATSAPP_NUMBER) {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    link.target = "_blank";
    link.rel = "noopener";
    return;
  }

  link.href = "#";
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.alert("رقم الواتساب باقي خاصو يتزاد.");
  });
});

accordions.forEach((accordion) => {
  accordion.querySelectorAll("details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      accordion.querySelectorAll("details[open]").forEach((openItem) => {
        if (openItem !== item) openItem.removeAttribute("open");
      });
    });
  });
});
