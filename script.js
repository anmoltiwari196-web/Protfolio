const canvas = document.getElementById('webCanvas');
const ctx = canvas.getContext('2d');
let W, H;
let particles = [];
let spider = document.getElementById('spider');

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function WebParticle(x, y, vx, vy, life, color) {
  this.x = x; this.y = y;
  this.vx = vx; this.vy = vy;
  this.life = life; this.maxLife = life;
  this.color = color || '#cc0000';
  this.alpha = 1;
}
WebParticle.prototype.update = function() {
  this.x += this.vx;
  this.y += this.vy;
  this.vx *= 0.98;
  this.vy *= 0.98;
  this.life--;
  this.alpha = Math.max(0, this.life / this.maxLife);
};
WebParticle.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.globalAlpha = this.alpha * 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;
};

function shootWeb(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(10, Math.floor(dist / 8));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x1 + dx * t + (Math.random() - 0.5) * 20;
    const cy = y1 + dy * t + (Math.random() - 0.5) * 20;
    const vx = (dx / steps) * 1.5 + (Math.random() - 0.5) * 3;
    const vy = (dy / steps) * 1.5 + (Math.random() - 0.5) * 3;
    particles.push(new WebParticle(cx, cy, vx, vy, 60 + Math.random() * 30));
  }
  for (let i = 0; i < steps; i++) {
    const t1 = i / steps, t2 = (i + 1) / steps;
    const lx1 = x1 + dx * t1, ly1 = y1 + dy * t1;
    const lx2 = x1 + dx * t2, ly2 = y1 + dy * t2;
    particles.push({ x: lx1, y: ly1, x2: lx2, y2: ly2, life: 40, maxLife: 40, draw: function() {
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x2, this.y2);
      ctx.strokeStyle = '#cc0000'; ctx.globalAlpha = (this.life / this.maxLife) * 0.5;
      ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
      this.life--;
    }, update: function() { this.life--; return this.life > 0; } });
  }
}

function swingSpider() {
  spider.classList.add('swinging');
  spider.classList.add('visible');
  setTimeout(() => spider.classList.remove('swinging'), 1200);
}

const sections = document.querySelectorAll('.section');
const navbar = document.getElementById('navbar');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('web-sling');
      setTimeout(() => entry.target.classList.remove('web-sling'), 1000);
      swingSpider();
      const trigger = entry.target.querySelector('.web-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const sx = 30 + spider.offsetWidth / 2;
        const sy = window.scrollY + window.innerHeight / 2;
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;
        shootWeb(sx, sy, tx, ty);
      }
      const node = entry.target.querySelector('.web-node');
      if (node) node.classList.add('visible');
    }
  });
}, { threshold: 0.25 });

sections.forEach(s => sectionObserver.observe(s));

const skillBars = document.querySelectorAll('.skill-bar');
const skillObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      bar.style.width = bar.getAttribute('data-width') + '%';
      bar.classList.add('visible');
      obs.unobserve(bar);
    }
  });
}, { threshold: 0.5 });
skillBars.forEach(b => skillObserver.observe(b));

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav-links');
mobileToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

function animate() {
  ctx.clearRect(0, 0, W, H);
  particles = particles.filter(p => {
    if (typeof p.update === 'function') p.update();
    else return p.life > 0;
    if (typeof p.draw === 'function') p.draw();
    return p.life > 0;
  });
  requestAnimationFrame(animate);
}
animate();
