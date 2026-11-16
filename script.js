// ShaadiBanao - Interactive Web Scripts
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggleBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });
  }

  // FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // close all others
        faqItems.forEach((other) => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Contact Form Mock Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        alert('Thank you! Your message has been sent to our support team. We will get back to you within 24 hours.');
        contactForm.reset();
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }, 1000);
    });
  }

  // Account Deletion Form Handler
  const deleteForm = document.getElementById('deleteAccountForm');
  if (deleteForm) {
    deleteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const mobileInput = document.getElementById('delMobile').value;
      const confirmBox = confirm(`Are you sure you want to request permanent deletion for account associated with ${mobileInput}? All matches, messages, and profile photos will be permanently scrubbed.`);
      if (confirmBox) {
        alert('Your account deletion request has been submitted. As per Google Play and DPDP guidelines, all personal data will be completely deleted within 48 hours.');
        deleteForm.reset();
      }
    });
  }
});
