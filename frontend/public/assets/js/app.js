(function () {
  /* ==========================
     Utilitaires & init simple
  ===========================*/
  const YEAR = document.getElementById("year");
  if (YEAR) YEAR.textContent = new Date().getFullYear();

  const EMAIL = "contact@alesium.fr";

  // Formulaire "Rappelez-moi"
  document.querySelector(".recall-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const num = e.target.tel.value.trim();
    if (!num) {
      alert("Merci d'indiquer votre numéro.");
      return;
    }
    const subject = `Rappeler ce numéro ASAP: "${num}"`;
    const body = `Numéro à rappeler : ${num}\n\n(Envoyé depuis alesium.fr)`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  });

  /* ==========================
     Contact via EmailJS (SDK)
  ===========================*/
  (function () {
    // Remplace par ta clé publique si besoin
    if (typeof emailjs !== "undefined" && emailjs?.init) {
      emailjs.init("kYuOmVqmEYAp7mfjU");
    }
  })();

  const contactForm = document.getElementById("contact-form");
  const formStatus = document.querySelector(".form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || null,
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      const submitBtn = contactForm.querySelector(".contact-submit");
      const originalText = submitBtn?.textContent || "";
      if (submitBtn) {
        submitBtn.textContent = "Envoi en cours...";
        submitBtn.disabled = true;
      }

      try {
        // Backend (optionnel) : adapte l’URL si tu as un backend
        const backendUrl = window.location.origin.includes("localhost")
          ? "http://localhost:8001"
          : window.REACT_APP_BACKEND_URL ||
            "https://alesium-landing.preview.emergentagent.com";

        await fetch(`${backendUrl}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {});

        // EmailJS — notification + auto-réponse (si EmailJS chargé)
        if (typeof emailjs !== "undefined" && emailjs?.send) {
          const timestamp = new Date().toLocaleString("fr-FR");

          // notification interne
          await emailjs.send(
            "service_jc6o6xn",
            "template_4ur9prj",
            {
              to_email: "contact@alesium.fr",
              to_name: "Alesium",
              from_name: data.name,
              from_email: data.email,
              subject: data.subject,
              message: data.message,
              phone: data.phone || "Non renseigné",
              timestamp,
              site_name: "Alesium.fr",
            },
            "kYuOmVqmEYAp7mfjU"
          );

          // confirmation client
          await emailjs
            .send(
              "service_jc6o6xn",
              "template_tnqh3o9",
              {
                to_email: data.email,
                to_name: data.name,
                client_name: data.name,
                client_email: data.email,
                subject: data.subject,
                message: data.message,
                phone: data.phone || "Non renseigné",
                timestamp,
              },
              "kYuOmVqmEYAp7mfjU"
            )
            .catch(() => {});
        }

        if (formStatus) {
          formStatus.style.display = "block";
          formStatus.style.color = "#2d6e3e";
          formStatus.textContent =
            "✅ Message envoyé ! Nous revenons vers vous rapidement. Un email de confirmation a été envoyé.";
        }
        contactForm.reset();
      } catch (error) {
        if (formStatus) {
          formStatus.style.display = "block";
          formStatus.style.color = "#d32f2f";
          formStatus.textContent =
            "❌ Une erreur est survenue. Réessayez ou contactez-nous par email.";
        }
        console.error("Contact form error:", error);
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }

  /* ==========================
     Modale Mentions/RGPD
  ===========================*/
  function initLegalModal() {
    const modal = document.getElementById("legal-modal");
    const modalBody = document.getElementById("modal-body");
    const modalClose = modal?.querySelector(".modal-close");
    const overlay = modal?.querySelector(".modal-overlay");
    const mentionsLink = document.getElementById("mentions-link");
    const rgpdLink = document.getElementById("rgpd-link");

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
      <p>GitHub Pages — GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
      <h3>Propriété intellectuelle</h3>
      <p>Le contenu de ce site est la propriété d'Alesium, sauf mention contraire.</p>
      <h3>Responsabilité</h3>
      <p>Informations fournies à titre indicatif ; Alesium ne saurait être tenu responsable d’un usage inapproprié.</p>
    `;

    const rgpdContent = `
      <h2>Politique RGPD</h2>
      <h3>Données collectées</h3>
      <ul>
        <li>Identification (nom, prénom)</li>
        <li>Contact (email, téléphone)</li>
        <li>Contenu de vos demandes</li>
      </ul>
      <h3>Finalités</h3>
      <ul>
        <li>Répondre à vos demandes</li>
        <li>Fournir nos services</li>
        <li>Communication (avec votre consentement)</li>
      </ul>
      <h3>Base légale</h3>
      <ul>
        <li>Consentement</li>
        <li>Exécution contractuelle</li>
        <li>Intérêt légitime</li>
      </ul>
      <h3>Droits</h3>
      <ul>
        <li>Accès, rectification, effacement, opposition, portabilité</li>
      </ul>
      <p>Contact : <strong>contact@alesium.fr</strong></p>
    `;

    function openModal(content) {
      if (!modal || !modalBody) return;
      modalBody.innerHTML = content;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      if (!modal) return;
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }

    mentionsLink?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(mentionsContent);
    });
    rgpdLink?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(rgpdContent);
    });
    modalClose?.addEventListener("click", closeModal);
    overlay?.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLegalModal);
  } else {
    initLegalModal();
  }

  /* ==========================
     Données PROJETS (texte 2025-08-20)
     + mapping images existantes
  ===========================*/
  const RAW_DATA = {
    version: "2025-08-20",
    projects: [
      {
        id: 1,
        slug: "optimisation-fabrication-escaliers-acier",
        title: "Optimisation du temps de fabrication d’escaliers en acier",
        client_type: "Atelier de métallerie (sur-mesure)",
        summary:
          "Industrialisation d’un atelier d’escaliers acier sans perte de qualité : standardisation, outillage, procédures et flux.",
        context:
          "Fabrication artisanale d’escaliers sur-mesure ; besoin d’augmenter le débit et de fiabiliser la production.",
        interventions: [
          "Standardisation du dossier technique (gabarits CAO des limons, repères de perçage)",
          "Optimisation des imbrications de découpe laser pour réduire les chutes",
          "Conception orientée pliage CNC (prises de référence, tolérances, séquences)",
          "Conception d’un marbre 2 × 4 m pour mise en position en une seule prise",
          "Revue des modes opératoires et rédaction de procédures de soudage TIG/MIG",
        ],
        technologies: [
          "Industrialisation",
          "Conception mécanique",
          "DFMA",
          "Soudage TIG/MIG",
          "Outillage d’assemblage",
        ],
        results: [
          "Temps de fabrication réduit de 20 h à 8 h (−60 %, x2,5 de débit)",
          "Coût de production total −61 %",
          "Masse −32 % (manutention et pose simplifiées)",
          "Réduction des non-conformités et des reprises",
          "Flux atelier fluidifiés par la standardisation",
        ],
        metrics: {
          hours_before: 20,
          hours_after: 8,
          time_reduction_percent: 60,
          cost_reduction_percent: 61,
          mass_reduction_percent: 32,
        },
        duration: {
          total_days: 12,
          spread: "3 mois",
          breakdown: [
            "Audit",
            "CAO & outillage",
            "Pilote atelier",
            "Accompagnement premières séries",
          ],
        },
        tags: ["escalier", "acier", "industrialisation", "atelier", "soudage", "DFMA"],
      },
      {
        id: 2,
        slug: "ligne-production-low-tech-presse-40t",
        title:
          "Conception & mise en service d’une première ligne de production low-tech",
        client_type: "Startup (industrialisation initiale)",
        summary:
          "Presse statique 40 t + chariot d’interface et outillages dédiés ; architecture low-tech robuste, maintenance simple.",
        context:
          "Démarrage industriel sans énergie motorisée : priorité à la robustesse, la sécurité et la disponibilité.",
        interventions: [
          "Co-rédaction du cahier des charges fonctionnel et technique",
          "Études de variantes chiffrées (TCO, risques, délais)",
          "CAO + calculs statiques/dynamiques",
          "Découpe laser, usinage, pliage, ajustage",
          "Soudage TIG/MAG, montage à blanc, essais, formation",
          "Livraison et documentation d’exploitation",
        ],
        technologies: ["Conception mécanique", "DFMA", "AMDEC", "Ergonomie & sécurité machine"],
        results: [
          "Ligne opérationnelle depuis fin 2024",
          "Pressage jusqu’à 40 t conforme aux spécifications",
          "Cahier des charges et délais tenus",
          "Lancement des premières productions",
        ],
        metrics: { press_force_tonnes: 40, commissioning_date: "2024-12-01" },
        duration: {
          total_days: 52,
          breakdown: [
            "Cahier des charges & variantes : 10 j",
            "CAO & calculs : 21 j",
            "Fabrication : 17 j",
            "Mise en service & formation : 4 j",
          ],
        },
        tags: ["ligne de production", "presse", "low-tech", "sécurité", "mise en service"],
      },
      {
        id: 3,
        slug: "cadre-vtt-descente-acier-25cd4s",
        title: "Développement d’un cadre de VTT de descente (DH) – acier 25CD4S",
        client_type: "Startup cycles (October Bike)",
        summary:
          "Cinématique optimisée, DFMA et gammes de fabrication ; gabarits, reprises après soudure et qualification procédés.",
        context:
          "Premier cadre DH conçu et fabriqué en France ; contrainte coût/industrialisation élevée.",
        interventions: [
          "Itérations CAO cinématique (ratios de compression, fin de course, maintien en milieu de course)",
          "Cost-to-design : choix de cinématique vs coûts d’outillage/fabrication",
          "Rédaction des gammes et choix procédés (grugeage, chambrage, TIG)",
          "Outillage one-shot low-cost pour prototypage",
          "Calculs mécaniques (statique & pseudo-dynamique), prévention ZAT, optimisation cordons",
          "Mise en production : gabarits, usinage tour/fraiseuse (conv. + CNC), reprises après soudure",
          "Boucles rapides terrain ↔ CAO ↔ fabrication",
        ],
        technologies: [
          "Conception mécano-soudée",
          "Prototypage rapide",
          "Qualification soudure",
          "DFMEA",
        ],
        materials: ["Acier 25CD4S (Cr-Mo)"],
        deliverables: [
          "Dossiers CAO/plan",
          "Gabarits de soudage",
          "Gammes & nomenclatures",
          "Recommandations procédés & contrôle",
        ],
        tags: ["VTT", "cadre", "cinématique", "mécano-soudé", "prototypage", "DFMA"],
      },
      {
        id: 4,
        slug: "cintreuse-galets-manuelle-16mm",
        title: "Conception & fabrication d’une cintreuse à galets manuelle",
        client_type: "Atelier fabrication / outillage",
        summary:
          "Outillage de cintrage à froid économique et robuste, jusqu’au carré 16 × 16.",
        context:
          "Besoin d’un outillage simple, fiable et peu coûteux pour cintrage à froid de profils acier.",
        interventions: [
          "CAO orientée cost-to-design (standardisation, tolérances réalistes)",
          "Mise en fabrication : découpe laser + tournage des galets/axes",
          "Essais et ajustements (géométrie, effort opérateur)",
          "Livraison avec fiche d’utilisation/maintenance",
        ],
        technologies: ["Conception mécanique", "Outillage", "Fabrication unitaire"],
        results: [
          "Cahier des charges respecté",
          "Coût maîtrisé",
          "Cintrage à froid jusqu’au carré 16 × 16",
        ],
        metrics: { max_section_mm: [16, 16], process: "cintrage à froid" },
        duration: { total_days: 1, breakdown: ["CAO : 0,5 j", "Fabrication : 0,5 j"] },
        tags: ["outillage", "cintrage", "galets", "cost-to-design"],
      },
      {
        id: 5,
        slug: "poc-impression-3d-metal-conduction-fdm",
        title: "Preuve de concept — Impression 3D métal par conduction (type FDM)",
        client_type: "R&D / levée de fonds",
        summary:
          "Extrusion métallique par conduction thermique ; validation expérimentale avec buse Ø 0,4 mm et cadrage IP.",
        context:
          "Démontrer la faisabilité d’une extrusion métal par conduction pour sécuriser un tour de financement.",
        approach_expert: [
          "Revue bibliographique, antériorités et cartographie IP",
          "Modélisation thermique transitoire (bilans énergétiques, pertes convection/rayonnement)",
          "Définition de fenêtres procédé (T° buse/fil, effort d’extrusion, vitesse/pas vs Ø 0,4 mm)",
          "Analyse tribologique et contraintes internes (adhésion couche à couche, retrait)",
          "Banc d’essai instrumenté et itérations rapides test/erreur",
          "Prototypage fonctionnel via SLS Inconel pour pièces exposées",
          "Rédaction et dépôt de brevet (principe, fenêtres procédé, géométrie d’extrusion)",
        ],
        technologies: ["Industrialisation", "Conception mécanique", "Thermique", "Procédés additifs"],
        results: [
          "POC validé : fusion/expulsion d’acier à travers buse Ø 0,4 mm avec cordon continu",
          "Levée de fonds (tour 1) validée sur base technique + positionnement IP",
        ],
        metrics: { nozzle_diameter_mm: 0.4, material: "Acier (tests), outillages SLS Inconel" },
        duration: { total_days: null, breakdown: [] },
        ip_status: "Brevet déposé",
        tags: ["impression 3D métal", "conduction", "R&D", "brevet", "POC"],
      },
      {
        id: 6,
        slug: "robot-parallele-3-axes-suppression-jeux",
        title: "R&D robot parallèle 3 axes — suppression intégrale des jeux",
        client_type: "R&D robotique / automatisation",
        summary:
          "Architecture de contact double bille préchargée élastiquement ; zéro backlash mesuré, rigidité et accélérations accrues.",
        context:
          "Éliminer les jeux de rotulage pour améliorer rigidité, précision et productivité ; protéger l’invention.",
        principle_expert: [
          "Double contact bille sur surfaces de référence avec différentiel de potentiel mécanique",
          "Précharge élastique par tube/élément ressort garantissant contrainte permanente",
          "Fermeture cinématique isostatique sans backlash ni micro-basculement",
        ],
        interventions: [
          "Recherches d’antériorité et analyse de liberté résiduelle",
          "CAO et calculs de contact (Hertz) : contraintes locales, rigidité équivalente",
          "Analyse modale et rigidité de la chaîne cinématique",
          "Maquettes instrumentées, mesures de répétabilité/retour en position",
          "Rédaction et dépôt de brevet (architecture, précharge, interfaces)",
        ],
        technologies: [
          "Conception mécanique",
          "Robotique parallèle",
          "Calculs de contact",
          "Essais instrumentés",
        ],
        results: [
          "Jeu mesuré : 0 (à la résolution du banc)",
          "Accélérations exploitables ×5 sans vibration",
          "Précision et répétabilité améliorées (impression 3D, pick-and-place, lignes de production)",
        ],
        metrics: { measured_play_mm: 0, acceleration_factor: 5 },
        duration: { total_days: null, breakdown: [] },
        ip_status: "Brevet déposé",
        tags: ["robotique", "parallèle", "contact hertzien", "précharge", "brevet"],
      },
    ],
  };

  // Réutilisation des images déjà présentes dans /assets/projets (mêmes chemins qu’avant)
  const previewById = {
    1: "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/1a.png",
    2: "assets/projets/2-fabrication-dune-ligne-de-production/1b.jpg",
    3: "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/1c.png",
    4: "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/1d.jpeg",
    5: "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/1e.JPG",
    6: "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/2f.JPG",
  };
  const imagesById = {
    1: [
      "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/1a.png",
      "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/2a.png",
      "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/3a.png",
      "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/4a.png",
      "assets/projets/1-optimisation-du-temps-de-fabrication-descalier-en-acier/5a.png",
    ],
    2: [
      "assets/projets/2-fabrication-dune-ligne-de-production/1b.jpg",
      "assets/projets/2-fabrication-dune-ligne-de-production/2b.jpg",
      "assets/projets/2-fabrication-dune-ligne-de-production/3b.jpg",
      "assets/projets/2-fabrication-dune-ligne-de-production/4b.png",
      "assets/projets/2-fabrication-dune-ligne-de-production/5b.png",
      "assets/projets/2-fabrication-dune-ligne-de-production/6b.png",
    ],
    3: [
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/1c.png",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/2c.png",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/3c.JPG",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/4c.JPG",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/5c.png",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/6c.png",
      "assets/projets/3-dveloppement-dun-cadre-de-vtt-de-descente/7c.JPG",
    ],
    4: [
      "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/1d.jpeg",
      "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/2d.jpeg",
      "assets/projets/4-conception-et-fabrication-dune-cintreuse-galets-manuelle/3d.jpeg",
    ],
    5: [
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/1e.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/2e.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/3e.jpg",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/4e.jpg",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/5e.jpg",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 2.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 4.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 6.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 7.JPG",
      "assets/projets/5-preuve-de-concept-impression-3d-metal-par-conduction/coupe 8.JPG",
    ],
    6: [
      "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/2f.JPG",
      "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/3f.JPG",
      "assets/projets/6-supression-des-jeux-mcanique-dans-robot-parrallle-3-axe/4f.JPG",
    ],
  };

  function normalizeProjects(raw) {
    return raw.projects.map((p) => {
      const preview = previewById[p.id] || "";
      const images = imagesById[p.id] || [];
      const mergedSummary = [p.summary, p.context].filter(Boolean).join(" ");
      const bulletList =
        p.interventions || p.approach_expert || p.principle_expert || [];
      const mergedResults = Array.isArray(p.results)
        ? p.results.join(" ; ")
        : p.results || "";
      const mergedTech = Array.isArray(p.technologies)
        ? p.technologies.join(", ")
        : p.tech || "";

      return {
        slug: p.slug,
        title: p.title,
        preview,
        images,
        summary: mergedSummary,
        key_points: bulletList,
        results: mergedResults,
        tech: mergedTech,
        client_type: p.client_type || null,
        tags: p.tags || [],
        metrics: p.metrics || null,
        duration: p.duration || null,
        materials: p.materials || null,
        deliverables: p.deliverables || null,
        ip_status: p.ip_status || null,
      };
    });
  }
  const projects = normalizeProjects(RAW_DATA);

  /* ==========================
     Carrousel / Cartes projets
  ===========================*/
  const carouselHost = document.querySelector("#projets .track");
  const detail = document.getElementById("projet-detail");

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

    // Si les titres ne commencent pas par un numéro, l’ordre d’entrée est conservé
    const sorted = items
      .slice()
      .sort((a, b) => {
        const A = parseInt((a.title || "").match(/^(\d+)/)?.[1] || "999", 10);
        const B = parseInt((b.title || "").match(/^(\d+)/)?.[1] || "999", 10);
        return A - B;
      });

    const duplicated = [...sorted, ...sorted];
    carouselHost.innerHTML = duplicated.map(cardHTML).join("");

    // Drag inertiel (desktop + mobile)
    let isDragging = false,
      startX = 0,
      currentTranslate = 0,
      prevTranslate = 0,
      animationID = 0,
      startTime = 0;

    function toggleAutoScroll(enable) {
      carouselHost?.classList[enable ? "add" : "remove"]("auto-scroll");
    }
    setTimeout(() => {
      if (!isDragging) toggleAutoScroll(true);
    }, 2000);

    function getPositionX(e) {
      return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    }
    function animation() {
      if (isDragging) {
        carouselHost.style.transform = `translateX(${currentTranslate}px)`;
        requestAnimationFrame(animation);
      }
    }
    function startDrag(e) {
      if (e.target.closest(".card a")) return; // ne bloque pas les liens
      isDragging = true;
      startTime = Date.now();
      toggleAutoScroll(false);
      carouselHost.classList.add("dragging");
      startX = getPositionX(e);
      prevTranslate = currentTranslate;
      animationID = requestAnimationFrame(animation);
    }
    function drag(e) {
      if (!isDragging) return;
      const cur = getPositionX(e);
      currentTranslate = prevTranslate + (cur - startX) * 0.8;
    }
    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      carouselHost.classList.remove("dragging");
      cancelAnimationFrame(animationID);
      const duration = Date.now() - startTime;
      const distance = currentTranslate - prevTranslate;
      const velocity = distance / duration;
      if (Math.abs(velocity) > 0.1) currentTranslate += velocity * 200;

      setTimeout(() => {
        if (!isDragging) {
          toggleAutoScroll(true);
          currentTranslate = 0;
          prevTranslate = 0;
          carouselHost.style.transform = "translateX(0)";
        }
      }, 3000);
    }

    carouselHost.addEventListener("mousedown", startDrag);
    carouselHost.addEventListener("touchstart", startDrag, { passive: true });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: true });

    carouselHost.addEventListener("mouseenter", () => {
      if (!isDragging) carouselHost.style.animationPlayState = "paused";
    });
    carouselHost.addEventListener("mouseleave", () => {
      if (!isDragging) carouselHost.style.animationPlayState = "running";
    });
  }

  /* ==========================
     Détail projet + Lightbox
  ===========================*/
  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const lightboxPrev = lightbox?.querySelector(".prev");
  const lightboxNext = lightbox?.querySelector(".next");
  const lightboxCounter = lightbox?.querySelector(".lightbox-counter");

  let currentImages = [];
  let currentImageIndex = 0;
  let startTouchX = 0;
  let startTouchY = 0;

  function openLightbox(images, startIndex = 0) {
    if (!lightbox || !images || !images.length) return;
    currentImages = images;
    currentImageIndex = startIndex;
    showCurrentImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    currentImages = [];
    currentImageIndex = 0;
  }
  function showCurrentImage() {
    if (!lightboxImg || !currentImages[currentImageIndex]) return;
    lightboxImg.src = currentImages[currentImageIndex];
    lightboxImg.alt = `Image ${currentImageIndex + 1}`;
    if (lightboxCounter)
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
    if (lightboxPrev)
      lightboxPrev.style.opacity = currentImageIndex > 0 ? "1" : "0.5";
    if (lightboxNext)
      lightboxNext.style.opacity =
        currentImageIndex < currentImages.length - 1 ? "1" : "0.5";
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

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", showPrevImage);
  lightboxNext?.addEventListener("click", showNextImage);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPrevImage();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      showNextImage();
    }
  });
  if (lightbox) {
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        if (!startTouchX && !startTouchY) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = startTouchX - endX;
        const dy = startTouchY - endY;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) < 50) return;
        if (dx > 0) showNextImage();
        else showPrevImage();
        startTouchX = 0;
        startTouchY = 0;
      },
      { passive: true }
    );
  }

  function addGalleryListeners() {
    document.querySelectorAll(".gallery img").forEach((img, index, all) => {
      img.addEventListener("click", (e) => {
        e.preventDefault();
        const images = Array.from(all).map((im) => im.src);
        openLightbox(images, index);
      });
    });
  }

  function renderDetail(p) {
    if (!detail) return;

    const imageGallery =
      p.images && p.images.length
        ? `<div class="gallery">${p.images
            .map(
              (src) =>
                `<img src="${src}" alt="${p.title}" onerror="this.style.display='none'">`
            )
            .join("")}</div>`
        : "";

    const bullets = p.key_points && p.key_points.length ? p.key_points : [];
    const keyPoints =
      bullets.length
        ? `<h3>Points clés</h3><ul class="bullets">${bullets
            .map((point) => `<li>${point}</li>`)
            .join("")}</ul>`
        : "";

    const tags =
      p.tags && p.tags.length
        ? `<div class="tags">${p.tags
            .map((t) => `<span class="tag">${t}</span>`)
            .join("")}</div>`
        : "";

    const metrics = p.metrics
      ? `<div class="metrics">
          <h3>Métriques</h3>
          <ul class="bullets">
            ${Object.entries(p.metrics)
              .map(
                ([k, v]) =>
                  `<li><strong>${k} :</strong> ${
                    Array.isArray(v) ? v.join(" × ") : v
                  }</li>`
              )
              .join("")}
          </ul>
        </div>`
      : "";

    const duration = p.duration
      ? `<div class="duration">
          <h3>Durée</h3>
          <p><em>${p.duration.total_days ?? "N/A"} jours</em>${
            p.duration.spread ? " — " + p.duration.spread : ""
          }</p>
          ${
            p.duration.breakdown?.length
              ? `<ul class="bullets">${p.duration.breakdown
                  .map((x) => `<li>${x}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </div>`
      : "";

    const tech = p.tech ? `<h3>Technologies</h3><p>${p.tech}</p>` : "";
    const extras = `
      ${p.client_type ? `<p class="muted"><strong>Client :</strong> ${p.client_type}</p>` : ""}
      ${
        p.materials?.length
          ? `<p class="muted"><strong>Matériaux :</strong> ${p.materials.join(
              ", "
            )}</p>`
          : ""
      }
      ${
        p.deliverables?.length
          ? `<p class="muted"><strong>Livrables :</strong> ${p.deliverables.join(
              ", "
            )}</p>`
          : ""
      }
      ${p.ip_status ? `<p class="muted"><strong>PI :</strong> ${p.ip_status}</p>` : ""}
    `;

    detail.classList.remove("hidden", "closing");
    detail.setAttribute("aria-hidden", "false");
    detail.innerHTML = `
      <div class="project-detail-header">
        <h2>${p.title}</h2>
        <button class="close-project-btn" onclick="hideDetail()" title="Fermer le projet">×</button>
      </div>
      <p class="muted">${p.summary || ""}</p>
      ${extras}
      ${imageGallery}
      <div class="cols">
        <div>
          ${keyPoints}
          ${tech}
          ${tags}
        </div>
        <div>
          ${p.results ? `<h3>Résultats</h3><p>${p.results}</p>` : ""}
          ${metrics}
          ${duration}
        </div>
      </div>
    `;

    setTimeout(addGalleryListeners, 50);
    detail.classList.add("opening");
    setTimeout(() => {
      window.scrollTo({ top: detail.offsetTop - 100, behavior: "smooth" });
    }, 80);
    setTimeout(() => detail.classList.remove("opening"), 400);
  }

  function hideDetail() {
    if (!detail) return;
    detail.classList.add("closing");
    const projectsSection = document.getElementById("projets");
    if (projectsSection) {
      window.scrollTo({ top: projectsSection.offsetTop - 100, behavior: "smooth" });
    }
    setTimeout(() => {
      detail.classList.add("hidden");
      detail.classList.remove("closing");
      detail.setAttribute("aria-hidden", "true");
      detail.innerHTML = "";
    }, 350);
  }
  window.hideDetail = hideDetail;

  /* ==========================
     Router SPA (projets + légales)
  ===========================*/
  function route(items) {
    const hash = location.hash || "";
    const projectMatch = hash.match(/^#\/projets\/(.+)$/);
    if (projectMatch) {
      const slug = projectMatch[1];
      const p = items.find((x) => x.slug === slug);
      if (p) renderDetail(p);
      else hideDetail();
      return;
    }
    // pages légales
    if (hash === "#/mentions-legales") {
      showSection("#mentions-legales");
      return;
    }
    if (hash === "#/rgpd") {
      showSection("#rgpd");
      return;
    }
    hideDetail();
  }

  function showSection(sel) {
    const ml = document.getElementById("mentions-legales");
    const rg = document.getElementById("rgpd");
    [ml, rg].forEach((s) => {
      if (!s) return;
      s.classList.add("hidden");
      s.setAttribute("aria-hidden", "true");
    });
    const sec = document.querySelector(sel);
    if (sec) {
      sec.classList.remove("hidden");
      sec.setAttribute("aria-hidden", "false");
      setTimeout(() => {
        window.scrollTo({ top: sec.offsetTop - 100, behavior: "smooth" });
      }, 80);
    }
  }

  window.addEventListener("hashchange", () => route(projects));

  /* ==========================
     Smooth scroll ancres locales
  ===========================*/
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]:not([href="#/"])');
    if (!link) return;
    const href = link.getAttribute("href");
    if (href.startsWith("#/")) return;
    if (href === "#" || href.length <= 1) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerHeight = 80;
      const y = target.offsetTop - headerHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });

  /* ==========================
     Accordéons FAQ / CV
  ===========================*/
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const isOpen = q.getAttribute("aria-expanded") === "true";
      const answer = q.nextElementSibling;
      faqQuestions.forEach((other) => {
        if (other !== q) {
          other.setAttribute("aria-expanded", "false");
          const a = other.nextElementSibling;
          a?.classList.remove("open");
        }
      });
      if (isOpen) {
        q.setAttribute("aria-expanded", "false");
        answer?.classList.remove("open");
      } else {
        q.setAttribute("aria-expanded", "true");
        answer?.classList.add("open");
      }
    });
  });

  const cvQuestions = document.querySelectorAll(".cv-question");
  cvQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const isOpen = q.getAttribute("aria-expanded") === "true";
      const answer = q.nextElementSibling;
      if (isOpen) {
        q.setAttribute("aria-expanded", "false");
        answer?.classList.remove("open");
      } else {
        q.setAttribute("aria-expanded", "true");
        answer?.classList.add("open");
      }
    });
  });

  /* ==========================
     Offres & Tarifs — accordéon
  ===========================*/
  function initPricingAccordion() {
    const pricingCards = document.querySelectorAll(".pricing-card");
    pricingCards.forEach((card) => {
      const toggle = card.querySelector(".card-toggle");
      const detail = card.querySelector(".card-detail");
      if (!toggle || !detail) return;

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = toggle.getAttribute("aria-expanded") === "true";

        pricingCards.forEach((other) => {
          if (other !== card) {
            const ot = other.querySelector(".card-toggle");
            const od = other.querySelector(".card-detail");
            if (ot && od) {
              ot.setAttribute("aria-expanded", "false");
              od.setAttribute("aria-hidden", "true");
              od.classList.remove("open");
            }
          }
        });

        if (isOpen) {
          toggle.setAttribute("aria-expanded", "false");
          detail.setAttribute("aria-hidden", "true");
          detail.classList.remove("open");
        } else {
          toggle.setAttribute("aria-expanded", "true");
          detail.setAttribute("aria-hidden", "false");
          detail.classList.add("open");
          setTimeout(() => {
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        }
      });

      card.addEventListener("click", (e) => {
        if (!detail.contains(e.target) && e.target !== toggle) {
          toggle.click();
        }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPricingAccordion);
  } else {
    initPricingAccordion();
  }

  /* ==========================
     Grilles tarifs: adaptation
  ===========================*/
  function adaptPricingGrids() {
    const grids = document.querySelectorAll(".pricing-grid");
    grids.forEach((grid) => {
      const n = grid.querySelectorAll(".pricing-card").length;
      grid.classList.remove("single-card", "two-cards", "three-cards", "four-cards", "multiple-cards");
      if (n === 1) grid.classList.add("single-card");
      else if (n === 2) grid.classList.add("two-cards");
      else if (n === 3) grid.classList.add("three-cards");
      else if (n === 4) grid.classList.add("four-cards");
      else grid.classList.add("multiple-cards");
    });
  }
  document.addEventListener("DOMContentLoaded", () => setTimeout(adaptPricingGrids, 400));

  /* ==========================
     Effet fade-in images (UX)
  ===========================*/
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", () => (img.style.opacity = "1"));
      img.style.opacity = "0";
      img.style.transition = "opacity 0.3s ease";
    });
  });

  /* ==========================
     Initialisation principale
  ===========================*/
  renderCarousel(projects);
  route(projects);
})();
