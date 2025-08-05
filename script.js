document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")
  const header = document.querySelector(".header")

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

  // Header scroll effect with glass morphism
  let lastScrollTop = 0
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Add scrolled class for glass effect
    if (scrollTop > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }

    // Hide/show header on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      header.style.transform = "translateY(-100%)"
    } else {
      header.style.transform = "translateY(0)"
    }

    lastScrollTop = scrollTop
  })

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

  // Advanced Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        
        // Add staggered animation for grid items
        if (entry.target.classList.contains("service-card") || 
            entry.target.classList.contains("service-card-clean") ||
            entry.target.classList.contains("value-card") ||
            entry.target.classList.contains("reason-item")) {
          const siblings = Array.from(entry.target.parentNode.children)
          const index = siblings.indexOf(entry.target)
          entry.target.style.animationDelay = `${index * 0.1}s`
        }
      }
    })
  }, observerOptions)

  // Observe elements for fade-in animation
  document.querySelectorAll(`
    .service-card, 
    .service-card-clean, 
    .value-card, 
    .reason-item,
    .about-text, 
    .about-image,
    .contact-item,
    .gallery-item
  `).forEach((el) => {
    el.classList.add("fade-in")
    observer.observe(el)
  })

  // Phone validation functionality
  const phoneInput = document.getElementById("phone")
  const phoneError = document.getElementById("phoneError")
  const contactForm = document.getElementById("contactForm")

  if (phoneInput && contactForm) {
    phoneInput.addEventListener("input", validatePhone)

    contactForm.addEventListener("submit", (e) => {
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

    if (phoneValue === "") {
      hideError()
      return true
    }

    const digitsOnly = phoneValue.replace(/\D/g, "")

    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      hideError()
      return true
    } else {
      showError("Телефонният номер трябва да съдържа между 7 и 15 цифри")
      return false
    }
  }

  function showError(message) {
    if (phoneError) {
      phoneError.textContent = message
      phoneError.classList.add("visible")
      phoneInput.classList.add("error")
    }
  }

  function hideError() {
    if (phoneError) {
      phoneError.textContent = ""
      phoneError.classList.remove("visible")
      phoneInput.classList.remove("error")
    }
  }

  // Enhanced Contact form handling
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      if (phoneInput && phoneInput.value.trim() !== "") {
        if (!validatePhone()) {
          return false
        }
      }

      const formData = new FormData(this)
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      // Enhanced loading state
      submitBtn.innerHTML = '<span class="loading"></span> Изпращане...'
      submitBtn.disabled = true
      submitBtn.style.opacity = '0.7'

      fetch("send-email.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            this.reset()
            hideError()
            showNotification(data.message, "success")
            
            // Add success animation to form
            this.style.transform = 'scale(0.98)'
            setTimeout(() => {
              this.style.transform = 'scale(1)'
            }, 200)
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
          submitBtn.style.opacity = '1'
        })
    })
  }

  // Enhanced notification system
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    
    const colors = {
      success: "linear-gradient(135deg, #4CAF50, #45a049)",
      error: "linear-gradient(135deg, #f44336, #da190b)",
      info: "linear-gradient(135deg, #4facfe, #00f2fe)"
    }

    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1.2rem 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      transform: translateX(100%) scale(0.8);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 400px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0) scale(1)"
    }, 100)

    // Close functionality
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin-left: 1rem;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    `
    
    closeBtn.addEventListener("mouseenter", () => closeBtn.style.opacity = "1")
    closeBtn.addEventListener("mouseleave", () => closeBtn.style.opacity = "0.8")
    
    closeBtn.addEventListener("click", () => {
      notification.style.transform = "translateX(100%) scale(0.8)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 400)
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = "translateX(100%) scale(0.8)"
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 400)
      }
    }, 5000)
  }

  // Lazy loading for images with fade effect
  function lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]")
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.style.opacity = '0'
          img.src = img.dataset.src
          img.onload = () => {
            img.style.transition = 'opacity 0.6s ease'
            img.style.opacity = '1'
          }
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  }

  lazyLoadImages()

  // Enhanced hover effects for cards
  document.querySelectorAll(".service-card, .service-card-clean, .value-card, .reason-item").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-15px) scale(1.02)"
      this.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })

  // Parallax effect for hero section
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('.hero-image')
    
    parallaxElements.forEach(element => {
      const speed = 0.5
      element.style.transform = `translateY(${scrolled * speed}px)`
    })
  })

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

    // Add focus effects
    field.addEventListener("focus", function () {
      this.style.transform = 'scale(1.02)'
      this.style.transition = 'all 0.3s ease'
    })

    field.addEventListener("blur", function () {
      this.style.transform = 'scale(1)'
    })
  })

  function validateField(field) {
    const value = field.value.trim()
    let isValid = true
    let errorMessage = ""

    if (field.hasAttribute("required") && !value) {
      isValid = false
      errorMessage = "Това поле е задължително"
    }

    if (field.type === "email" && value && !validateEmail(value)) {
      isValid = false
      errorMessage = "Моля въведете валиден email адрес"
    }

    if (field.type === "tel" && field.id !== "phone" && value && !validatePhoneNumber(value)) {
      isValid = false
      errorMessage = "Моля въведете валиден телефонен номер"
    }

    if (isValid) {
      field.classList.remove("error")
      removeErrorMessage(field)
      field.style.borderColor = "#4CAF50"
      field.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.1)"
    } else {
      field.classList.add("error")
      field.style.borderColor = "#f44336"
      field.style.boxShadow = "0 0 0 3px rgba(244, 67, 54, 0.1)"
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
      font-size: 0.9rem;
      margin-top: 0.5rem;
      font-weight: 500;
      animation: slideInFromLeft 0.3s ease;
    `
    field.parentNode.appendChild(errorDiv)
  }

  function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.style.animation = "fadeOut 0.3s ease"
      setTimeout(() => existingError.remove(), 300)
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validatePhoneNumber(phone) {
    const re = /^[+]?[0-9\s\-()]{7,15}$/
    return re.test(phone)
  }

  // Create floating particles
  function createParticles() {
    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'particles'
    document.body.appendChild(particlesContainer)

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 6 + 's'
      particle.style.animationDuration = (Math.random() * 3 + 3) + 's'
      particlesContainer.appendChild(particle)
    }
  }

  // Initialize particles
  createParticles()

  // Add typing effect to hero title
  function typeWriter(element, text, speed = 100) {
    let i = 0
    element.innerHTML = ''
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i)
        i++
        setTimeout(type, speed)
      }
    }
    
    type()
  }

  // Initialize typing effect
  const heroTitle = document.querySelector('.hero-title')
  if (heroTitle) {
    const originalText = heroTitle.textContent
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 50)
    }, 1000)
  }

  // Add scroll progress indicator
  function createScrollProgress() {
    const progressBar = document.createElement('div')
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #4facfe, #00f2fe);
      z-index: 10000;
      transition: width 0.1s ease;
    `
    document.body.appendChild(progressBar)

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.body.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      progressBar.style.width = scrollPercent + '%'
    })
  }

  createScrollProgress()

  // Add smooth reveal animations for sections
  const revealElements = document.querySelectorAll('.section-title, .section-subtitle')
  revealElements.forEach((element, index) => {
    element.style.opacity = '0'
    element.style.transform = 'translateY(30px)'
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    element.style.transitionDelay = `${index * 0.2}s`
    
    observer.observe(element)
  })

  // Add click ripple effect to buttons
  document.querySelectorAll('.btn, .btn-clean, .btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span')
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `
      
      this.style.position = 'relative'
      this.style.overflow = 'hidden'
      this.appendChild(ripple)
      
      setTimeout(() => ripple.remove(), 600)
    })
  })

  // Add CSS for ripple animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
  `
  document.head.appendChild(style)

  console.log('🚀 Ultra Modern Website Loaded Successfully!')
})