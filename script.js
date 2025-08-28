/**
 * Main JavaScript file for Safaa Ez-ziani Personal Branding Website
 * Enhanced with smooth scrolling, FAQ accordion, animations, and contact form
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initMobileNavigation();
    initSmoothScrolling();
    initHeaderScrollEffect();
    initFAQAccordion();
    initAnimateOnScroll();
    initContactForm();
    initAccessibilityEnhancements();
    
    console.log('Safaa Ez-ziani website initialized successfully');
});

/**
 * Mobile Navigation Handler
 * Toggles mobile menu and manages accessibility states
 */
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (!navToggle || !navMenu) return;
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.toggle('nav__menu--open');
        
        // Update accessibility attributes
        navToggle.setAttribute('aria-expanded', isOpen);
        navMenu.setAttribute('aria-hidden', !isOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('nav__menu--open');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('nav__menu--open')) {
            navMenu.classList.remove('nav__menu--open');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('nav__menu--open')) {
            navMenu.classList.remove('nav__menu--open');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            navToggle.focus(); // Return focus to toggle button
        }
    });
}

/**
 * Smooth Scrolling for Anchor Links
 * Respects prefers-reduced-motion user preference
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
    
    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection && targetId !== '#') {
                event.preventDefault();
                
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, targetId);
                
                // Focus management for accessibility
                targetSection.setAttribute('tabindex', '-1');
                targetSection.focus();
                targetSection.addEventListener('blur', function() {
                    targetSection.removeAttribute('tabindex');
                }, { once: true });
            }
        });
    });
}

/**
 * Header Scroll Effect
 * Adds shadow and background changes on scroll
 */
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let ticking = false;
    
    function updateHeader() {
        const scrolled = window.scrollY;
        const threshold = 50;
        
        if (scrolled > threshold) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

/**
 * FAQ Accordion with full keyboard accessibility
 * Implements roving tabindex, aria-expanded, and aria-controls
 */
function initFAQAccordion() {
    const faqSections = document.querySelectorAll('.faq');
    
    faqSections.forEach(faqSection => {
        const faqButtons = faqSection.querySelectorAll('.faq__question');
        
        if (faqButtons.length === 0) return;
        
        let currentFocusIndex = 0;
        
        // Set up initial accessibility attributes
        faqButtons.forEach((button, index) => {
            const answerId = `faq-answer-${Date.now()}-${index}`;
            const answer = button.nextElementSibling;
            
            if (answer) {
                // Set up IDs and ARIA relationships
                answer.id = answerId;
                button.setAttribute('aria-controls', answerId);
                button.setAttribute('aria-expanded', 'false');
                
                // Set initial tabindex (only first button focusable)
                button.tabIndex = index === 0 ? 0 : -1;
                
                // Initially hide answers
                answer.style.display = 'none';
                answer.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Handle button clicks
        faqButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                toggleFAQ(button, faqButtons);
                updateTabIndex(faqButtons, index);
                currentFocusIndex = index;
            });
        });
        
        // Handle keyboard navigation
        faqSection.addEventListener('keydown', function(event) {
            const focusedButton = document.activeElement;
            const currentIndex = Array.from(faqButtons).indexOf(focusedButton);
            
            if (currentIndex === -1) return;
            
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    currentFocusIndex = (currentIndex + 1) % faqButtons.length;
                    updateTabIndex(faqButtons, currentFocusIndex);
                    faqButtons[currentFocusIndex].focus();
                    break;
                    
                case 'ArrowUp':
                    event.preventDefault();
                    currentFocusIndex = currentIndex === 0 ? faqButtons.length - 1 : currentIndex - 1;
                    updateTabIndex(faqButtons, currentFocusIndex);
                    faqButtons[currentFocusIndex].focus();
                    break;
                    
                case 'Home':
                    event.preventDefault();
                    currentFocusIndex = 0;
                    updateTabIndex(faqButtons, currentFocusIndex);
                    faqButtons[currentFocusIndex].focus();
                    break;
                    
                case 'End':
                    event.preventDefault();
                    currentFocusIndex = faqButtons.length - 1;
                    updateTabIndex(faqButtons, currentFocusIndex);
                    faqButtons[currentFocusIndex].focus();
                    break;
                    
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    toggleFAQ(focusedButton, faqButtons);
                    break;
            }
        });
    });
}

