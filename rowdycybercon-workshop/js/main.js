(function () {
  const NAV = [
    { dir: 'workshop/', items: [
      { href: 'about.html', file: 'whoami', ext: '.sh', cmd: './whoami.sh' },
      { href: 'foundations.html', file: '01-web-basics', ext: '.md' },
      { href: 'tooling.html', file: '02-tooling', ext: '.md' },
      { href: 'recon.html', file: '03-recon', ext: '.md' },
      { href: 'injection.html', file: '04-injection', ext: '.md' },
      { href: 'xss.html', file: '05-xss', ext: '.md' },
      { href: 'access-control.html', file: '06-access-control', ext: '.md' },
      { href: 'methodology.html', file: '07-game-plan', ext: '.md' },
    ]},
    { dir: 'labs/', items: [
      { href: 'labs/index.html', file: 'capture-the-flag', ext: '.sh', cmd: 'ls -la labs/' },
    ]},
  ];

  const root = document.body.dataset.root || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- landing boot sequence ----------
  const boot = document.getElementById('boot');
  if (boot) {
    const lines = [
      ['<span class="ps1">pyrus@rowdy<span class="dim">:</span><span class="path">~</span>$</span> ./breaking-the-web --start', 0],
      ['<span class="dim">[*]</span> loading modules ............ <span class="ok">7 found</span>', 350],
      ['<span class="dim">[*]</span> spinning up vulnerable apps  <span class="ok">8 online</span>', 300],
      ['<span class="dim">[*]</span> hiding flags ............... <span class="ok">done</span>', 300],
      ['<span class="warn-txt">[!]</span> authorized targets only. play nice.', 300],
    ];
    const reveal = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
    document.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = 'about.html'; });

    if (reduceMotion) {
      boot.innerHTML = lines.map(l => `<div class="boot-line">${l[0]}</div>`).join('');
      reveal();
      return;
    }
    let i = 0;
    const next = () => {
      if (i >= lines.length) { setTimeout(reveal, 250); return; }
      const [html, delay] = lines[i++];
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'boot-line';
        d.innerHTML = html;
        boot.appendChild(d);
        next();
      }, delay);
    };
    setTimeout(next, 300);
    return;
  }

  // ---------- sidebar ----------
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const current = location.pathname.replace(/\/$/, '/index.html');
  const flat = NAV.flatMap(s => s.items);
  let active = null;

  let html = `<div class="sidebar-header"><a href="${root}index.html" class="sidebar-logo">
    <span class="brand">breaking<b>_</b>the<b>_</b>web</span>
    <span class="sub">~/rowdy-cybercon</span></a></div><div class="sidebar-nav">`;
  NAV.forEach(section => {
    html += `<div class="tree-dir">${section.dir}</div><ul>`;
    section.items.forEach(item => {
      const isActive = current.endsWith('/' + item.href);
      if (isActive) active = item;
      const ico = item.ext === '.sh' ? '$' : '#';
      html += `<li><a href="${root}${item.href}"${isActive ? ' class="active"' : ''}>
        <span class="file-ico">${ico}</span><span>${item.file}<span class="ext">${item.ext}</span></span></a></li>`;
    });
    html += '</ul>';
  });
  const pos = active ? `${String(flat.indexOf(active) + 1).padStart(2, '0')}/${String(flat.length).padStart(2, '0')}` : '--/--';
  html += `</div><div class="statusline"><span class="mode">NORMAL</span>
    <span class="file">${active ? active.file + active.ext : ''}</span><span class="pos">${pos}</span></div>`;
  sidebar.innerHTML = html;

  // ---------- prompt line above each page title ----------
  const h1 = document.querySelector('.page-content h1');
  if (active && h1) {
    const p = document.createElement('div');
    p.className = 'prompt-line';
    p.innerHTML = `<span class="ps1">pyrus@rowdy<span class="dim">:</span><span class="path">~/workshop</span>$</span> ` +
      (active.cmd || `cat ${active.file}${active.ext}`);
    h1.before(p);
  }

  const toggle = () => document.body.classList.toggle('nav-open');
  document.querySelector('.hamburger')?.addEventListener('click', toggle);
  document.querySelector('.sidebar-overlay')?.addEventListener('click', toggle);
})();
