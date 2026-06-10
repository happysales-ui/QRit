/**
 * QR Instructor Landing Page - JavaScript Controller
 * Features: Light/Dark Mode, Custom QR Generator, Stats Counter, Scroll Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Theme Toggle (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;
    
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuToggle.classList.toggle('active');
        
        // Burger menu lines transition
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                menuToggle.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // ==========================================
    // 3. Navbar scroll effect
    // ==========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 4. Tab Component (About Me Section)
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and target content
            button.classList.add('active');
            const contentElement = document.getElementById(`tab-${targetTab}`);
            if (contentElement) {
                contentElement.classList.add('active');
            }
        });
    });

    // ==========================================
    // 5. Interactive QR Code Generator (QRious)
    // ==========================================
    const qrInput = document.getElementById('qr-input');
    const qrColor = document.getElementById('qr-color');
    const qrSize = document.getElementById('qr-size');
    const generateBtn = document.getElementById('generate-qr-btn');
    const qrOutputBox = document.getElementById('qr-output-box');
    const downloadBtn = document.getElementById('download-qr-btn');
    
    let qr = null;
    
    // Function to generate the custom QR code
    function generateCustomQR(shouldScroll = true) {
        const text = qrInput.value.trim();
        if (!text) {
            alert('QR 코드에 들어갈 주소나 텍스트를 입력해 주세요.');
            return;
        }
        
        const size = parseInt(qrSize.value);
        const color = qrColor.value;
        
        qrOutputBox.style.display = 'flex';
        
        if (!qr) {
            qr = new QRious({
                element: document.getElementById('qr-canvas'),
                value: text,
                size: size,
                foreground: color,
                background: '#ffffff',
                level: 'H' // High correction level
            });
        } else {
            qr.set({
                value: text,
                size: size,
                foreground: color
            });
        }
        
        // Scroll slightly to reveal output on smaller screens
        if (shouldScroll === true) {
            qrOutputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Check if QRious library is loaded before activating features
    const checkQRiousInterval = setInterval(() => {
        if (typeof QRious !== 'undefined') {
            clearInterval(checkQRiousInterval);
            
            // Generate default QR code on load
            generateCustomQR(false);
            
            generateBtn.addEventListener('click', () => generateCustomQR(true));
            
            // Update color hex code label when selected
            qrColor.addEventListener('input', (e) => {
                document.querySelector('.color-hex').textContent = e.target.value.toUpperCase();
            });
            
            // Download QR code button handler
            downloadBtn.addEventListener('click', () => {
                const canvas = document.getElementById('qr-canvas');
                const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                
                const link = document.createElement('a');
                link.download = `QR_Instructor_custom_code.png`;
                link.href = image;
                link.click();
            });
        }
    }, 100);

    // ==========================================
    // 6. Scroll Animations (Intersection Observer)
    // ==========================================
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                
                // Trigger stats counter animation if it's the stats container
                if (entry.target.classList.contains('hero-stats') || entry.target.querySelector('.stat-num')) {
                    animateStatsCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => animationObserver.observe(el));
    
    // Animate stats numbers
    let statsAnimated = false;
    function animateStatsCounters() {
        if (statsAnimated) return;
        statsAnimated = true;
        
        const statNums = document.querySelectorAll('.stat-num');
        statNums.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const duration = 1500; // 1.5s
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(easeProgress * target);
                
                num.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    num.textContent = target.toLocaleString();
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }
    
    // Manually trigger observer for elements initially in viewport
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach(child => {
            child.classList.add('appear');
        });
        document.querySelectorAll('.hero-visual').forEach(child => {
            child.classList.add('appear');
        });
        animateStatsCounters();
    }, 200);

    // ==========================================
    // 7. Scroll Spy (Active Navigation Links)
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-link');
    
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-70px 0px -40% 0px'
    });
    
    sections.forEach(section => scrollSpyObserver.observe(section));

    // ==========================================
    // 8. Contact Form Handling
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simple form validation check
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        const privacyChecked = document.getElementById('contact-privacy').checked;
        
        if (!name || !phone || !email || !message || !privacyChecked) {
            alert('필수 입력 항목을 모두 작성하고 개인정보 이용에 동의해 주세요.');
            return;
        }
        
        // Simulate premium success feedback
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <span>전송 중...</span>
        `;
        
        // Keyframe spin style insertion
        if (!document.getElementById('spin-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spin-keyframes';
            style.textContent = '@keyframes spin { 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            // Replace form contents with a beautiful thank you card
            const formCard = contactForm.closest('.contact-form-card');
            formCard.style.opacity = '0';
            formCard.style.transform = 'scale(0.95)';
            formCard.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                formCard.innerHTML = `
                    <div class="thank-you-box" style="text-align: center; padding: 2rem 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; animation: fadeIn 0.5s ease forwards;">
                        <div class="success-icon-wrapper" style="width: 70px; height: 70px; border-radius: 50%; background-color: var(--accent-glow); color: var(--accent); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h3 style="font-size: 1.8rem; margin-top: 1rem;">문의가 성공적으로 접수되었습니다!</h3>
                        <p style="color: var(--text-muted); max-width: 360px; line-height: 1.6; font-size: 1rem;">
                            보내주신 상세 내용을 검토한 후, 기재해 주신 연락처(<span style="color: var(--accent); font-weight: 600;">${phone}</span>) 또는 이메일로 24시간 내에 빠르게 연락 드리겠습니다.
                        </p>
                        <button onclick="window.location.reload();" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">새로운 문의 작성</button>
                    </div>
                `;
                formCard.style.opacity = '1';
                formCard.style.transform = 'scale(1)';
            }, 500);
            
        }, 1500);
    });

    // ==========================================
    // 9. Scroll to Top Button
    // ==========================================
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
