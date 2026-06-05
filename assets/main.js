/* ============================================================
   FROSTLINE WELLNESS — main.js
   Handles: mobile nav, FAQ accordion, scroll reveal,
   and sticky header shadow.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- MOBILE HAMBURGER / NAV --------------------------------
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when any nav link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ---- NAV DROPDOWN ------------------------------------------
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', e => {
      if (e.target.closest('.nav-dropdown-menu')) return;
      const isOpen = dropdown.classList.toggle('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });


  // ---- STICKY HEADER SHADOW ----------------------------------
  const siteHeader = document.getElementById('siteHeader');

  if (siteHeader) {
    const handleScroll = () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }


  // ---- FAQ ACCORDION -----------------------------------------
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer  = btn.nextElementSibling;
      const isOpen  = btn.classList.contains('open');

      // Close all open items first
      document.querySelectorAll('.faq-question.open').forEach(openBtn => {
        openBtn.classList.remove('open');
        openBtn.setAttribute('aria-expanded', 'false');
        openBtn.nextElementSibling.classList.remove('open');
      });

      // If it was closed, open it
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });

    // Keyboard support
    btn.setAttribute('aria-expanded', 'false');
  });


  // ---- SCROLL REVEAL (IntersectionObserver) ------------------
  const revealItems = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings that appear in the same frame
          const siblings = [...entry.target.parentElement.querySelectorAll('.reveal-item:not(.revealed)')];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 320);

          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(el => observer.observe(el));
  } else {
    // Fallback: just show everything
    revealItems.forEach(el => el.classList.add('revealed'));
  }


  // ---- BLOG PAGINATION + CATEGORY FILTER ----------------------
  const blogGrid = document.querySelector('.blog-grid-wide');
  if (blogGrid) {
    const POSTS_PER_PAGE = 3;
    const articles = [...blogGrid.querySelectorAll('.blog-card')];
    const paginationEl = document.querySelector('.pagination');
    const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
    let currentPage = 1;
    let currentCategory = 'all';

    function getFiltered() {
      if (currentCategory === 'all') return articles;
      return articles.filter(a => {
        const cat = a.querySelector('.blog-category');
        return cat && cat.textContent.trim() === currentCategory;
      });
    }

    function buildPagination(totalPages) {
      if (!paginationEl) return;
      paginationEl.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => showPage(i));
        paginationEl.appendChild(btn);
      }
      if (totalPages > 1) {
        const next = document.createElement('button');
        next.className = 'pagination-btn pagination-next';
        next.innerHTML = 'Next &rarr;';
        next.addEventListener('click', () => { if (currentPage < totalPages) showPage(currentPage + 1); });
        paginationEl.appendChild(next);
      }
    }

    function showPage(page) {
      const filtered = getFiltered();
      const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE) || 1;
      currentPage = Math.min(page, totalPages);

      const exiting = articles.filter(a => a.style.display !== 'none');
      const start = (currentPage - 1) * POSTS_PER_PAGE;
      const entering = filtered.slice(start, start + POSTS_PER_PAGE);

      buildPagination(totalPages);
      exiting.forEach(a => a.classList.add('page-exit'));

      setTimeout(() => {
        articles.forEach(a => {
          a.classList.remove('page-exit');
          a.style.display = 'none';
        });
        entering.forEach(a => {
          a.style.display = '';
          a.classList.add('revealed', 'page-enter');
          setTimeout(() => a.classList.remove('page-enter'), 400);
        });
      }, 250);
    }

    subcategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subcategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.textContent.trim() === 'All Posts' ? 'all' : btn.textContent.trim();
        showPage(1);
      });
    });

    showPage(1);
  }


  // ---- PRODUCT VARIANT SWITCHER ------------------------------
  // Each product page defines window.productVariants = { 'style-lid': { main, thumbs[] } }
  const mainImg   = document.getElementById('mainProductImg');
  const thumbsEl  = document.getElementById('productThumbs');

  if (mainImg && thumbsEl && window.productVariants) {
    let selectedStyle = document.querySelector('[data-variant="style"].selected')?.dataset.value || '';
    let selectedLid   = document.querySelector('[data-variant="lid"].selected')?.dataset.value   || '';

    function variantKey() { return `${selectedStyle}-${selectedLid}`; }

    function buildThumbs(thumbUrls) {
      thumbsEl.innerHTML = '';
      thumbUrls.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.className = 'product-thumb' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', 'Product image ' + (i + 1));
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        btn.appendChild(img);
        btn.addEventListener('click', () => {
          document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          mainImg.src = src;
        });
        thumbsEl.appendChild(btn);
      });
    }

    function updateVariant() {
      const key  = variantKey();
      const data = window.productVariants[key];
      if (!data) return;
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = data.main;
        mainImg.style.opacity = '1';
        buildThumbs(data.thumbs);
      }, 180);
    }

    document.querySelectorAll('[data-variant]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.variant;
        document.querySelectorAll(`[data-variant="${type}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (type === 'style') selectedStyle = btn.dataset.value;
        if (type === 'lid')   selectedLid   = btn.dataset.value;
        updateVariant();
      });
    });

    // Init thumbnails from default variant
    const initData = window.productVariants[variantKey()];
    if (initData) buildThumbs(initData.thumbs);
  }


});
