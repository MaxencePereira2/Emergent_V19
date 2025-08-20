(function() {
    // Set year in footer
    const YEAR = document.getElementById('year');
    if (YEAR) YEAR.textContent = new Date().getFullYear();

    const EMAIL = 'contact@alesium.fr';

    // Recall form handler
    document.querySelector('.recall-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const num = e.target.tel.value.trim();
        if (!num) {
            alert('Merci d\'indiquer votre numéro.');
            return;
        }
        const subject = `Rappeler ce numéro ASAP: "${num}"`;
        const body = `Numéro à rappeler : ${num}\n\n(Envoyé depuis alesium.fr)`;
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    // EmailJS initialization
    (function(){
        emailjs.init("kYuOmVqmEYAp7mfjU"); // Initialize with User ID
    })();

    // Contact form handler with EmailJS integration
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.querySelector('.form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.contact-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            
            try {
                // Step 1: Save to database via backend
                const backendUrl = window.location.origin.includes('localhost') ? 
                    'http://localhost:8001' : 
                    (window.REACT_APP_BACKEND_URL || 'https://alesium-landing.preview.emergentagent.com');
                
                const response = await fetch(`${backendUrl}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de l\'enregistrement');
                }
                
                // Step 2: Send emails via EmailJS (client-side with SDK)
                await sendEmailsViaEmailJS(data);
                
                // Success
                formStatus.style.display = 'block';
                formStatus.style.color = '#2d6e3e';
                formStatus.textContent = '✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais. Un email de confirmation vous a été envoyé.';
                contactForm.reset();
                
            } catch (error) {
                // Error
                formStatus.style.display = 'block';
                formStatus.style.color = '#d32f2f';
                formStatus.textContent = '❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.';
                console.error('Contact form error:', error);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // EmailJS integration function using official SDK
    async function sendEmailsViaEmailJS(data) {
        const timestamp = new Date().toLocaleString('fr-FR');
        
        // Send notification email to Alesium
        const notificationParams = {
            to_email: 'contact@alesium.fr',
            to_name: 'Alesium',
            from_name: data.name,
            from_email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone || 'Non renseigné',
            timestamp: timestamp,
            site_name: 'Alesium.fr'
        };
        
        try {
            console.log('📧 Sending notification email to Alesium...');
            await emailjs.send(
                'service_jc6o6xn',           // Service ID
                'template_4ur9prj',          // Notification template ID
                notificationParams,          // Template parameters
                'kYuOmVqmEYAp7mfjU'         // User ID
            );
            console.log('✅ Notification email sent to Alesium');
        } catch (error) {
            console.error('❌ Error sending notification email:', error);
            throw error;
        }
        
        // Send auto-reply confirmation to client
        const autoReplyParams = {
            to_email: data.email,        // IMPORTANT: Destinataire du mail de confirmation
            to_name: data.name,          // Nom du destinataire
            client_name: data.name,
            client_email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone || 'Non renseigné',
            timestamp: timestamp
        };
        
        try {
            console.log('📧 Sending confirmation email to client...');
            const result = await emailjs.send(
                'service_jc6o6xn',           // Service ID  
                'template_tnqh3o9',          // Auto-reply template ID
                autoReplyParams,             // Template parameters
                'kYuOmVqmEYAp7mfjU'         // User ID
            );
            console.log('✅ Confirmation email sent to client successfully:', result);
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
            console.error('Auto-reply params:', autoReplyParams);
            // Don't throw error for auto-reply failure - notification is more important
            console.warn('⚠️ Continuing despite auto-reply failure');
        }
    }

    // Lightbox functionality for project images
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const lightboxPrev = lightbox?.querySelector('.prev');
    const lightboxNext = lightbox?.querySelector('.next');
    const lightboxCounter = lightbox?.querySelector('.lightbox-counter');
    
    let currentImages = [];
    let currentImageIndex = 0;
    let startX = 0;
    let startY = 0;
    
    function openLightbox(images, startIndex = 0) {
        if (!lightbox || !images || images.length === 0) return;
        
        currentImages = images;
        currentImageIndex = startIndex;
        
        showCurrentImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        currentImages = [];
        currentImageIndex = 0;
    }
    
    function showCurrentImage() {
        if (!lightboxImg || !currentImages[currentImageIndex]) return;
        
        lightboxImg.src = currentImages[currentImageIndex];
        lightboxImg.alt = `Image ${currentImageIndex + 1}`;
        
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
        }
        
        // Update navigation buttons visibility
        if (lightboxPrev) {
            lightboxPrev.style.opacity = currentImageIndex > 0 ? '1' : '0.5';
        }
        if (lightboxNext) {
            lightboxNext.style.opacity = currentImageIndex < currentImages.length - 1 ? '1' : '0.5';
        }
    }
    
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            showCurrentImage();
        }
    }
    
    function showNextImage() {
        if (currentImageIndex < currentImages.length - 1) {
            currentImageIndex++;
            showCurrentImage();
        }
    }
    
    // Event listeners for lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }
    
    // Click outside to close
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showPrevImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
        }
    });
    
    // Touch/swipe navigation for mobile
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            
            // Ignore vertical swipes
            if (Math.abs(deltaY) > Math.abs(deltaX)) return;
            
            // Minimum swipe distance
            if (Math.abs(deltaX) < 50) return;
            
            if (deltaX > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPrevImage();
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    // Add click listeners to gallery images
    function addGalleryListeners() {
        document.querySelectorAll('.gallery img').forEach((img, index, allImages) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Collect all image sources
                const imageSources = Array.from(allImages).map(image => image.src);
                
                // Open lightbox with current image
                openLightbox(imageSources, index);
            });
        });
    }

    // Pricing cards accordion functionality
    function initPricingAccordion() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            const toggle = card.querySelector('.card-toggle');
            const detail = card.querySelector('.card-detail');
            
            if (!toggle || !detail) return;
            
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                
                // Close all other cards
                pricingCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        const otherToggle = otherCard.querySelector('.card-toggle');
                        const otherDetail = otherCard.querySelector('.card-detail');
                        
                        if (otherToggle && otherDetail) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                            otherDetail.setAttribute('aria-hidden', 'true');
                            otherDetail.classList.remove('open');
                        }
                    }
                });
                
                // Toggle current card
                if (isOpen) {
                    toggle.setAttribute('aria-expanded', 'false');
                    detail.setAttribute('aria-hidden', 'true');
                    detail.classList.remove('open');
                } else {
                    toggle.setAttribute('aria-expanded', 'true');
                    detail.setAttribute('aria-hidden', 'false');
                    detail.classList.add('open');
                    
                    // Smooth scroll to the opened card
                    setTimeout(() => {
                        card.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }, 100);
                }
            });
            
            // Also handle clicks on the entire card (except detail area)
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking inside the detail area
                if (!detail.contains(e.target) && e.target !== toggle) {
                    toggle.click();
                }
            });
        });
    }

    // Initialize pricing accordion when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPricingAccordion);
    } else {
        initPricingAccordion();
    }

    // Legal modal functionality
    function initLegalModal() {
        const modal = document.getElementById('legal-modal');
        const modalBody = document.getElementById('modal-body');
        const modalClose = modal?.querySelector('.modal-close');
        const overlay = modal?.querySelector('.modal-overlay');
        const mentionsLink = document.getElementById('mentions-link');
        const rgpdLink = document.getElementById('rgpd-link');

        const mentionsContent = `
            <h2>Mentions Légales</h2>
            <h3>Identité</h3>
            <p><strong>Nom/Dénomination sociale :</strong> Maxence Pereira Métallerie / Atelier Gracz</p>
            <p><strong>Adresse :</strong> 17 Chemin des meuniers, 63320 Neschers</p>
            <p><strong>Téléphone :</strong> 06 74 24 43 14</p>
            <p><strong>Email :</strong> contact@alesium.fr</p>
            
            <h3>Directeur de publication</h3>
            <p>Maxence Pereira</p>
            
            <h3>Hébergement</h3>
            <p>Ce site est hébergé par GitHub Pages</p>
            <p>GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
            
            <h3>Propriété intellectuelle</h3>
            <p>Le contenu de ce site (textes, images, éléments graphiques, logo, icônes, sons, logiciels) est la propriété exclusive d'Alesium, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.</p>
            
            <h3>Responsabilité</h3>
            <p>Les informations contenues sur ce site sont aussi précises que possible. Toutefois, des erreurs ou omissions peuvent survenir. Alesium ne pourra en aucun cas être tenu responsable de quelque dommage direct ou indirect que ce soit pouvant résulter de la consultation et/ou de l'utilisation de ce site.</p>
        `;

        const rgpdContent = `
            <h2>Politique RGPD</h2>
            <h3>Collecte des données personnelles</h3>
            <p>Dans le cadre de nos services, nous sommes amenés à collecter et traiter des données personnelles vous concernant.</p>
            
            <h3>Types de données collectées</h3>
            <ul>
                <li>Données d'identification (nom, prénom)</li>
                <li>Données de contact (email, téléphone)</li>
                <li>Données relatives à votre projet (messages, besoins exprimés)</li>
            </ul>
            
            <h3>Finalités du traitement</h3>
            <p>Vos données sont collectées et traitées pour :</p>
            <ul>
                <li>Répondre à vos demandes de contact</li>
                <li>Vous fournir nos services d'expertise industrielle</li>
                <li>Vous tenir informé de nos actualités (avec votre consentement)</li>
            </ul>
            
            <h3>Base légale</h3>
            <p>Le traitement de vos données est fondé sur :</p>
            <ul>
                <li>Votre consentement libre, éclairé et spécifique</li>
                <li>L'exécution d'un contrat ou de mesures précontractuelles</li>
                <li>L'intérêt légitime d'Alesium</li>
            </ul>
            
            <h3>Conservation des données</h3>
            <p>Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, conformément aux obligations légales applicables.</p>
            
            <h3>Vos droits</h3>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
            </ul>
            
            <h3>Contact</h3>
            <p>Pour exercer vos droits ou pour toute question relative au traitement de vos données personnelles, vous pouvez nous contacter à l'adresse : <strong>contact@alesium.fr</strong></p>
        `;

        function openModal(content) {
            if (!modal || !modalBody) return;
            modalBody.innerHTML = content;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Event listeners
        if (mentionsLink) {
            mentionsLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(mentionsContent);
            });
        }

        if (rgpdLink) {
            rgpdLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(rgpdContent);
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Initialize legal modal
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLegalModal);
    } else {
        initLegalModal();
    }

    // Projects and carousel functionality
    const DATA_URL = 'content/projets.json';
    const carouselHost = document.querySelector('#projets .track');
    const prevBtn = document.querySelector('#projets .prev');
    const nextBtn = document.querySelector('#projets .next');
    const detail = document.getElementById('projet-detail');

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[-\s]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function cardHTML(p) {
        return `
            <article class="card">
                <a href="#/projets/${p.slug}">
                    <img src="${p.preview}" alt="${p.title}" onerror="this.style.display='none'"/>
                    <h3>${p.title}</h3>
                </a>
            </article>
        `;
    }

    function renderCarousel(items) {
        if (!carouselHost) return;
        
        // Trier les projets dans l'ordre 1-2-3-4-5-6 basé sur le numéro au début du titre
        const sortedItems = items.sort((a, b) => {
            const numA = parseInt(a.title.match(/^(\d+)/)?.[1] || '999');
            const numB = parseInt(b.title.match(/^(\d+)/)?.[1] || '999');
            return numA - numB;
        });
        
        // Dupliquer les items pour un défilement infini
        const duplicatedItems = [...sortedItems, ...sortedItems];
        carouselHost.innerHTML = duplicatedItems.map(cardHTML).join('');
        
        // Variables pour le glissement manuel
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let startTime = 0;
        
        // Fonction pour activer/désactiver l'auto-scroll
        function toggleAutoScroll(enable) {
            if (enable) {
                carouselHost.classList.add('auto-scroll');
            } else {
                carouselHost.classList.remove('auto-scroll');
            }
        }
        
        // Démarrer l'auto-scroll après 2 secondes
        setTimeout(() => {
            if (!isDragging) {
                toggleAutoScroll(true);
            }
        }, 2000);
        
        // Gestion des événements tactiles et souris
        carouselHost.addEventListener('mousedown', startDrag);
        carouselHost.addEventListener('touchstart', startDrag, { passive: true });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        
        function startDrag(e) {
            if (e.target.closest('.card a')) return; // Ne pas interférer avec les liens
            
            isDragging = true;
            startTime = Date.now();
            toggleAutoScroll(false);
            carouselHost.classList.add('dragging');
            
            startX = getPositionX(e);
            prevTranslate = currentTranslate;
            
            animationID = requestAnimationFrame(animation);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + (currentPosition - startX) * 0.8; // Facteur de réduction pour un scroll plus fluide
        }
        
        function endDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            carouselHost.classList.remove('dragging');
            
            cancelAnimationFrame(animationID);
            
            // Inertie de scroll
            const duration = Date.now() - startTime;
            const distance = currentTranslate - prevTranslate;
            const velocity = distance / duration;
            
            if (Math.abs(velocity) > 0.1) {
                currentTranslate += velocity * 200; // Inertie
            }
            
            // Remettre l'auto-scroll après 3 secondes d'inactivité
            setTimeout(() => {
                if (!isDragging) {
                    toggleAutoScroll(true);
                    // Reset position for smooth auto-scroll
                    currentTranslate = 0;
                    prevTranslate = 0;
                    carouselHost.style.transform = 'translateX(0)';
                }
            }, 3000);
        }
        
        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }
        
        function animation() {
            if (isDragging) {
                carouselHost.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }
        
        // Pause auto-scroll au survol
        carouselHost.addEventListener('mouseenter', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'paused';
            }
        });
        
        carouselHost.addEventListener('mouseleave', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'running';
            }
        });
    }

    function renderDetail(p) {
        if (!detail) return;
        
        // Supprimer les classes d'animation précédentes
        detail.classList.remove('hidden', 'closing');
        detail.setAttribute('aria-hidden', 'false');
        
        const imageGallery = p.images && p.images.length > 0 
            ? `<div class="gallery">${p.images.map(src => `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`).join('')}</div>`
            : '';

        const keyPoints = p.key_points && p.key_points.length > 0
            ? `<h3>Points clés</h3><ul class="bullets">${p.key_points.map(point => `<li>${point}</li>`).join('')}</ul>`
            : '';

        detail.innerHTML = `
            <div class="project-detail-header">
                <h2>${p.title}</h2>
                <button class="close-project-btn" onclick="hideDetail()" title="Fermer le projet">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <p class="muted">${p.summary || ''}</p>
            ${imageGallery}
            <div class="cols">
                <div>
                    ${keyPoints}
                    ${p.tech ? `<h3>Technologies</h3><p>${p.tech}</p>` : ''}
                </div>
                <div>
                    <h3>Résultats</h3>
                    <p>${p.results || 'Données non disponibles'}</p>
                    <h3>Temps passé</h3>
                    <p>${p.time_spent || 'Données non disponibles'}</p>
                </div>
            </div>
            <div class="project-detail-actions">
                <button class="btn close-project-btn-text" onclick="hideDetail()">← Fermer le projet</button>
                <a class="btn" href="#projets">← Revenir aux projets</a>
            </div>
        `;
        
        // Add gallery listeners after rendering
        setTimeout(addGalleryListeners, 100);
        
        // Animation d'ouverture fluide
        detail.classList.add('opening');
        
        // Scroll vers le détail avec animation
        setTimeout(() => {
            window.scrollTo({
                top: detail.offsetTop - 100,
                behavior: 'smooth'
            });
        }, 100);
        
        // Nettoyer la classe d'animation après l'animation
        setTimeout(() => {
            detail.classList.remove('opening');
        }, 500);
    }

    function hideDetail() {
        if (!detail) return;
        
        // Animation de fermeture fluide
        detail.classList.add('closing');
        
        // Scroll vers la section projets pendant la fermeture
        const projectsSection = document.getElementById('projets');
        if (projectsSection) {
            window.scrollTo({
                top: projectsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
        
        // Attendre la fin de l'animation avant de cacher complètement
        setTimeout(() => {
            detail.classList.add('hidden');
            detail.classList.remove('closing');
            detail.setAttribute('aria-hidden', 'true');
            detail.innerHTML = '';
        }, 400); // Durée de l'animation de fermeture
    }
    
    // Make hideDetail global for onclick handlers
    window.hideDetail = hideDetail;

    function route(items) {
        const hash = location.hash || '';
        const projectMatch = hash.match(/^#\/projets\/(.+)$/);
        
        if (projectMatch) {
            const slug = projectMatch[1];
            const project = items.find(x => x.slug === slug);
            if (project) {
                renderDetail(project);
            } else {
                hideDetail();
            }
        } else {
            hideDetail();
        }
    }

    // Load projects data
    fetch(DATA_URL)
        .then(r => r.json())
        .then(items => {
            renderCarousel(items);
            route(items);
            
            // Handle hash changes for SPA routing
            window.addEventListener('hashchange', () => route(items));
        })
        .catch(e => {
            console.warn('projets.json introuvable', e);
            // Fallback: create mock data from available assets
            createMockProjects();
        });

    // Legal sections handling
    const ml = document.getElementById('mentions-legales');
    const rg = document.getElementById('rgpd');

    function showSection(sectionId) {
        [ml, rg].forEach(s => {
            if (!s) return;
            s.classList.add('hidden');
            s.setAttribute('aria-hidden', 'true');
        });

        const sec = document.querySelector(sectionId);
        if (sec) {
            sec.classList.remove('hidden');
            sec.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                window.scrollTo({
                    top: sec.offsetTop - 100,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }

    // Handle legal page routing
    window.addEventListener('hashchange', () => {
        if (location.hash === '#/mentions-legales') showSection('#mentions-legales');
        if (location.hash === '#/rgpd') showSection('#rgpd');
    });

    // Initial legal page check
    if (location.hash === '#/mentions-legales') showSection('#mentions-legales');
    if (location.hash === '#/rgpd') showSection('#rgpd');

    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]:not([href="#/"])');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (href.startsWith('#/')) return; // Skip SPA routes
        if (href === '#' || href.length <= 1) return; // Skip invalid selectors
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerHeight = 80; // Hauteur du header fixe + marge
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });

    // FAQ functionality - style Gracz
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            const answer = question.nextElementSibling;
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    otherAnswer.classList.remove('open');
                }
            });
            
            // Toggle current FAQ item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });

    // CV Interactive functionality
    const cvQuestions = document.querySelectorAll('.cv-question');
    cvQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            const answer = question.nextElementSibling;
            
            // Toggle current CV item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });

    // Adaptation automatique des grilles de tarifs selon le nombre de cartes
    function adaptPricingGrids() {
        const pricingGrids = document.querySelectorAll('.pricing-grid');
        
        pricingGrids.forEach(grid => {
            const cards = grid.querySelectorAll('.pricing-card');
            const cardCount = cards.length;
            
            // Supprimer les classes existantes
            grid.classList.remove('single-card', 'two-cards', 'three-cards', 'four-cards');
            
            // Ajouter la classe appropriée selon le nombre de cartes
            switch(cardCount) {
                case 1:
                    grid.classList.add('single-card');
                    break;
                case 2:
                    grid.classList.add('two-cards');
                    break;
                case 3:
                    grid.classList.add('three-cards');
                    break;
                case 4:
                    grid.classList.add('four-cards');
                    break;
                default:
                    // Plus de 4 cartes : comportement par défaut (3 colonnes)
                    grid.classList.add('multiple-cards');
            }
            
            console.log(`✓ Grid adapted: ${cardCount} card(s) in section`);
        });
    }

    // Parallax effects complètement désactivés
    // Plus d'effets de fade/parallax lors du défilement
    
    // Initialiser l'adaptation des grilles au chargement
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(adaptPricingGrids, 500);
    });

    // Add loading animation for images
    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    });

    // Create mock projects if JSON fails to load
    (function() {
    // ... (autres code inchangés au-dessus)

    // Projects and carousel functionality
    // Remplacement du chargement dynamique par données statiques
    const carouselHost = document.querySelector('#projets .track');
    const prevBtn = document.querySelector('#projets .prev');
    const nextBtn = document.querySelector('#projets .next');
    const detail = document.getElementById('projet-detail');

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[-\s]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function cardHTML(p) {
        return `
            <article class="card">
                <a href="#/projets/${p.slug}">
                    <img src="${p.preview}" alt="${p.title}" onerror="this.style.display='none'"/>
                    <h3>${p.title}</h3>
                </a>
            </article>
        `;
    }

    function renderCarousel(items) {
        if (!carouselHost) return;
        // Trier les projets dans l'ordre 1–6 selon le numéro en début de titre
        const sortedItems = items.sort((a, b) => {
            const numA = parseInt(a.title.match(/^(\d+)/)?.[1] || '999');
            const numB = parseInt(b.title.match(/^(\d+)/)?.[1] || '999');
            return numA - numB;
        });
        // Dupliquer les items pour un défilement infini
        const duplicatedItems = [...sortedItems, ...sortedItems];
        carouselHost.innerHTML = duplicatedItems.map(cardHTML).join('');
        // (Le reste de la fonction gère le scroll/drag, inchangé)
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let startTime = 0;
        function toggleAutoScroll(enable) {
            if (enable) {
                carouselHost.classList.add('auto-scroll');
            } else {
                carouselHost.classList.remove('auto-scroll');
            }
        }
        setTimeout(() => {
            if (!isDragging) {
                toggleAutoScroll(true);
            }
        }, 2000);
        carouselHost.addEventListener('mousedown', startDrag);
        carouselHost.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        function startDrag(e) {
            if (e.target.closest('.card a')) return;
            isDragging = true;
            startTime = Date.now();
            toggleAutoScroll(false);
            carouselHost.classList.add('dragging');
            startX = getPositionX(e);
            prevTranslate = currentTranslate;
            animationID = requestAnimationFrame(animation);
        }
        function drag(e) {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + (currentPosition - startX) * 0.8;
        }
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            carouselHost.classList.remove('dragging');
            cancelAnimationFrame(animationID);
            const duration = Date.now() - startTime;
            const distance = currentTranslate - prevTranslate;
            const velocity = distance / duration;
            if (Math.abs(velocity) > 0.1) {
                currentTranslate += velocity * 200;
            }
            setTimeout(() => {
                if (!isDragging) {
                    toggleAutoScroll(true);
                    currentTranslate = 0;
                    prevTranslate = 0;
                    carouselHost.style.transform = 'translateX(0)';
                }
            }, 3000);
        }
        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }
        function animation() {
            if (isDragging) {
                carouselHost.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }
        carouselHost.addEventListener('mouseenter', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'paused';
            }
        });
        carouselHost.addEventListener('mouseleave', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'running';
            }
        });
    }

    function renderDetail(p) {
        if (!detail) return;
        // (fonction inchangée qui génère le détail projet...)
        detail.classList.remove('hidden', 'closing');
        detail.setAttribute('aria-hidden', 'false');
        const imageGallery = p.images && p.images.length > 0 
            ? `<div class="gallery">${p.images.map(src => `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`).join('')}</div>`
            : '';
        const keyPoints = p.key_points && p.key_points.length > 0
            ? `<h3>Points clés</h3><ul class="bullets">${p.key_points.map(point => `<li>${point}</li>`).join('')}</ul>`
            : '';
        detail.innerHTML = `
            <div class="project-detail-header">
                <h2>${p.title}</h2>
                <button class="close-project-btn" onclick="hideDetail()" title="Fermer le projet">…</button>
            </div>
            <p class="muted">${p.summary || ''}</p>
            ${imageGallery}
            <div class="cols">
                <div>
                    ${keyPoints}
                    ${p.tech ? `<h3>Technologies</h3><p>${p.tech}</p>` : ''}
                </div>
                <div>
                    <h3>Résultats</h3>
                    <p>${p.results || ''}</p>
                    ${p.time_spent ? `<p><em>Temps investi : ${p.time_spent}</em></p>` : ''}
                </div>
            </div>
        `;
    }

(function() {
    // Set year in footer
    const YEAR = document.getElementById('year');
    if (YEAR) YEAR.textContent = new Date().getFullYear();

    const EMAIL = 'contact@alesium.fr';

    // Recall form handler
    document.querySelector('.recall-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const num = e.target.tel.value.trim();
        if (!num) {
            alert('Merci d\'indiquer votre numéro.');
            return;
        }
        const subject = `Rappeler ce numéro ASAP: "${num}"`;
        const body = `Numéro à rappeler : ${num}\n\n(Envoyé depuis alesium.fr)`;
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    // EmailJS initialization
    (function(){
        emailjs.init("kYuOmVqmEYAp7mfjU"); // Initialize with User ID
    })();

    // Contact form handler with EmailJS integration
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.querySelector('.form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.contact-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            
            try {
                // Step 1: Save to database via backend
                const backendUrl = window.location.origin.includes('localhost') ? 
                    'http://localhost:8001' : 
                    (window.REACT_APP_BACKEND_URL || 'https://alesium-landing.preview.emergentagent.com');
                
                const response = await fetch(`${backendUrl}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de l\'enregistrement');
                }
                
                // Step 2: Send emails via EmailJS (client-side with SDK)
                await sendEmailsViaEmailJS(data);
                
                // Success
                formStatus.style.display = 'block';
                formStatus.style.color = '#2d6e3e';
                formStatus.textContent = '✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais. Un email de confirmation vous a été envoyé.';
                contactForm.reset();
                
            } catch (error) {
                // Error
                formStatus.style.display = 'block';
                formStatus.style.color = '#d32f2f';
                formStatus.textContent = '❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.';
                console.error('Contact form error:', error);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // EmailJS integration function using official SDK
    async function sendEmailsViaEmailJS(data) {
        const timestamp = new Date().toLocaleString('fr-FR');
        
        // Send notification email to Alesium
        const notificationParams = {
            to_email: 'contact@alesium.fr',
            to_name: 'Alesium',
            from_name: data.name,
            from_email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone || 'Non renseigné',
            timestamp: timestamp,
            site_name: 'Alesium.fr'
        };
        
        try {
            console.log('📧 Sending notification email to Alesium...');
            await emailjs.send(
                'service_jc6o6xn',           // Service ID
                'template_4ur9prj',          // Notification template ID
                notificationParams,          // Template parameters
                'kYuOmVqmEYAp7mfjU'         // User ID
            );
            console.log('✅ Notification email sent to Alesium');
        } catch (error) {
            console.error('❌ Error sending notification email:', error);
            throw error;
        }
        
        // Send auto-reply confirmation to client
        const autoReplyParams = {
            to_email: data.email,        // IMPORTANT: Destinataire du mail de confirmation
            to_name: data.name,          // Nom du destinataire
            client_name: data.name,
            client_email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone || 'Non renseigné',
            timestamp: timestamp
        };
        
        try {
            console.log('📧 Sending confirmation email to client...');
            const result = await emailjs.send(
                'service_jc6o6xn',           // Service ID  
                'template_tnqh3o9',          // Auto-reply template ID
                autoReplyParams,             // Template parameters
                'kYuOmVqmEYAp7mfjU'         // User ID
            );
            console.log('✅ Confirmation email sent to client successfully:', result);
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
            console.error('Auto-reply params:', autoReplyParams);
            // Don't throw error for auto-reply failure - notification is more important
            console.warn('⚠️ Continuing despite auto-reply failure');
        }
    }

    // Lightbox functionality for project images
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const lightboxPrev = lightbox?.querySelector('.prev');
    const lightboxNext = lightbox?.querySelector('.next');
    const lightboxCounter = lightbox?.querySelector('.lightbox-counter');
    
    let currentImages = [];
    let currentImageIndex = 0;
    let startX = 0;
    let startY = 0;
    
    function openLightbox(images, startIndex = 0) {
        if (!lightbox || !images || images.length === 0) return;
        
        currentImages = images;
        currentImageIndex = startIndex;
        
        showCurrentImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        currentImages = [];
        currentImageIndex = 0;
    }
    
    function showCurrentImage() {
        if (!lightboxImg || !currentImages[currentImageIndex]) return;
        
        lightboxImg.src = currentImages[currentImageIndex];
        lightboxImg.alt = `Image ${currentImageIndex + 1}`;
        
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
        }
        
        // Update navigation buttons visibility
        if (lightboxPrev) {
            lightboxPrev.style.opacity = currentImageIndex > 0 ? '1' : '0.5';
        }
        if (lightboxNext) {
            lightboxNext.style.opacity = currentImageIndex < currentImages.length - 1 ? '1' : '0.5';
        }
    }
    
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            showCurrentImage();
        }
    }
    
    function showNextImage() {
        if (currentImageIndex < currentImages.length - 1) {
            currentImageIndex++;
            showCurrentImage();
        }
    }
    
    // Event listeners for lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }
    
    // Click outside to close
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showPrevImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
        }
    });
    
    // Touch/swipe navigation for mobile
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            
            // Ignore vertical swipes
            if (Math.abs(deltaY) > Math.abs(deltaX)) return;
            
            // Minimum swipe distance
            if (Math.abs(deltaX) < 50) return;
            
            if (deltaX > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPrevImage();
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    // Add click listeners to gallery images
    function addGalleryListeners() {
        document.querySelectorAll('.gallery img').forEach((img, index, allImages) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Collect all image sources
                const imageSources = Array.from(allImages).map(image => image.src);
                
                // Open lightbox with current image
                openLightbox(imageSources, index);
            });
        });
    }

    // Pricing cards accordion functionality
    function initPricingAccordion() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            const toggle = card.querySelector('.card-toggle');
            const detail = card.querySelector('.card-detail');
            
            if (!toggle || !detail) return;
            
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                
                // Close all other cards
                pricingCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        const otherToggle = otherCard.querySelector('.card-toggle');
                        const otherDetail = otherCard.querySelector('.card-detail');
                        
                        if (otherToggle && otherDetail) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                            otherDetail.setAttribute('aria-hidden', 'true');
                            otherDetail.classList.remove('open');
                        }
                    }
                });
                
                // Toggle current card
                if (isOpen) {
                    toggle.setAttribute('aria-expanded', 'false');
                    detail.setAttribute('aria-hidden', 'true');
                    detail.classList.remove('open');
                } else {
                    toggle.setAttribute('aria-expanded', 'true');
                    detail.setAttribute('aria-hidden', 'false');
                    detail.classList.add('open');
                    
                    // Smooth scroll to the opened card
                    setTimeout(() => {
                        card.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }, 100);
                }
            });
            
            // Also handle clicks on the entire card (except detail area)
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking inside the detail area
                if (!detail.contains(e.target) && e.target !== toggle) {
                    toggle.click();
                }
            });
        });
    }

    // Initialize pricing accordion when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPricingAccordion);
    } else {
        initPricingAccordion();
    }

    // Legal modal functionality
    function initLegalModal() {
        const modal = document.getElementById('legal-modal');
        const modalBody = document.getElementById('modal-body');
        const modalClose = modal?.querySelector('.modal-close');
        const overlay = modal?.querySelector('.modal-overlay');
        const mentionsLink = document.getElementById('mentions-link');
        const rgpdLink = document.getElementById('rgpd-link');

        const mentionsContent = `
            <h2>Mentions Légales</h2>
            <h3>Identité</h3>
            <p><strong>Nom/Dénomination sociale :</strong> Maxence Pereira Métallerie / Atelier Gracz</p>
            <p><strong>Adresse :</strong> 17 Chemin des meuniers, 63320 Neschers</p>
            <p><strong>Téléphone :</strong> 06 74 24 43 14</p>
            <p><strong>Email :</strong> contact@alesium.fr</p>
            
            <h3>Directeur de publication</h3>
            <p>Maxence Pereira</p>
            
            <h3>Hébergement</h3>
            <p>Ce site est hébergé par GitHub Pages</p>
            <p>GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
            
            <h3>Propriété intellectuelle</h3>
            <p>Le contenu de ce site (textes, images, éléments graphiques, logo, icônes, sons, logiciels) est la propriété exclusive d'Alesium, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.</p>
            
            <h3>Responsabilité</h3>
            <p>Les informations contenues sur ce site sont aussi précises que possible. Toutefois, des erreurs ou omissions peuvent survenir. Alesium ne pourra en aucun cas être tenu responsable de quelque dommage direct ou indirect que ce soit pouvant résulter de la consultation et/ou de l'utilisation de ce site.</p>
        `;

        const rgpdContent = `
            <h2>Politique RGPD</h2>
            <h3>Collecte des données personnelles</h3>
            <p>Dans le cadre de nos services, nous sommes amenés à collecter et traiter des données personnelles vous concernant.</p>
            
            <h3>Types de données collectées</h3>
            <ul>
                <li>Données d'identification (nom, prénom)</li>
                <li>Données de contact (email, téléphone)</li>
                <li>Données relatives à votre projet (messages, besoins exprimés)</li>
            </ul>
            
            <h3>Finalités du traitement</h3>
            <p>Vos données sont collectées et traitées pour :</p>
            <ul>
                <li>Répondre à vos demandes de contact</li>
                <li>Vous fournir nos services d'expertise industrielle</li>
                <li>Vous tenir informé de nos actualités (avec votre consentement)</li>
            </ul>
            
            <h3>Base légale</h3>
            <p>Le traitement de vos données est fondé sur :</p>
            <ul>
                <li>Votre consentement libre, éclairé et spécifique</li>
                <li>L'exécution d'un contrat ou de mesures précontractuelles</li>
                <li>L'intérêt légitime d'Alesium</li>
            </ul>
            
            <h3>Conservation des données</h3>
            <p>Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, conformément aux obligations légales applicables.</p>
            
            <h3>Vos droits</h3>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
            </ul>
            
            <h3>Contact</h3>
            <p>Pour exercer vos droits ou pour toute question relative au traitement de vos données personnelles, vous pouvez nous contacter à l'adresse : <strong>contact@alesium.fr</strong></p>
        `;

        function openModal(content) {
            if (!modal || !modalBody) return;
            modalBody.innerHTML = content;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Event listeners
        if (mentionsLink) {
            mentionsLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(mentionsContent);
            });
        }

        if (rgpdLink) {
            rgpdLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(rgpdContent);
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Initialize legal modal
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLegalModal);
    } else {
        initLegalModal();
    }

    // Projects and carousel functionality
    const DATA_URL = 'content/projets.json';
    const carouselHost = document.querySelector('#projets .track');
    const prevBtn = document.querySelector('#projets .prev');
    const nextBtn = document.querySelector('#projets .next');
    const detail = document.getElementById('projet-detail');

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[-\s]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function cardHTML(p) {
        return `
            <article class="card">
                <a href="#/projets/${p.slug}">
                    <img src="${p.preview}" alt="${p.title}" onerror="this.style.display='none'"/>
                    <h3>${p.title}</h3>
                </a>
            </article>
        `;
    }

    function renderCarousel(items) {
        if (!carouselHost) return;
        
        // Trier les projets dans l'ordre 1-2-3-4-5-6 basé sur le numéro au début du titre
        const sortedItems = items.sort((a, b) => {
            const numA = parseInt(a.title.match(/^(\d+)/)?.[1] || '999');
            const numB = parseInt(b.title.match(/^(\d+)/)?.[1] || '999');
            return numA - numB;
        });
        
        // Dupliquer les items pour un défilement infini
        const duplicatedItems = [...sortedItems, ...sortedItems];
        carouselHost.innerHTML = duplicatedItems.map(cardHTML).join('');
        
        // Variables pour le glissement manuel
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let startTime = 0;
        
        // Fonction pour activer/désactiver l'auto-scroll
        function toggleAutoScroll(enable) {
            if (enable) {
                carouselHost.classList.add('auto-scroll');
            } else {
                carouselHost.classList.remove('auto-scroll');
            }
        }
        
        // Démarrer l'auto-scroll après 2 secondes
        setTimeout(() => {
            if (!isDragging) {
                toggleAutoScroll(true);
            }
        }, 2000);
        
        // Gestion des événements tactiles et souris
        carouselHost.addEventListener('mousedown', startDrag);
        carouselHost.addEventListener('touchstart', startDrag, { passive: true });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        
        function startDrag(e) {
            if (e.target.closest('.card a')) return; // Ne pas interférer avec les liens
            
            isDragging = true;
            startTime = Date.now();
            toggleAutoScroll(false);
            carouselHost.classList.add('dragging');
            
            startX = getPositionX(e);
            prevTranslate = currentTranslate;
            
            animationID = requestAnimationFrame(animation);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + (currentPosition - startX) * 0.8; // Facteur de réduction pour un scroll plus fluide
        }
        
        function endDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            carouselHost.classList.remove('dragging');
            
            cancelAnimationFrame(animationID);
            
            // Inertie de scroll
            const duration = Date.now() - startTime;
            const distance = currentTranslate - prevTranslate;
            const velocity = distance / duration;
            
            if (Math.abs(velocity) > 0.1) {
                currentTranslate += velocity * 200; // Inertie
            }
            
            // Remettre l'auto-scroll après 3 secondes d'inactivité
            setTimeout(() => {
                if (!isDragging) {
                    toggleAutoScroll(true);
                    // Reset position for smooth auto-scroll
                    currentTranslate = 0;
                    prevTranslate = 0;
                    carouselHost.style.transform = 'translateX(0)';
                }
            }, 3000);
        }
        
        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }
        
        function animation() {
            if (isDragging) {
                carouselHost.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }
        
        // Pause auto-scroll au survol
        carouselHost.addEventListener('mouseenter', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'paused';
            }
        });
        
        carouselHost.addEventListener('mouseleave', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'running';
            }
        });
    }

    function renderDetail(p) {
        if (!detail) return;
        
        // Supprimer les classes d'animation précédentes
        detail.classList.remove('hidden', 'closing');
        detail.setAttribute('aria-hidden', 'false');
        
        const imageGallery = p.images && p.images.length > 0 
            ? `<div class="gallery">${p.images.map(src => `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`).join('')}</div>`
            : '';

        const keyPoints = p.key_points && p.key_points.length > 0
            ? `<h3>Points clés</h3><ul class="bullets">${p.key_points.map(point => `<li>${point}</li>`).join('')}</ul>`
            : '';

        detail.innerHTML = `
            <div class="project-detail-header">
                <h2>${p.title}</h2>
                <button class="close-project-btn" onclick="hideDetail()" title="Fermer le projet">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <p class="muted">${p.summary || ''}</p>
            ${imageGallery}
            <div class="cols">
                <div>
                    ${keyPoints}
                    ${p.tech ? `<h3>Technologies</h3><p>${p.tech}</p>` : ''}
                </div>
                <div>
                    <h3>Résultats</h3>
                    <p>${p.results || 'Données non disponibles'}</p>
                    <h3>Temps passé</h3>
                    <p>${p.time_spent || 'Données non disponibles'}</p>
                </div>
            </div>
            <div class="project-detail-actions">
                <button class="btn close-project-btn-text" onclick="hideDetail()">← Fermer le projet</button>
                <a class="btn" href="#projets">← Revenir aux projets</a>
            </div>
        `;
        
        // Add gallery listeners after rendering
        setTimeout(addGalleryListeners, 100);
        
        // Animation d'ouverture fluide
        detail.classList.add('opening');
        
        // Scroll vers le détail avec animation
        setTimeout(() => {
            window.scrollTo({
                top: detail.offsetTop - 100,
                behavior: 'smooth'
            });
        }, 100);
        
        // Nettoyer la classe d'animation après l'animation
        setTimeout(() => {
            detail.classList.remove('opening');
        }, 500);
    }

    function hideDetail() {
        if (!detail) return;
        
        // Animation de fermeture fluide
        detail.classList.add('closing');
        
        // Scroll vers la section projets pendant la fermeture
        const projectsSection = document.getElementById('projets');
        if (projectsSection) {
            window.scrollTo({
                top: projectsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
        
        // Attendre la fin de l'animation avant de cacher complètement
        setTimeout(() => {
            detail.classList.add('hidden');
            detail.classList.remove('closing');
            detail.setAttribute('aria-hidden', 'true');
            detail.innerHTML = '';
        }, 400); // Durée de l'animation de fermeture
    }
    
    // Make hideDetail global for onclick handlers
    window.hideDetail = hideDetail;

    function route(items) {
        const hash = location.hash || '';
        const projectMatch = hash.match(/^#\/projets\/(.+)$/);
        
        if (projectMatch) {
            const slug = projectMatch[1];
            const project = items.find(x => x.slug === slug);
            if (project) {
                renderDetail(project);
            } else {
                hideDetail();
            }
        } else {
            hideDetail();
        }
    }

    // Load projects data
    fetch(DATA_URL)
        .then(r => r.json())
        .then(items => {
            renderCarousel(items);
            route(items);
            
            // Handle hash changes for SPA routing
            window.addEventListener('hashchange', () => route(items));
        })
        .catch(e => {
            console.warn('projets.json introuvable', e);
            // Fallback: create mock data from available assets
            createMockProjects();
        });

    // Legal sections handling
    const ml = document.getElementById('mentions-legales');
    const rg = document.getElementById('rgpd');

    function showSection(sectionId) {
        [ml, rg].forEach(s => {
            if (!s) return;
            s.classList.add('hidden');
            s.setAttribute('aria-hidden', 'true');
        });

        const sec = document.querySelector(sectionId);
        if (sec) {
            sec.classList.remove('hidden');
            sec.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                window.scrollTo({
                    top: sec.offsetTop - 100,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }

    // Handle legal page routing
    window.addEventListener('hashchange', () => {
        if (location.hash === '#/mentions-legales') showSection('#mentions-legales');
        if (location.hash === '#/rgpd') showSection('#rgpd');
    });

    // Initial legal page check
    if (location.hash === '#/mentions-legales') showSection('#mentions-legales');
    if (location.hash === '#/rgpd') showSection('#rgpd');

    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]:not([href="#/"])');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (href.startsWith('#/')) return; // Skip SPA routes
        if (href === '#' || href.length <= 1) return; // Skip invalid selectors
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerHeight = 80; // Hauteur du header fixe + marge
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });

    // FAQ functionality - style Gracz
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            const answer = question.nextElementSibling;
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    otherAnswer.classList.remove('open');
                }
            });
            
            // Toggle current FAQ item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });

    // CV Interactive functionality
    const cvQuestions = document.querySelectorAll('.cv-question');
    cvQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            const answer = question.nextElementSibling;
            
            // Toggle current CV item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });

    // Adaptation automatique des grilles de tarifs selon le nombre de cartes
    function adaptPricingGrids() {
        const pricingGrids = document.querySelectorAll('.pricing-grid');
        
        pricingGrids.forEach(grid => {
            const cards = grid.querySelectorAll('.pricing-card');
            const cardCount = cards.length;
            
            // Supprimer les classes existantes
            grid.classList.remove('single-card', 'two-cards', 'three-cards', 'four-cards');
            
            // Ajouter la classe appropriée selon le nombre de cartes
            switch(cardCount) {
                case 1:
                    grid.classList.add('single-card');
                    break;
                case 2:
                    grid.classList.add('two-cards');
                    break;
                case 3:
                    grid.classList.add('three-cards');
                    break;
                case 4:
                    grid.classList.add('four-cards');
                    break;
                default:
                    // Plus de 4 cartes : comportement par défaut (3 colonnes)
                    grid.classList.add('multiple-cards');
            }
            
            console.log(`✓ Grid adapted: ${cardCount} card(s) in section`);
        });
    }

    // Parallax effects complètement désactivés
    // Plus d'effets de fade/parallax lors du défilement
    
    // Initialiser l'adaptation des grilles au chargement
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(adaptPricingGrids, 500);
    });

    // Add loading animation for images
    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    });

    // Create mock projects if JSON fails to load
    (function() {
    // ... (autres code inchangés au-dessus)

    // Projects and carousel functionality
    // Remplacement du chargement dynamique par données statiques
    const carouselHost = document.querySelector('#projets .track');
    const prevBtn = document.querySelector('#projets .prev');
    const nextBtn = document.querySelector('#projets .next');
    const detail = document.getElementById('projet-detail');

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[-\s]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function cardHTML(p) {
        return `
            <article class="card">
                <a href="#/projets/${p.slug}">
                    <img src="${p.preview}" alt="${p.title}" onerror="this.style.display='none'"/>
                    <h3>${p.title}</h3>
                </a>
            </article>
        `;
    }

    function renderCarousel(items) {
        if (!carouselHost) return;
        // Trier les projets dans l'ordre 1–6 selon le numéro en début de titre
        const sortedItems = items.sort((a, b) => {
            const numA = parseInt(a.title.match(/^(\d+)/)?.[1] || '999');
            const numB = parseInt(b.title.match(/^(\d+)/)?.[1] || '999');
            return numA - numB;
        });
        // Dupliquer les items pour un défilement infini
        const duplicatedItems = [...sortedItems, ...sortedItems];
        carouselHost.innerHTML = duplicatedItems.map(cardHTML).join('');
        // (Le reste de la fonction gère le scroll/drag, inchangé)
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        let startTime = 0;
        function toggleAutoScroll(enable) {
            if (enable) {
                carouselHost.classList.add('auto-scroll');
            } else {
                carouselHost.classList.remove('auto-scroll');
            }
        }
        setTimeout(() => {
            if (!isDragging) {
                toggleAutoScroll(true);
            }
        }, 2000);
        carouselHost.addEventListener('mousedown', startDrag);
        carouselHost.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        function startDrag(e) {
            if (e.target.closest('.card a')) return;
            isDragging = true;
            startTime = Date.now();
            toggleAutoScroll(false);
            carouselHost.classList.add('dragging');
            startX = getPositionX(e);
            prevTranslate = currentTranslate;
            animationID = requestAnimationFrame(animation);
        }
        function drag(e) {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + (currentPosition - startX) * 0.8;
        }
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            carouselHost.classList.remove('dragging');
            cancelAnimationFrame(animationID);
            const duration = Date.now() - startTime;
            const distance = currentTranslate - prevTranslate;
            const velocity = distance / duration;
            if (Math.abs(velocity) > 0.1) {
                currentTranslate += velocity * 200;
            }
            setTimeout(() => {
                if (!isDragging) {
                    toggleAutoScroll(true);
                    currentTranslate = 0;
                    prevTranslate = 0;
                    carouselHost.style.transform = 'translateX(0)';
                }
            }, 3000);
        }
        function getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }
        function animation() {
            if (isDragging) {
                carouselHost.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }
        carouselHost.addEventListener('mouseenter', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'paused';
            }
        });
        carouselHost.addEventListener('mouseleave', () => {
            if (!isDragging) {
                carouselHost.style.animationPlayState = 'running';
            }
        });
    }

    function renderDetail(p) {
        if (!detail) return;
        // (fonction inchangée qui génère le détail projet...)
        detail.classList.remove('hidden', 'closing');
        detail.setAttribute('aria-hidden', 'false');
        const imageGallery = p.images && p.images.length > 0 
            ? `<div class="gallery">${p.images.map(src => `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`).join('')}</div>`
            : '';
        const keyPoints = p.key_points && p.key_points.length > 0
            ? `<h3>Points clés</h3><ul class="bullets">${p.key_points.map(point => `<li>${point}</li>`).join('')}</ul>`
            : '';
        detail.innerHTML = `
            <div class="project-detail-header">
                <h2>${p.title}</h2>
                <button class="close-project-btn" onclick="hideDetail()" title="Fermer le projet">…</button>
            </div>
            <p class="muted">${p.summary || ''}</p>
            ${imageGallery}
            <div class="cols">
                <div>
                    ${keyPoints}
                    ${p.tech ? `<h3>Technologies</h3><p>${p.tech}</p>` : ''}
                </div>
                <div>
                    <h3>Résultats</h3>
                    <p>${p.results || ''}</p>
                    ${p.time_spent ? `<p><em>Temps investi : ${p.time_spent}</em></p>` : ''}
                </div>
            </div>
        `;
    }

    // ** Intégration statique des projets (6 éléments) **
    const projects = [
      {
        "slug": "6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe",
        "title": "6. Supression des jeux mécanique dans robot parrallèle 3 axe",
        "preview": "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/2f.JPG",
        "images": [
          "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/2f.JPG",
          "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/3f.JPG",
          "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/4f.JPG"
        ],
        "summary": "Éliminer tout jeu de rotulage sur un robot parallèle 3D (3 DOF) afin d’augmenter rigidité, précision et accélérations, puis protéger l’invention (brevet).",
        "key_points": [
          "Contact double bille sur surfaces de référence avec différence de potentiel mécanique",
          "Précharge élastique via tube/élément ressort assurant une contrainte permanente sur les doubles contacts",
          "Fermeture cinématique isostatique tout en supprimant backlash et micro-basculements",
          "Recherches d’antériorité & analyse de liberté résiduelle.",
          "CAO + calculs de contact (Hertz) : contraintes locales, rigidité équivalente, distribution d’efforts.",
          "Analyse modale/rigidité de la chaîne (comparatif avec rotules classiques).",
          "Essais en boucle : maquettes instrumentées, mesures de répétabilité/retour.",
          "Propriété intellectuelle : rédaction et dépôt de brevet (architecture, précharge, interfaces)."
        ],
        "results": "- 0 jeu mesuré réel\n- augmentation de l'accélération possible sans vibration (x5)\n- augmentation de la précision\n\nUtilité:\n\n- Impression 3D\n- Pick and place\n- ligne de production",
        "time_spent": "N/A",
        "tech": "Industrialisation, conception mécanique"
      },
      {
        "slug": "3-dveloppement-dun-cadre-de-vtt-de-descente",
        "title": "3. Développement d'un cadre de VTT de descente",
        "preview": "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/1c.png",
        "images": [
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/1c.png",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/2c.png",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/3c.JPG",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/4c.JPG",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/5c.png",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/6c.png",
          "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/7c.JPG"
        ],
        "summary": "Accompagnement d'une startup (october bike) pour son premier cadre de VTT de descente 100% made in France.\nCadre en acier CroMo (25CD4S)",
        "key_points": [
          "Itérations CAO -> recherche des ratios de compression amortisseur, optimisation de la fin de course, recherche de maintien milieu de course",
          "Cost to design: choix des modes de cinématique en fonction des coûts de production",
          "Rédaction des gammes de production, choix des solutions et procédés techniques.",
          "Recherches de solutions low cost pour outillage \"one shot\"",
          "Caractérisations mécaniques en CAO -> essais statiques et dynamiques, prévention des ZAT et optimisation des cordons de soudure",
          "Mise en production: Gabarit, grugeage, chambrage, soudure TIG, usinage tour et fraiseuse conventionnel + CNC, reprise en usinage après soudure",
          "Itérations rapides terrain / CAO / fabriation"
        ],
        "results": "- Cadre prêt à être commercialisé (2026)\n- Fabrication 100% française\n- Maitrise des procédés complets\n- Maitrise des coûts de production: concurrence le tarif des cadres taiwanais",
        "time_spent": "CAO: 24 jours\nProduction: 31 jours\nAméliorations : 11 jours\n\nTotal: 66 jours + matière",
        "tech": "Industrialisation, conception mécanique"
      },
      {
        "slug": "2-fabrication-dune-ligne-de-production",
        "title": "2. Fabrication d'une ligne de production",
        "preview": "assets/projets/2-fabrication-dune-ligne-de-production/1b.jpg",
        "images": [
          "assets/projets/2-fabrication-dune-ligne-de-production/1b.jpg",
          "assets/projets/2-fabrication-dune-ligne-de-production/2b.jpg",
          "assets/projets/2-fabrication-dune-ligne-de-production/3b.jpg",
          "assets/projets/2-fabrication-dune-ligne-de-production/4b.png",
          "assets/projets/2-fabrication-dune-ligne-de-production/5b.png",
          "assets/projets/2-fabrication-dune-ligne-de-production/6b.png"
        ],
        "summary": "Accompagnement d'une startup pour sa première ligne de production: presse statique de 40T + chariot interface spécifique + outillage spécifique.\nMachine \"low-tech\" -> pas d'autre énergie que l'énergie humaine, maintenance extrêmement simple, machine robuste.",
        "key_points": [
          "Rédigé le cahier des charge technique et fonctionnel aux côtés du client",
          "proposé différentes solutions techniques chiffrées",
          "CAO + essais numérique statique et dynamique",
          "mise en production - découpe laser, usinage, ajustage, pliage",
          "Soudure TIG + MAG",
          "montage à blanc et essai en atelier",
          "livraison",
          "formation"
        ],
        "results": "Ligne de production en fonctionnement depuis fin 2024\npressage des produits jusqu'à 40T sans défaut\nCahier des charges et délais respectés\nPermet la création des premiers produits de la startup",
        "time_spent": "Cahier des charges, solutions techniques: 10 jours\nCAO + essais numériques: 21 jours\nProduction: 17 jours\nLivraison / formation: 4 jours\n\nTotal: 52 jours + matière",
        "tech": "Industrialisation, conception mécanique"
      },
      {
        "slug": "4-conception-et-fabrication-dune-cintreuse-galets-manuelle",
        "title": "4. Conception et fabrication d'une cintreuse à galets manuelle",
        "preview": "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/1d.jpeg",
        "images": [
          "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/1d.jpeg",
          "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/2d.jpeg",
          "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/3d.jpeg"
        ],
        "summary": "Conception et fabrication d'un outillage de cintrage à froid pour l'acier (jusqu'à carré 16x16)",
        "key_points": [
          "CAO de l'ensemble -> cost to design",
          "Mise en production (laser + tournage)",
          "Essais",
          "Livraison"
        ],
        "results": "- Cahier des charges respécté\n- coût maitrisé",
        "time_spent": "CAO: 0,5 jours\nProduction: 0,5 jours\n\nTotal: 1 jour + matière",
        "tech": "Industrialisation, conception mécanique"
      },
      {
        "slug": "5-preuve-de-concept-impression-3d-metal-par-conduction",
        "title": "5. Preuve de concept impression 3D metal par conduction",
        "preview": "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/1e.JPG",
        "images": [
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/1e.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/2e.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/3e.jpg",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/4e.jpg",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/5e.jpg",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 2.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 4.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 6.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 7.JPG",
          "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 8.JPG"
        ],
        "summary": "R&D impression 3D métal par conduction de chaleur : FDM métal\npreuve de concept pour levé de fonds",
        "key_points": [
          "Recherches d'antériorité - lecture de papiers",
          "CAO / simulations logicielle",
          "Calculs thermiques",
          "mise en production par frittage laser sélectif en inconel",
          "test / essais / erreurs / boucle",
          "propriété intellectuelle - dépôt de brevet",
          "Preuve de concept sur fusion d'acier par conduction et extrusion dans une buse de 0.4mm de diamètre"
        ],
        "results": "- P.O.C. validé\n- levée de fonds tour 1 validé",
        "time_spent": "N/A",
        "tech": "Industrialisation, conception mécanique"
      },
      {
        "slug": "1-optimisation-du-temps-de-fabrication-descalier-en-acier",
        "title": "1. Optimisation du temps de fabrication d'escalier en acier",
        "preview": "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/1a.png",
        "images": [
          "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/1a.png",
          "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/2a.png",
          "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/3a.png",
          "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/4a.png",
          "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/5a.png"
        ],
        "summary": "j'ai accompagné un métallier qui réalise des escaliers en acier sur mesure de manière relativement artisanale.",
        "key_points": [
          "Standardisé le dessin des limons",
          "Optimiser les chutes de découpe laser",
          "Optimiser la conception pour le pliage CNC (prises de références)",
          "Conçu un marbre de 2m * 4m pour la mise en position de toutes les pièces de l'escalier d'un coup",
          "Revu les process de prise de côte et de production (soudure TIG + MIG)",
          "Mise en place de procédures de soudure"
        ],
        "results": "Optimisation du temps de production de 120% -> passage de 20h de fabrication à 8h\nReduction du coût de production total de 61%\nDiminution de la masse de l'escalier de 32% -> pose simplifiée\nOptimisation de l'espace atelier par la standardisation des pièces\nReduction des erreurs (procédure)",
        "time_spent": "12 jours répartis sur 3 mois: audit, CAO, discussions, accompagnement aux premières fabrications.",
        "tech": "Industrialisation, conception mécanique"
      }
    ];

    // Initialiser le carrousel avec les projets statiques
    renderCarousel(projects);
    route(projects);
    window.addEventListener('hashchange', () => route(projects));

    // ... (suite du code inchangé : gestion des routes #/projets/xxx, FAQ, etc.)
})();
