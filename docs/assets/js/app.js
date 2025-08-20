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
                const backendUrl = 'https://alesium-landing.preview.emergentagent.com';
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
                
                // Step 2: Send emails via EmailJS (client-side)
                await sendEmailViaEmailJS(data);
                
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

    // EmailJS integration function
    async function sendEmailViaEmailJS(data) {
        // EmailJS configuration
        const emailJSConfig = {
            serviceID: 'service_jc6o6xn',
            notificationTemplateID: 'template_4ur9prj',
            autoReplyTemplateID: 'template_tnqh3o9',
            userID: 'kYuOmVqmEYAp7mfjU',
            accessToken: 'kDN2xdpEqrTvCp2Ffwqa4'
        };
        
        const timestamp = new Date().toLocaleString('fr-FR');
        
        try {
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
            
            await sendSingleEmailJS(emailJSConfig.serviceID, emailJSConfig.notificationTemplateID, notificationParams, emailJSConfig.userID, emailJSConfig.accessToken);
            console.log('✅ Notification email sent to Alesium');
            
            // Send auto-reply confirmation to client
            const autoReplyParams = {
                client_name: data.name,
                client_email: data.email,
                subject: data.subject,
                message: data.message,
                phone: data.phone || 'Non renseigné',
                timestamp: timestamp
            };
            
            await sendSingleEmailJS(emailJSConfig.serviceID, emailJSConfig.autoReplyTemplateID, autoReplyParams, emailJSConfig.userID, emailJSConfig.accessToken);
            console.log('✅ Auto-reply confirmation sent to client');
            
        } catch (error) {
            console.error('❌ EmailJS error:', error);
            throw error;
        }
    }
    
    // Helper function to send single email via EmailJS
    async function sendSingleEmailJS(serviceID, templateID, templateParams, userID, accessToken) {
        const payload = {
            service_id: serviceID,
            template_id: templateID,
            user_id: userID,
            template_params: templateParams,
            accessToken: accessToken
        };
        
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
        }
        
        return response.text();
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
        detail.classList.remove('hidden');
        detail.setAttribute('aria-hidden', 'false');
        
        const imageGallery = p.images && p.images.length > 0 
            ? `<div class="gallery">${p.images.map(src => `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`).join('')}</div>`
            : '';

        const keyPoints = p.key_points && p.key_points.length > 0
            ? `<h3>Points clés</h3><ul class="bullets">${p.key_points.map(point => `<li>${point}</li>`).join('')}</ul>`
            : '';

        detail.innerHTML = `
            <h2>${p.title}</h2>
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
            <p><a class="btn" href="#projets">← Revenir aux projets</a></p>
        `;
        
        // Add gallery listeners after rendering
        setTimeout(addGalleryListeners, 100);
        
        // Smooth scroll to detail section
        setTimeout(() => {
            window.scrollTo({
                top: detail.offsetTop - 100,
                behavior: 'smooth'
            });
        }, 100);
    }

    function hideDetail() {
        if (!detail) return;
        detail.classList.add('hidden');
        detail.setAttribute('aria-hidden', 'true');
        detail.innerHTML = '';
    }

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

    // Parallaxe entre sections (-10% à 0%) - EXCLUANT la section "qui je suis"
    function initSectionParallax() {
        const sections = document.querySelectorAll('.section:not(#presentation)'); // Exclure la section "qui je suis"
        
        // Initialiser toutes les sections en mode "enter"
        sections.forEach(section => {
            section.classList.add('section-enter');
        });
        
        function updateSectionParallax() {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionCenter = sectionTop + sectionHeight / 2;
                
                // Calculer la distance par rapport au centre de l'écran
                const screenCenter = scrollY + windowHeight / 2;
                const distanceFromCenter = Math.abs(screenCenter - sectionCenter);
                
                // Si la section est proche du centre de l'écran
                if (distanceFromCenter < windowHeight * 0.8) {
                    // Calculer le pourcentage de visibilité (0 = loin, 1 = au centre)
                    const visibility = Math.max(0, 1 - (distanceFromCenter / (windowHeight * 0.8)));
                    
                    // Appliquer la transformation de -10% à 0%
                    const translateY = (1 - visibility) * 10; // Réduit de 30 à 10
                    const opacity = 0.3 + (visibility * 0.7);
                    
                    section.style.transform = `translateY(${translateY}%)`;
                    section.style.opacity = opacity;
                    
                    if (visibility > 0.7) {
                        section.classList.remove('section-enter');
                        section.classList.add('section-visible');
                    }
                } else {
                    // Section trop loin, la garder en mode "enter"
                    section.classList.remove('section-visible');
                    section.classList.add('section-enter');
                }
            });
        }
        
        // Écouter le scroll avec throttling
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateSectionParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll);
        
        // Appel initial
        updateSectionParallax();
    }
    
    // Initialiser la parallaxe des sections
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initSectionParallax, 100);
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
    function createMockProjects() {
        const mockProjects = [
            {
                slug: "optimisation-escalier-acier",
                title: "Optimisation du temps de fabrication d'escalier en acier",
                preview: "assets/projets/optimisation-escalier-acier/preview.jpg",
                images: ["assets/projets/optimisation-escalier-acier/image1.jpg", "assets/projets/optimisation-escalier-acier/image2.jpg"],
                summary: "Réduction du temps de fabrication d'escaliers métalliques par optimisation des procédés.",
                key_points: ["Analyse des goulots d'étranglement", "Nouvelle méthode d'assemblage", "Outillage spécialisé"],
                results: "Temps de fabrication réduit de 40%",
                time_spent: "3 semaines",
                tech: "Soudure MIG/MAG, usinage CNC"
            },
            {
                slug: "ligne-production",
                title: "Fabrication d'une ligne de production",
                preview: "assets/projets/ligne-production/preview.jpg",
                images: ["assets/projets/ligne-production/image1.jpg"],
                summary: "Conception et réalisation complète d'une ligne de production automatisée.",
                key_points: ["Automatisation des tâches répétitives", "Contrôle qualité intégré", "Interface opérateur intuitive"],
                results: "Productivité augmentée de 60%",
                time_spent: "8 semaines",
                tech: "Automatisme, pneumatique, vision industrielle"
            }
        ];
        
        renderCarousel(mockProjects);
        route(mockProjects);
        window.addEventListener('hashchange', () => route(mockProjects));
    }
})();