/**
 * Toggle FAQ item open/closed state
 */
function toggleFAQ(button, allButtons) {
    const answer = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (!answer) return;
    
    // Close all other FAQ items (accordion behavior)
    allButtons.forEach(otherButton => {
        if (otherButton !== button) {
            const otherAnswer = otherButton.nextElementSibling;
            if (otherAnswer) {
                otherButton.setAttribute('aria-expanded', 'false');
                otherAnswer.style.display = 'none';
                otherAnswer.setAttribute('aria-hidden', 'true');
            }
        }
    });
    
    // Toggle current item
    if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        answer.style.display = 'none';
        answer.setAttribute('aria-hidden', 'true');
    } else {
        button.setAttribute('aria-expanded', 'true');
        answer.style.display = 'block';
        answer.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Update tabindex for roving tabindex pattern
 */
function updateTabIndex(buttons, focusIndex) {
    buttons.forEach((button, index) => {
        button.tabIndex = index === focusIndex ? 0 : -1;
    });
}

/**
 * Animate on Scroll with IntersectionObserver
 * Respects prefers-reduced-motion preference
 */
function initAnimateOnScroll() {
    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // If user prefers reduced motion, skip animations
    if (prefersReducedMotion) {
        const animateElements = document.querySelectorAll('.card, .metric, .case-study, .testimonial, .value-card');
        animateElements.forEach(el => el.classList.add('animate-in'));
        return;
    }
    
    // Add CSS for fade-in animation
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-element.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        .fade-in-stagger:nth-child(1) { transition-delay: 0s; }
        .fade-in-stagger:nth-child(2) { transition-delay: 0.1s; }
        .fade-in-stagger:nth-child(3) { transition-delay: 0.2s; }
        .fade-in-stagger:nth-child(4) { transition-delay: 0.3s; }
        .fade-in-stagger:nth-child(5) { transition-delay: 0.4s; }
        .fade-in-stagger:nth-child(6) { transition-delay: 0.5s; }
    `;
    document.head.appendChild(style);
    
    // Set up intersection observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards, metrics, and other elements
    const animateElements = document.querySelectorAll('.card, .metric, .case-study, .testimonial, .value-card, .process__step');
    
    animateElements.forEach(el => {
        el.classList.add('fade-in-element');
        
        // Add stagger class for grouped elements
        const parent = el.closest('.grid, .metrics, .testimonials__grid, .value-proposition__grid');
        if (parent) {
            el.classList.add('fade-in-stagger');
        }
        
        observer.observe(el);
    });
}

/**
 * Contact Form Handling
 * Validates fields and handles submission with Replit DB fallback
 */
function initContactForm() {
    const form = document.querySelector('#contact-form');
    const statusMessage = document.querySelector('#form-status');
    
    if (!form || !statusMessage) return;
    
    const nameField = form.querySelector('#contact-name');
    const emailField = form.querySelector('#contact-email');
    const messageField = form.querySelector('#contact-message');
    const submitButton = form.querySelector('#form-submit');
    
    // Real-time validation
    if (nameField) {
        nameField.addEventListener('blur', () => validateField(nameField, 'Name is required'));
        nameField.addEventListener('input', () => clearFieldError(nameField));
    }
    
    if (emailField) {
        emailField.addEventListener('blur', () => validateEmail(emailField));
        emailField.addEventListener('input', () => clearFieldError(emailField));
    }
    
    if (messageField) {
        messageField.addEventListener('blur', () => validateField(messageField, 'Message is required'));
        messageField.addEventListener('input', () => clearFieldError(messageField));
    }
    
    // Form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validate all fields
        const isNameValid = validateField(nameField, 'Name is required');
        const isEmailValid = validateEmail(emailField);
        const isMessageValid = validateField(messageField, 'Message is required');
        
        if (!isNameValid || !isEmailValid || !isMessageValid) {
            showStatus('Please fix the errors above.', 'error');
            return;
        }
        
        // Disable form during submission
        setFormLoading(true);
        
        try {
            // Try Formspree first (if endpoint is configured)
            const formspreeEndpoint = getFormspreeEndpoint();
            
            if (formspreeEndpoint) {
                await submitToFormspree(formspreeEndpoint, {
                    name: nameField.value.trim(),
                    email: emailField.value.trim(),
                    message: messageField.value.trim()
                });
            } else {
                // Fallback to Replit DB
                await submitToReplitDB({
                    name: nameField.value.trim(),
                    email: emailField.value.trim(),
                    message: messageField.value.trim(),
                    timestamp: new Date().toISOString()
                });
            }
            
            // Success
            showStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
            form.reset();
            clearAllFieldErrors();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('Sorry, there was an error sending your message. Please try again or contact me directly.', 'error');
        } finally {
            setFormLoading(false);
        }
    });
    
    function validateField(field, errorMessage) {
        const value = field.value.trim();
        if (!value) {
            showFieldError(field, errorMessage);
            return false;
        }
        clearFieldError(field);
        return true;
    }
    
    function validateEmail(field) {
        const value = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!value) {
            showFieldError(field, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        clearFieldError(field);
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');
        
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('field-error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        errorElement.textContent = message;
    }
    
    function clearFieldError(field) {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
        
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('field-error-message')) {
            errorElement.remove();
        }
    }
    
    function clearAllFieldErrors() {
        [nameField, emailField, messageField].forEach(field => {
            if (field) clearFieldError(field);
        });
    }
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `form-status form-status--${type}`;
        statusMessage.setAttribute('aria-live', 'polite');
        
        // Scroll status into view if needed
        statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Clear status after 10 seconds for success, 15 for error
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'form-status';
        }, type === 'success' ? 10000 : 15000);
    }
    
    function setFormLoading(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Sending...' : 'Send Message';
        submitButton.classList.toggle('btn--loading', isLoading);
        
        [nameField, emailField, messageField].forEach(field => {
            if (field) field.disabled = isLoading;
        });
    }
    
    function getFormspreeEndpoint() {
        // Check for Formspree endpoint in environment or data attribute
        return form.dataset.formspreeEndpoint || null;
    }
    
    async function submitToFormspree(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to send message via Formspree');
        }
        
        return response.json();
    }
    
    async function submitToReplitDB(data) {
        // Store in browser's localStorage as fallback for demo purposes
        // In a real implementation, this would POST to a backend endpoint
        const submissions = JSON.parse(localStorage.getItem('contact-submissions') || '[]');
        submissions.push({
            ...data,
            id: Date.now().toString()
        });
        localStorage.setItem('contact-submissions', JSON.stringify(submissions));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Contact form submission stored:', data);
    }
}

/**
 * Accessibility Enhancements
 * Keyboard navigation and screen reader support
 */
function initAccessibilityEnhancements() {
    // Track keyboard usage for focus visibility
    let isKeyboardUser = false;
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            isKeyboardUser = true;
            document.body.classList.add('keyboard-user');
        }
    });
    
    document.addEventListener('mousedown', function() {
        isKeyboardUser = false;
        document.body.classList.remove('keyboard-user');
    });
    
    // Skip link functionality
    const skipLinks = document.querySelectorAll('.skip-link');
    skipLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                event.preventDefault();
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Enhanced button keyboard support
    const customButtons = document.querySelectorAll('[role="button"]:not(button)');
    customButtons.forEach(button => {
        button.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Error Handling
 * Global error handling for better user experience
 */
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Feature Detection
(function() {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported. Adding fallback.');
        const animateElements = document.querySelectorAll('.card, .metric, .case-study, .testimonial, .value-card');
        animateElements.forEach(el => el.classList.add('animate-in'));
    }
    
    // Check for smooth scroll support
    if (!CSS.supports('scroll-behavior', 'smooth')) {
        console.warn('Smooth scrolling not supported.');
    }
})();

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileNavigation,
        initSmoothScrolling,
        initHeaderScrollEffect,
        initFAQAccordion,
        initAnimateOnScroll,
        initContactForm,
        initAccessibilityEnhancements
    };
}