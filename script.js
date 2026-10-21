// Liquid, cursor-reactive background
(function(){
  const canvas = document.getElementById('fluid-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const pointer = { x: w/2, y: h/2 };
  let hasPointer = false;
  window.addEventListener('pointermove', (e)=>{
    pointer.x = e.clientX; pointer.y = e.clientY; hasPointer = true;
  });
  window.addEventListener('pointerleave', ()=>{ hasPointer = false; });

  const palette = ['#5eead4', '#f5a623', '#7c8cf8'];
  const blobs = Array.from({length: 6}, (_, i) => ({
    x: w/2, y: h/2,
    vx: 0, vy: 0,
    radius: 220 + i * 40,
    ease: 0.028 + i * 0.01,
    offsetAngle: (i / 6) * Math.PI * 2,
    offsetDist: 60 + i * 18,
    color: palette[i % palette.length],
    t: Math.random() * 1000
  }));

  function frame(){
    if (!reduceMotion){
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const targetX = hasPointer ? pointer.x : w/2 + Math.sin(Date.now()/4000) * w * 0.15;
      const targetY = hasPointer ? pointer.y : h/2 + Math.cos(Date.now()/5000) * h * 0.15;

      blobs.forEach((b) => {
        b.t += 0.004;
        const wanderX = Math.cos(b.t + b.offsetAngle) * b.offsetDist;
        const wanderY = Math.sin(b.t + b.offsetAngle) * b.offsetDist;
        const tx = targetX + wanderX;
        const ty = targetY + wanderY;
        b.x += (tx - b.x) * b.ease;
        b.y += (ty - b.y) * b.ease;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, b.color + '33');
        grad.addColorStop(1, b.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// Nav: smooth scroll with sticky-header offset + active tab highlighting + mobile menu
(function(){
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function closeMobileMenu(){
    if(toggle) toggle.classList.remove('open');
    if(mobileNav) mobileNav.classList.remove('open');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  if(toggle && mobileNav){
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }

  function setActive(){
    const headerH = (header ? header.offsetHeight : 0) + 20;
    let current = sections[0];
    sections.forEach(sec => {
      if (sec && sec.getBoundingClientRect().top - headerH <= 0){
        current = sec;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', current && link.getAttribute('href') === ('#' + current.id));
    });
  }
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
})();

// Typewriter effect for hero terminal
(function(){
  const text = "Izhar Abbas — AI Automation, Development & Digital Services";
  const el = document.getElementById('typed');
  if(!el) return;
  let i = 0;
  function type(){
    if(i <= text.length){
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 45);
    }
  }
  type();
})();

// Scroll reveal
(function(){
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(el=> observer.observe(el));
})();

// Bank account copy functionality
(function() {
  const section = document.getElementById("bank-accounts");
  if (!section) return;

  const toast = section.querySelector("#bank-copy-toast");
  let toastTimer;

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();

    const copied = document.execCommand("copy");
    field.remove();

    if (!copied) throw new Error("Copy failed");
  }

  section.addEventListener("click", async (event) => {
    const button = event.target.closest(".copy-btn");
    if (!button || !section.contains(button)) return;

    const value = button.dataset.copy;
    if (!value) return;

    try {
      await copyText(value);
      button.textContent = "Copied ✓";
      if(toast){
        toast.textContent = "Copied successfully: " + value;
        toast.classList.add("show");
      }
    } catch (err) {
      if(toast){
        toast.textContent = "Copy failed. Please select and copy manually.";
        toast.classList.add("show");
      }
    }

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if(toast) toast.classList.remove("show");
      section.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.textContent = "Copy";
      });
    }, 1800);
  });
})();
