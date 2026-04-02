/**
 * Modern 2025 UI Interactions
 * Smooth animations, better UX, enhanced accessibility
 */

document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")
  const header = document.querySelector(".header")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
      // Improve accessibility
      hamburger.setAttribute("aria-expanded", isOpen)
      document.body.style.overflow = isOpen ? "hidden" : ""
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
        hamburger.setAttribute("aria-expanded", "false")
        document.body.style.overflow = ""
      })
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
        hamburger.setAttribute("aria-expanded", "false")
        document.body.style.overflow = ""
      }
    })
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href")
      if (targetId === "#") return
      
      const target = document.querySelector(targetId)
      if (target) {
        e.preventDefault()
        const headerHeight = header ? header.offsetHeight : 0
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20
        
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px",
  }

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        // Stagger animation for grid items
        const siblings = entry.target.parentElement?.children
        if (siblings) {
          Array.from(siblings).forEach((sibling, index) => {
            if (sibling.classList.contains("fade-in")) {
              sibling.style.transitionDelay = `${index * 80}ms`
            }
          })
        }
      }
    })
  }, observerOptions)

  // Apply fade-in to elements
  const fadeElements = document.querySelectorAll(
    ".service-card, .service-card-clean, .service-detailed-card, .value-card, .reason-item, .about-text, .about-image, .contact-info, .contact-form-container, .gallery-item"
  )
  
  fadeElements.forEach((el) => {
    el.classList.add("fade-in")
    fadeInObserver.observe(el)
  })

  // ============================================
  // HEADER SCROLL BEHAVIOR
  // ============================================
  let lastScrollTop = 0
  let ticking = false

  function updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (header) {
      // Add/remove scrolled class for shadow
      if (scrollTop > 10) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }

      // Hide/show on scroll (only on mobile or when scrolled far)
      if (scrollTop > 100) {
        if (scrollTop > lastScrollTop && scrollTop > 200) {
          // Scrolling down
          header.style.transform = "translateY(-100%)"
        } else {
          // Scrolling up
          header.style.transform = "translateY(0)"
        }
      } else {
        header.style.transform = "translateY(0)"
      }
    }

    lastScrollTop = scrollTop
    ticking = false
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader)
      ticking = true
    }
  }, { passive: true })

  // ============================================
  // PHONE VALIDATION
  // ============================================
  const phoneInput = document.getElementById("phone")
  const phoneError = document.getElementById("phoneError")
  const contactForm = document.getElementById("contactForm")

  function validatePhone() {
    if (!phoneInput) return true
    
    const phoneValue = phoneInput.value.trim()

    if (phoneValue === "") {
      hidePhoneError()
      return true
    }

    const digitsOnly = phoneValue.replace(/\D/g, "")

    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      hidePhoneError()
      return true
    } else {
      showPhoneError("Телефонният номер трябва да съдържа между 7 и 15 цифри")
      return false
    }
  }

  function showPhoneError(message) {
    if (phoneError) {
      phoneError.textContent = message
      phoneError.classList.add("visible")
    }
    if (phoneInput) {
      phoneInput.classList.add("error")
    }
  }

  function hidePhoneError() {
    if (phoneError) {
      phoneError.textContent = ""
      phoneError.classList.remove("visible")
    }
    if (phoneInput) {
      phoneInput.classList.remove("error")
    }
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", validatePhone)
  }

  // ============================================
  // FORM HANDLING
  // ============================================
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Validate phone before submitting
      if (phoneInput && phoneInput.value.trim() !== "") {
        if (!validatePhone()) {
          return false
        }
      }

      const formData = new FormData(this)
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      // Show loading state
      submitBtn.innerHTML = '<span class="loading"></span> Изпращане...'
      submitBtn.disabled = true
      submitBtn.style.opacity = "0.7"

      fetch("send-email.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            this.reset()
            hidePhoneError()
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
          submitBtn.textContent = originalText
          submitBtn.disabled = false
          submitBtn.style.opacity = "1"
        })
    })
  }

  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================
  function showNotification(message, type = "info") {
    // Remove existing notifications
    document.querySelectorAll(".notification").forEach(n => n.remove())
    
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    
    const bgColor = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#0077ed"
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="flex: 1;">${message}</span>
        <button class="notification-close" aria-label="Затвори" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px; line-height: 1;">&times;</button>
      </div>
    `

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 16px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 400px;
      font-size: 15px;
      font-weight: 500;
    `

    document.body.appendChild(notification)

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.style.transform = "translateX(0)"
      })
    })

    // Close functionality
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.addEventListener("click", () => closeNotification(notification))

    // Auto close after 5 seconds
    setTimeout(() => closeNotification(notification), 5000)
  }

  function closeNotification(notification) {
    if (!document.body.contains(notification)) return
    notification.style.transform = "translateX(120%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove()
      }
    }, 300)
  }

  // ============================================
  // FORM FIELD VALIDATION
  // ============================================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

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

    // Update field appearance
    if (isValid) {
      field.classList.remove("error")
      removeErrorMessage(field)
    } else {
      field.classList.add("error")
      showFieldError(field, errorMessage)
    }

    return isValid
  }

  function showFieldError(field, message) {
    removeErrorMessage(field)
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.textContent = message
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 13px;
      margin-top: 6px;
      font-weight: 500;
    `
    field.parentNode.appendChild(errorDiv)
  }

  function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }
  }

  // ============================================
  // LAZY LOADING IMAGES
  // ============================================
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute("data-src")
          }
          imageObserver.unobserve(img)
        }
      })
    }, { rootMargin: "50px" })

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img)
    })
  }

  // ============================================
  // CARD HOVER EFFECTS (non-touch devices)
  // ============================================
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".service-card, .service-card-clean, .value-card").forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      })
    })
  }

  // ============================================
  // KEYBOARD ACCESSIBILITY
  // ============================================
  document.addEventListener("keydown", (e) => {
    // Close mobile menu on Escape
    if (e.key === "Escape" && navMenu?.classList.contains("active")) {
      hamburger.classList.remove("active")
      navMenu.classList.remove("active")
      hamburger.setAttribute("aria-expanded", "false")
      document.body.style.overflow = ""
      hamburger.focus()
    }
  })

  // ============================================
  // PREFETCH LINKS ON HOVER
  // ============================================
  document.querySelectorAll('a[href^="/"]:not([href*="#"]), a[href$=".html"]').forEach(link => {
    link.addEventListener("mouseenter", function() {
      const href = this.getAttribute("href")
      if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
        const prefetch = document.createElement("link")
        prefetch.rel = "prefetch"
        prefetch.href = href
        document.head.appendChild(prefetch)
      }
    }, { once: true })
  })
})
