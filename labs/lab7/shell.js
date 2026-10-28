// Simulated server: emulates `ping -c 2 <host>` passed to /bin/sh. Nothing is actually executed.
const CWD = '/var/www/netping';
const FS = {
  '/': ['bin', 'etc', 'home', 'root', 'tmp', 'usr', 'var'],
  '/etc': ['hostname', 'os-release', 'passwd'],
  '/home': [], '/tmp': [], '/var': ['www'], '/var/www': ['netping'],
  '/var/www/netping': ['app.py', 'flag.txt', 'notes.txt', 'requirements.txt', 'static'],
  '/var/www/netping/static': ['style.css'],
};
const FILES = {
  '/var/www/netping/flag.txt': atob('UkNDe3NoM2xsX20zdDRjaDRyc19mdHd9') + '\n',
  '/var/www/netping/notes.txt': 'TODO: sanitize the host parameter before passing it to the shell!!\n',
  '/var/www/netping/requirements.txt': 'flask==2.0.1\n',
  '/var/www/netping/app.py':
    "import subprocess\nfrom flask import Flask, request\n\napp = Flask(__name__)\n\n" +
    "@app.route('/ping', methods=['POST'])\ndef ping():\n    host = request.form['host']\n" +
    "    return subprocess.getoutput(f'ping -c 2 {host}')\n",
  '/var/www/netping/static/style.css': 'body { font-family: sans-serif; }\n',
  '/etc/hostname': 'netping-prod-01\n',
  '/etc/os-release': 'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\n',
  '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nnetping:x:1000:1000::/home/netping:/bin/sh\n',
};

function resolve(path) {
  if (!path.startsWith('/')) path = CWD + '/' + path;
  const parts = [];
  path.split('/').forEach(p => {
    if (p === '' || p === '.') return;
    if (p === '..') parts.pop(); else parts.push(p);
  });
  return '/' + parts.join('/');
}

function splitArgs(s) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function ping(host) {
  host = host.trim();
  if (!host) return 'ping: usage error: Destination address required\n';
  if (!/^[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+$/.test(host) && host !== 'localhost') return `ping: ${host}: Name or service not known\n`;
  const ip = /^[\d.]+$/.test(host) ? host : '93.184.215.14';
  return [`PING ${host} (${ip}) 56(84) bytes of data.`,
    `64 bytes from ${ip}: icmp_seq=1 ttl=56 time=11.37 ms`,
    `64 bytes from ${ip}: icmp_seq=2 ttl=56 time=11.74 ms`, '',
    `--- ${host} ping statistics ---`,
    '2 packets transmitted, 2 received, 0% packet loss, time 1002ms', ''].join('\n');
}

function run(cmdline) {
  const argv = splitArgs(cmdline);
  if (!argv.length) return '';
  const [cmd, ...args] = argv;
  const paths = args.filter(a => !a.startsWith('-'));
  switch (cmd) {
    case 'whoami': return 'www-data\n';
    case 'id': return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)\n';
    case 'pwd': return CWD + '\n';
    case 'hostname': return 'netping-prod-01\n';
    case 'uname': return args.includes('-a') ? 'Linux netping-prod-01 6.1.0-18-amd64 #1 SMP Debian x86_64 GNU/Linux\n' : 'Linux\n';
    case 'echo': return args.join(' ') + '\n';
    case 'ping': return ping(args[args.length - 1] || '');
    case 'ls':
      return (paths.length ? paths : ['.']).map(p => {
        const rp = resolve(p);
        if (FS[rp]) return FS[rp].join('  ');
        if (FILES[rp]) return p;
        return `ls: cannot access '${p}': No such file or directory`;
      }).join('\n') + '\n';
    case 'cat': case 'head': case 'tail': case 'more': case 'less':
      return paths.map(p => {
        const rp = resolve(p);
        if (FILES[rp]) return FILES[rp];
        if (FS[rp]) return `${cmd}: ${p}: Is a directory\n`;
        return `${cmd}: ${p}: No such file or directory\n`;
      }).join('');
    default: return `sh: 1: ${cmd}: not found\n`;
  }
}

const failed = out => /not found|No such file|Name or service not known|usage error/.test(out);

function simulateShell(input) {
  input = input.replace(/\$\(([^)]*)\)|`([^`]*)`/g, (_, a, b) => run(a ?? b).trim());
  const parts = input.split(/(\|\||&&|;|\||\n)/);
  let output = '', ok = true;
  for (let i = 0; i < parts.length; i += 2) {
    const op = i === 0 ? ';' : parts[i - 1];
    const next = parts[i + 1];
    const shouldRun = op === ';' || op === '\n' || op === '|' || (op === '&&' && ok) || (op === '||' && !ok);
    if (!shouldRun) continue;
    const out = i === 0 ? ping(parts[i]) : run(parts[i].trim());
    ok = !failed(out);
    if (next !== '|') output += out;
  }
  return output;
}
