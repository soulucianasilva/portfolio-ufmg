// =========================================================
// Pequenas interações do site
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Formulário de contato: por enquanto é apenas visual,
  // então apenas evitamos o envio real e damos um feedback simples.
  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const button = contactForm.querySelector("button[type='submit']");
      if (!button) return;

      const textoOriginal = button.textContent;
      button.textContent = "Mensagem registrada (formulário ainda não envia de fato)";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = textoOriginal;
        button.disabled = false;
        contactForm.reset();
      }, 2500);
    });
  }
});
