// ============================================
// StokAlert Documentation JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSidebar();
    initSearch();
    initScrollSpy();
    initThemeToggle();
    initFAQ();
    initSmoothScroll();
    
    console.log('📚 StokAlert Documentation Loaded');
});

// ============================================
// Sidebar Toggle
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle sidebar on mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Close sidebar
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Close sidebar when clicking nav links on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

// ============================================
// Search Functionality
// ============================================

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('a');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            navLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                const listItem = link.parentElement;
                
                if (text.includes(query) || query === '') {
                    listItem.style.display = '';
                } else {
                    listItem.style.display = 'none';
                }
            });

            // Show message if no results
            const visibleLinks = Array.from(navLinks).filter(link => 
                link.parentElement.style.display !== 'none'
            );

            if (visibleLinks.length === 0 && query !== '') {
                showNoResults();
            } else {
                hideNoResults();
            }
        });
    }
}

function showNoResults() {
    const navMenu = document.getElementById('navMenu');
    let noResultsMsg = document.getElementById('no-results-msg');
    
    if (!noResultsMsg) {
        noResultsMsg = document.createElement('li');
        noResultsMsg.id = 'no-results-msg';
        noResultsMsg.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.875rem;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                <p>No results found</p>
            </div>
        `;
        navMenu.appendChild(noResultsMsg);
    }
}

function hideNoResults() {
    const noResultsMsg = document.getElementById('no-results-msg');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// ============================================
// Scroll Spy (Highlight active section)
// ============================================

function initScrollSpy() {
    const sections = document.querySelectorAll('.doc-section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -66%',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveLink(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    function updateActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }
}

// ============================================
// Theme Toggle (Dark/Light Mode)
// ============================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Save preference
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Update icon
            updateThemeIcon(isDark);
            
            // Add animation
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
}

function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// ============================================
// FAQ Accordion
// ============================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// Smooth Scroll
// ============================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerOffset = 90;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Copy Code to Clipboard
// ============================================

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('pre code');
    const code = codeElement.textContent;
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Update button state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
        
        // Show toast notification
        showToast('Code copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy code', 'error');
        console.error('Copy failed:', err);
    }
    
    // Remove textarea
    document.body.removeChild(textarea);
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9375rem',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease',
        maxWidth: '400px'
    });
    
    // Add animation styles
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.innerHTML = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to document
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        default:
            return 'info-circle';
    }
}

// ============================================
// Scroll to Top Button
// ============================================

// Create scroll to top button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.id = 'scrollTopBtn';
Object.assign(scrollTopBtn.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.25rem',
    boxShadow: '0 4px 15px rgba(255, 70, 24, 0.3)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    transition: 'all 0.3s ease'
});

document.body.appendChild(scrollTopBtn);

// Show/hide scroll button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

// Scroll to top on click
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hover effect
scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.style.transform = 'translateY(-5px)';
    scrollTopBtn.style.boxShadow = '0 6px 20px rgba(255, 70, 24, 0.4)';
});

scrollTopBtn.addEventListener('mouseleave', () => {
    scrollTopBtn.style.transform = 'translateY(0)';
    scrollTopBtn.style.boxShadow = '0 4px 15px rgba(255, 70, 24, 0.3)';
});

// ============================================
// Keyboard Shortcuts
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape: Close sidebar on mobile
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
    
    // Ctrl/Cmd + D: Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.click();
        }
    }
});

// ============================================
// Print Optimization
// ============================================

window.addEventListener('beforeprint', () => {
    // Expand all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.add('active');
    });
});

// ============================================
// Performance Monitoring
// ============================================

// Log page load performance
window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
    }
});

// ============================================
// Easter Egg
// ============================================

let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiPattern)) {
        showEasterEgg();
    }
});

function showEasterEgg() {
    const confetti = document.createElement('div');
    confetti.innerHTML = '🚀 📈 💰 🎯 📊 🌟 ⚡ 🔥 💎 🏆';
    Object.assign(confetti.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '5rem',
        zIndex: '99999',
        animation: 'celebrate 2s ease'
    });
    
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes celebrate {
            0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.5) rotate(180deg); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(confetti);
    
    showToast('🎉 Easter Egg Found! You\'re awesome!', 'success');
    
    setTimeout(() => {
        confetti.remove();
        style.remove();
    }, 2000);
}

// ============================================
// Service Worker Registration (Optional)
// ============================================

// Uncomment to enable offline support
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}
*/

// ============================================
// Export for testing
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        copyCode,
        showToast
    };
}

