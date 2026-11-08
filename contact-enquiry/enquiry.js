/**
 * Enquiry Form Controller for Thangam Farms (STP Chickens)
 * Handles client-side validation, loading/error states, submission, and product preselection.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('commercialEnquiryForm');
  if (!form) return;

  const productSelect = document.getElementById('productInterest');
  const confirmationBanner = document.getElementById('confirmationBanner');
  const confirmationTitle = document.getElementById('confirmationBannerTitle');
  const confirmationBody = document.getElementById('confirmationBannerBody');
  const errorBanner = document.getElementById('errorBanner');
  const errorMessageTitle = document.getElementById('errorMessageTitle');
  const errorMessageDetails = document.getElementById('errorMessageDetails');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitBtnIcon = document.getElementById('submitBtnIcon');

  const ALLOWED_PRODUCTS = [
    'Fresh Whole Chicken',
    'Skinless Chicken',
    'Chicken Cuts',
    'Bulk Chicken Supply',
    'Multiple Product Lines'
  ];

  // 1. PRODUCT & WHOLESALE RATE PRESELECTION FROM URL QUERY PARAMETERS
  const urlParams = new URLSearchParams(window.location.search);
  const productParam = urlParams.get('product');
  const subjectParam = urlParams.get('subject');

  if (productParam && productSelect) {
    const matchedProduct = ALLOWED_PRODUCTS.find(p => p.toLowerCase() === productParam.trim().toLowerCase());
    if (matchedProduct) {
      productSelect.value = matchedProduct;
    }
  }

  // Handle "Get Wholesale Rate" or subject parameter
  if (subjectParam) {
    const messageField = document.getElementById('message');
    if (messageField && !messageField.value) {
      messageField.value = `Inquiry Type: ${subjectParam.trim()} — Requesting today's prevailing wholesale commercial supply quote.`;
    }
  }

  // 2. SUBMISSION HANDLER
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous banners
    if (confirmationBanner) confirmationBanner.classList.add('hidden');
    if (errorBanner) errorBanner.classList.add('hidden');

    // Collect values
    const fullName = document.getElementById('fullName').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const productInterest = productSelect ? productSelect.value : '';
    const quantity = document.getElementById('quantity').value.trim();
    const deliveryLocation = document.getElementById('deliveryLocation').value.trim();
    const message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

    // Basic client check
    if (!fullName || !businessName || !phone || !email || !productInterest || !quantity || !deliveryLocation) {
      showError('Required Fields Missing', 'Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      const payload = {
        fullName,
        businessName,
        phone,
        email,
        productInterest,
        quantity,
        deliveryLocation,
        message
      };

      const response = await window.ThangamAPI.submitEnquiry(payload);

      if (response && response.success) {
        // Success display
        const enquiry = response.data;
        if (confirmationTitle) {
          confirmationTitle.textContent = `Enquiry Registered Successfully (#${enquiry.id})`;
        }
        if (confirmationBody) {
          confirmationBody.textContent = `Thank you, ${enquiry.fullName}. Your commercial allocation request for ${enquiry.productInterest} (${enquiry.quantity}) has been logged. Our dispatch desk in Kannampalayam will contact you at +91 ${enquiry.phone} within 2 hours.`;
        }
        if (confirmationBanner) {
          confirmationBanner.classList.remove('hidden');
          confirmationBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Reset form inputs only upon confirmed success
        form.reset();
        // Restore preselection if user was on a specific product page
        if (productParam && productSelect) {
          const matchedProduct = ALLOWED_PRODUCTS.find(p => p.toLowerCase() === productParam.trim().toLowerCase());
          if (matchedProduct) productSelect.value = matchedProduct;
        }
      } else {
        throw new Error((response && response.message) || 'Failed to submit commercial enquiry');
      }
    } catch (err) {
      let detailMsg = err.message || 'An unexpected error occurred. Please verify your details and try again.';
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        detailMsg = err.errors.map(e => e.message).join('; ');
      }
      showError('Commercial Enquiry Submission Error', detailMsg);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      if (submitBtnText) submitBtnText.textContent = 'Registering Enquiry...';
      if (submitBtnIcon) submitBtnIcon.textContent = 'hourglass_empty';
    } else {
      if (submitBtnText) submitBtnText.textContent = 'Submit Commercial Enquiry';
      if (submitBtnIcon) submitBtnIcon.textContent = 'send';
    }
  }

  function showError(title, message) {
    if (errorMessageTitle) errorMessageTitle.textContent = title;
    if (errorMessageDetails) errorMessageDetails.textContent = message;
    if (errorBanner) {
      errorBanner.classList.remove('hidden');
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

