// Добавям само новата функционалност за валидация на телефонен номер
// Запазвам всичко останало от оригиналния файл

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Fade in animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
      }
    })
  }, observerOptions)

  // Observe elements for fade-in animation
  document.querySelectorAll(".service-card, .service-detailed-card, .about-text, .about-image").forEach((el) => {
    el.classList.add("fade-in")
    observer.observe(el)
  })

  // Добавям валидация на телефонен номер
  const phoneInput = document.getElementById("phone")
  const phoneError = document.getElementById("phoneError")
  const contactForm = document.getElementById("contactForm")

  if (phoneInput && contactForm) {
    // Валидация при въвеждане
    phoneInput.addEventListener("input", validatePhone)

    // Валидация при изпращане на формата
    contactForm.addEventListener("submit", (e) => {
      // Ако има телефон, валидирай го
      if (phoneInput.value.trim() !== "") {
        if (!validatePhone()) {
          e.preventDefault()
          return false
        }
      }
    })
  }

  function validatePhone() {
    const phoneValue = phoneInput.value.trim()

    // Ако полето е празно, не валидираме (не е задължително)
    if (phoneValue === "") {
      hideError()
      return true
    }

    // Премахваме всички символи освен цифри
    const digitsOnly = phoneValue.replace(/\D/g, "")

    // Проверяваме дали има между 7 и 15 цифри (стандартен диапазон за телефонни номера)
    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      hideError()
      return true
    } else {
      showError("Телефонният номер трябва да съдържа между 7 и 15 цифри")
      return false
    }
  }

  function showError(message) {
    phoneError.textContent = message
    phoneError.classList.add("visible")
    phoneInput.classList.add("error")
  }

  function hideError() {
    phoneError.textContent = ""
    phoneError.classList.remove("visible")
    phoneInput.classList.remove("error")
  }

  // Contact form handling
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Валидация на телефонен номер преди изпращане
      if (phoneInput && phoneInput.value.trim() !== "") {
        if (!validatePhone()) {
          return false
        }
      }

      // Get form data
      const formData = new FormData(this)

      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.innerHTML = '<span class="loading"></span> Изпращане...'
      submitBtn.disabled = true

      // Send form data to PHP script
      fetch("send-email.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Reset form on success
            this.reset()
            hideError() // Скрий грешките при успешно изпращане
            showNotification(data.message, "success")
          } else {
            showNotification(data.message, "error")
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          showNotification("Възникна грешка при изпращането. Моля опитайте отново.", "error")
        })
        .finally(() => {
          // Reset button
          submitBtn.textContent = originalText
          submitBtn.disabled = false
        })
    })
  }

  // Header scroll effect
  let lastScrollTop = 0
  const header = document.querySelector(".header")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      header.style.transform = "translateY(-100%)"
    } else {
      // Scrolling up
      header.style.transform = "translateY(0)"
    }

    lastScrollTop = scrollTop
  })

  // Notification system
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#1E88E5"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Close functionality
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.addEventListener("click", () => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 5000)
  }

  // Lazy loading for images
  function lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]")
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  }

  // Initialize lazy loading
  lazyLoadImages()

  // Service card hover effects
  document.querySelectorAll(".service-card, .service-detailed-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })

  // Price calculator (if needed for future enhancements)
  function calculatePrice(serviceType, duration = 1) {
    const prices = {
      "small-standard": 25,
      "small-premium": 35,
      "medium-standard": 45,
      "medium-premium": 60,
      "large-standard": 75,
      "large-premium": 95,
      maintenance: 15,
    }

    return prices[serviceType] * duration || 0
  }

  // Form validation helpers
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validatePhoneNumber(phone) {
    const re = /^[+]?[0-9\s\-()]{7,15}$/
    return re.test(phone)
  }

  // Enhanced form validation
  document.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("blur", function () {
      validateField(this)
    })

    field.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        validateField(this)
      }
    })
  })

  function validateField(field) {
    const value = field.value.trim()
    let isValid = true
    let errorMessage = ""

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false
      errorMessage = "Това поле е задължително"
    }

    // Email validation
    if (field.type === "email" && value && !validateEmail(value)) {
      isValid = false
      errorMessage = "Моля въведете валиден email адрес"
    }

    // Phone validation (само за старото поле, новото има своя валидация)
    if (field.type === "tel" && field.id !== "phone" && value && !validatePhoneNumber(value)) {
      isValid = false
      errorMessage = "Моля въведете валиден телефонен номер"
    }

    // Update field appearance
    if (isValid) {
      field.classList.remove("error")
      removeErrorMessage(field)
      field.style.borderColor = "#4CAF50"
    } else {
      field.classList.add("error")
      field.style.borderColor = "#f44336"
      showErrorMessage(field, errorMessage)
    }

    return isValid
  }

  function showErrorMessage(field, message) {
    removeErrorMessage(field)
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.textContent = message
    errorDiv.style.cssText = `
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    `
    field.parentNode.appendChild(errorDiv)
  }

  function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }
  }
})
