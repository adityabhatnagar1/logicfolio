// Generates circuit SVGs, waveform SVG, ports and truth tables for every archive component.
// Output: src/generated/<category>/<component>/{circuit.block.svg,circuit.gate.svg,wave.svg,meta.json}
// Never fails the build: problems are written to meta.json and the process exits 0.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const ARCHIVE = path.join(ROOT, 'archive');
const OUT = path.join(ROOT, 'src', 'generated');
const CACHE_FILE = path.join(ROOT, '.cache', 'generate.json');
const GENERATOR_VERSION = 1;
const MAX_STEPS = 32;
const MAX_TRUTH_INPUT_BITS = 8;
const TOOL_TIMEOUT_MS = 60000;
const SEQUENTIAL = /dff|latch|\$sr|\$_sr_|mem|\$ff|\$_ff_/i;

const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const listDirs = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')).map((e) => e.name).sort(byName)
    : [];

class StageError extends Error {
  constructor(stage, message) {
    super(message);
    this.stage = stage;
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: TOOL_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });
  if (r.error && r.error.code === 'ENOENT') return { missing: true, status: -1, stdout: '', stderr: '' };
  return { missing: false, status: r.status ?? -1, stdout: r.stdout ?? '', stderr: (r.stderr ?? '') + (r.error ? String(r.error.message) : '') };
}

function toolVersion(cmd, args) {
  const r = run(cmd, args, ROOT);
  return r.missing ? null : (r.stdout || r.stderr).split(/\r?\n/)[0].trim() || 'unknown';
}

function libVersion(name) {
  try {
    return JSON.parse(fs.readFileSync(require.resolve(`${name}/package.json`), 'utf8')).version;
  } catch {
    return 'missing';
  }
}

// ---------- Verilog source analysis ----------
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');

function parseModules(code) {
  const text = stripComments(code);
  const re = /\b(?:macro)?module\s+([A-Za-z_][\w$]*)/g;
  const found = [];
  let m;
  while ((m = re.exec(text))) found.push({ name: m[1], start: m.index });
  return found.map((mod, i) => {
    const end = text.indexOf('endmodule', mod.start);
    const headerEnd = text.indexOf(';', mod.start);
    const body = headerEnd >= 0 && end >= 0 ? text.slice(headerEnd + 1, end) : '';
    return { name: mod.name, body, order: i };
  });
}

function detectTop(designs, folderName) {
  for (const d of designs) {
    const o = /\/\/\s*top\s*:\s*([A-Za-z_][\w$]*)/.exec(d.code);
    if (o) return o[1];
  }
  const modules = designs.flatMap((d) => parseModules(d.code));
  if (modules.length === 0) throw new StageError('top', 'No module found in the design files.');
  const instantiated = new Set();
  for (const mod of modules) {
    for (const other of modules) {
      if (other === mod) continue;
      const re = new RegExp(`(?:^|[\\s;])${mod.name.replace(/\$/g, '\\$')}\\s*(?:#\\s*\\([^;]*?\\))?\\s*[A-Za-z_\\\\][\\w$\\[\\]\\\\.]*\\s*\\(`);
      if (re.test(other.body)) {
        instantiated.add(mod.name);
        break;
      }
    }
  }
  const candidates = modules.filter((m) => !instantiated.has(m.name)).map((m) => m.name);
  if (candidates.length === 0) throw new StageError('top', 'Every module is instantiated by another one; add a "// top: name" comment to a design file.');
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return candidates.find((c) => norm(c) === norm(folderName)) ?? candidates[0];
}

// ---------- Yosys + netlistsvg ----------
function yosysJson(workDir, files, top, gate) {
  const out = gate ? 'gate.json' : 'block.json';
  const script = [`read_verilog -sv ${files.join(' ')}`, `hierarchy -top ${top}`, 'proc', 'opt'];
  if (gate) script.push('flatten', 'techmap', 'opt');
  script.push(`write_json ${out}`);
  const r = run('yosys', ['-q', '-p', script.join('; ')], workDir);
  if (r.missing) throw new StageError('yosys', 'Yosys was not found on this machine. Install it (Ubuntu: sudo apt-get install yosys) and rebuild.');
  if (r.status !== 0) throw new StageError('yosys', `Yosys failed: ${(r.stderr || r.stdout).trim().split(/\r?\n/).slice(-4).join(' ')}`);
  return JSON.parse(fs.readFileSync(path.join(workDir, out), 'utf8'));
}

function topModule(json, top) {
  const mod = json.modules?.[top];
  if (!mod) throw new StageError('yosys', `Top module "${top}" is missing from the Yosys output.`);
  return mod;
}

function isCombinational(json, top, seen = new Set()) {
  if (seen.has(top)) return true;
  seen.add(top);
  const mod = json.modules?.[top];
  if (!mod) return true;
  return Object.values(mod.cells ?? {}).every((cell) => {
    if (SEQUENTIAL.test(cell.type)) return false;
    return json.modules?.[cell.type] ? isCombinational(json, cell.type, seen) : true;
  });
}

function portsOf(mod) {
  return Object.entries(mod.ports ?? {}).map(([name, p]) => ({ name, direction: p.direction, width: p.bits.length }));
}

function cleanCircuit(svg) {
  const w = /<svg[^>]*\swidth="([\d.]+)"/.exec(svg)?.[1];
  const h = /<svg[^>]*\sheight="([\d.]+)"/.exec(svg)?.[1];
  let out = svg.replace(/<svg([^>]*?)>/, (_, attrs) => {
    const rest = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${rest} viewBox="0 0 ${w ?? 100} ${h ?? 100}" class="circuit-svg" role="img" aria-label="Circuit diagram">`;
  });
  out = out.replace(/\sid="[^"]*"/g, '').replace(/#000\b/g, 'currentColor');
  return out;
}

async function renderCircuit(json) {
  const netlistsvg = require('netlistsvg');
  const skin = fs.readFileSync(require.resolve('netlistsvg/lib/default.svg'), 'utf8');
  const svg = await Promise.race([
    netlistsvg.render(skin, json),
    new Promise((_, rej) => setTimeout(() => rej(new Error('layout timed out')), TOOL_TIMEOUT_MS)),
  ]);
  if (typeof svg !== 'string' || !svg.includes('<svg')) throw new Error('netlistsvg returned no SVG');
  return cleanCircuit(svg);
}

// ---------- Icarus + VCD ----------
function parseVcd(text) {
  const vars = [];
  const scope = [];
  const changes = [];
  const tokens = text.split(/\s+/).filter(Boolean);
  let time = 0;
  let i = 0;
  const skipToEnd = () => {
    while (i < tokens.length && tokens[i] !== '$end') i++;
    i++;
  };
  let defs = true;
  while (i < tokens.length) {
    const t = tokens[i];
    if (defs) {
      if (t === '$scope') { scope.push(tokens[i + 2]); i += 3; skipToEnd(); continue; }
      if (t === '$upscope') { scope.pop(); i++; skipToEnd(); continue; }
      if (t === '$var') { vars.push({ type: tokens[i + 1], size: Number(tokens[i + 2]), id: tokens[i + 3], name: tokens[i + 4], scope: [...scope] }); i += 5; skipToEnd(); continue; }
      if (t === '$enddefinitions') { defs = false; i++; skipToEnd(); continue; }
      i++;
      continue;
    }
    if (t[0] === '#') { time = Number(t.slice(1)); i++; continue; }
    if (t[0] === '$') { i++; continue; }
    if (t[0] === 'b' || t[0] === 'B') { changes.push({ time, id: tokens[i + 1], value: t.slice(1).toLowerCase() }); i += 2; continue; }
    if (t[0] === 'r' || t[0] === 'R') { i += 2; continue; }
    changes.push({ time, id: t.slice(1), value: t[0].toLowerCase() });
    i++;
  }
  return { vars, changes, end: time };
}

const fit = (value, size) => (value.length >= size ? value.slice(-size) : (/^[xz]/.test(value) ? value[0] : '0').repeat(size - value.length) + value);
const SKIP_TYPES = new Set(['integer', 'real', 'time', 'event', 'parameter', 'realtime']);
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

function waveFor(vcd) {
  const first = vcd.vars[0]?.scope[0];
  const sigs = vcd.vars.filter((v) => v.scope.length === 1 && v.scope[0] === first && !SKIP_TYPES.has(v.type));
  if (sigs.length === 0) throw new StageError('waveform', 'The testbench dumped no signals.');
  const times = [...new Set(vcd.changes.map((c) => c.time))];
  let tick = 0;
  let prev = 0;
  for (const t of times) { tick = gcd(tick, t - prev); prev = t; }
  tick = tick > 0 ? tick : 1;
  const lastChange = times.length ? times[times.length - 1] : 0;
  const steps = Math.min(MAX_STEPS, Math.max(1, Math.floor(vcd.end / tick) + (lastChange >= vcd.end ? 1 : 0)));
  const state = new Map();
  const byId = new Map();
  for (const v of vcd.vars) { if (!byId.has(v.id)) byId.set(v.id, []); byId.get(v.id).push(v); }
  const samples = sigs.map(() => []);
  let ci = 0;
  for (let k = 0; k < steps; k++) {
    while (ci < vcd.changes.length && vcd.changes[ci].time <= k * tick) { state.set(vcd.changes[ci].id, vcd.changes[ci].value); ci++; }
    sigs.forEach((v, n) => samples[n].push(fit(state.get(v.id) ?? 'x', v.size)));
  }
  const signal = sigs.map((v, n) => {
    let wave = '';
    const data = [];
    samples[n].forEach((val, k) => {
      if (k > 0 && val === samples[n][k - 1]) { wave += '.'; return; }
      if (/^[01xz]$/.test(val)) { wave += val; return; }
      if (/^x+$/.test(val)) { wave += 'x'; return; }
      if (/^z+$/.test(val)) { wave += 'z'; return; }
      if (/[xz]/.test(val)) { wave += 'x'; return; }
      wave += '=';
      data.push(parseInt(val, 2).toString(16).toUpperCase());
    });
    return v.size > 1 ? { name: v.name, wave, data } : { name: v.name, wave };
  });
  return { signal, config: { hscale: 1 } };
}

function renderWave(waveJson) {
  const wavedrom = require('wavedrom');
  const svg = wavedrom.onml.stringify(wavedrom.renderAny(0, waveJson, wavedrom.waveSkin));
  if (!svg.includes('<svg')) throw new Error('wavedrom returned no SVG');
  return cleanWave(svg);
}

function cleanWave(svg) {
  const w = /<svg[^>]*\swidth="([\d.]+)"/.exec(svg)?.[1];
  const h = /<svg[^>]*\sheight="([\d.]+)"/.exec(svg)?.[1];
  let out = svg.replace(/<svg([^>]*?)>/, (_, attrs) => {
    const rest = attrs.replace(/\s(id|height|width|viewBox|overflow|class)="[^"]*"/g, '');
    return `<svg${rest} width="${w ?? 400}" viewBox="0 0 ${w ?? 400} ${h ?? 100}" class="wave-svg" role="img" aria-label="Simulation waveform">`;
  });
  out = out
    .replace(/\sid="[^"]*"/g, '')
    .replace(/#000000|#000\b|#0041c4|#888/gi, 'currentColor')
    .replace(/fill:#[0-9a-f]{3,6}/gi, 'fill:none')
    .replace(/font-family:Helvetica/gi, 'font-family:inherit');
  return out;
}

function truthTable(vcd, ports) {
  const ins = ports.filter((p) => p.direction === 'input');
  const outs = ports.filter((p) => p.direction === 'output');
  const bits = ins.reduce((n, p) => n + p.width, 0);
  if (ins.length === 0 || outs.length === 0 || bits > MAX_TRUTH_INPUT_BITS) return null;
  const all = [...ins, ...outs];
  const scopes = new Map();
  for (const v of vcd.vars) {
    const key = v.scope.join('.');
    if (!scopes.has(key)) scopes.set(key, { depth: v.scope.length, vars: new Map() });
    scopes.get(key).vars.set(v.name, v);
  }
  const hit = [...scopes.values()]
    .filter((s) => all.every((p) => s.vars.get(p.name)?.size === p.width))
    .sort((a, b) => a.depth - b.depth)[0];
  if (!hit) return null;
  const vars = all.map((p) => hit.vars.get(p.name));
  const wanted = new Set(vars.map((v) => v.id));
  const state = new Map();
  const rows = new Map();
  const read = (vs) => vs.map((v) => fit(state.get(v.id) ?? 'x', v.size));
  const inVars = vars.slice(0, ins.length);
  const outVars = vars.slice(ins.length);
  const changes = vcd.changes.filter((c) => wanted.has(c.id));
  const stamps = [...new Set(changes.map((c) => c.time))];
  let ci = 0;
  let segment = null;
  let ok = true;
  const flush = () => {
    if (!segment) return;
    const inv = segment.inputs;
    const outv = read(outVars);
    if (inv.join('').match(/[^01]/) || outv.join('').match(/[^01]/)) return;
    const key = inv.join('');
    if (rows.has(key) && rows.get(key).join('|') !== outv.join('|')) ok = false;
    rows.set(key, outv);
  };
  for (const t of stamps) {
    const before = read(inVars).join(',');
    const pending = [];
    while (ci < changes.length && changes[ci].time === t) pending.push(changes[ci++]);
    const preInputs = read(inVars);
    if (segment && pending.some((c) => inVars.some((v) => v.id === c.id))) flush();
    pending.forEach((c) => state.set(c.id, c.value));
    const now = read(inVars);
    if (!segment || now.join(',') !== before || preInputs.join(',') !== now.join(',')) segment = { inputs: now };
  }
  flush();
  const expected = 2 ** bits;
  if (!ok || rows.size !== expected) return null;
  const sorted = [...rows.entries()].sort((a, b) => parseInt(a[0], 2) - parseInt(b[0], 2));
  return {
    inputs: ins.map((p) => ({ name: p.name, width: p.width })),
    outputs: outs.map((p) => ({ name: p.name, width: p.width })),
    rows: sorted.map(([k, o]) => {
      let pos = 0;
      const cells = ins.map((p) => { const s = k.slice(pos, pos + p.width); pos += p.width; return s; });
      return [...cells, ...o];
    }),
  };
}

function simulate(dir, designs, tbs) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-sim-'));
  try {
    fs.cpSync(dir, tmp, { recursive: true });
    let lastError = 'No testbench with $dumpfile found.';
    for (const tb of tbs) {
      const compile = run('iverilog', ['-g2012', '-o', 'sim', tb, ...designs], tmp);
      if (compile.missing) throw new StageError('icarus', 'Icarus Verilog was not found on this machine. Install it (Ubuntu: sudo apt-get install iverilog) and rebuild.');
      if (compile.status !== 0) { lastError = `iverilog failed: ${(compile.stderr || compile.stdout).trim().split(/\r?\n/).slice(-3).join(' ')}`; continue; }
      const sim = run('vvp', ['sim'], tmp);
      if (sim.status !== 0) { lastError = `vvp failed: ${(sim.stderr || sim.stdout).trim().split(/\r?\n/).slice(-3).join(' ')}`; continue; }
      const vcdName = fs.readdirSync(tmp).find((f) => f.toLowerCase().endsWith('.vcd'));
      if (!vcdName) { lastError = 'The simulation produced no .vcd file.'; continue; }
      return fs.readFileSync(path.join(tmp, vcdName), 'utf8');
    }
    throw new StageError('simulation', lastError);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------- per component ----------
function folderHash(dir, tools) {
  const h = crypto.createHash('sha256');
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => byName(a.name, b.name))) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, `${rel}${e.name}/`);
      else { h.update(`${rel}${e.name}\0`); h.update(fs.readFileSync(p)); h.update('\0'); }
    }
  };
  walk(dir, '');
  h.update(JSON.stringify(tools));
  return h.digest('hex');
}

async function build(category, slug) {
  const dir = path.join(ARCHIVE, category, slug);
  const outDir = path.join(OUT, category, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.v')).map((e) => e.name).sort(byName);
  const read = (n) => ({ name: n, code: fs.readFileSync(path.join(dir, n), 'utf8') });
  const designs = files.map(read).filter((f) => !f.code.includes('$dumpfile'));
  const tbs = files.map(read).filter((f) => f.code.includes('$dumpfile'));
  const meta = { status: 'ok', top: null, ports: [], truth: null, assets: { block: false, gate: false, wave: false }, errors: [] };
  const fail = (stage, message) => meta.errors.push({ stage, message });

  let top = null;
  try {
    if (designs.length === 0) throw new StageError('top', 'No design .v files found.');
    top = detectTop(designs, slug);
    meta.top = top;
  } catch (e) {
    fail(e.stage ?? 'top', e.message);
  }

  let blockJson = null;
  if (top) {
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-yosys-'));
    try {
      designs.forEach((d, i) => fs.writeFileSync(path.join(work, `d${i}.v`), d.code));
      const names = designs.map((_, i) => `d${i}.v`);
      try {
        blockJson = yosysJson(work, names, top, false);
        meta.ports = portsOf(topModule(blockJson, top));
        fs.writeFileSync(path.join(outDir, 'circuit.block.svg'), await renderCircuit(blockJson));
        meta.assets.block = true;
      } catch (e) {
        fail(e.stage ?? 'circuit', e.message);
      }
      if (blockJson) {
        try {
          const gateJson = yosysJson(work, names, top, true);
          fs.writeFileSync(path.join(outDir, 'circuit.gate.svg'), await renderCircuit(gateJson));
          meta.assets.gate = true;
        } catch (e) {
          fail(e.stage ?? 'circuit', `Gate view: ${e.message}`);
        }
      }
    } finally {
      fs.rmSync(work, { recursive: true, force: true });
    }
  }

  if (tbs.length > 0) {
    try {
      const vcd = parseVcd(simulate(dir, designs.map((d) => d.name), tbs.map((t) => t.name)));
      fs.writeFileSync(path.join(outDir, 'wave.svg'), renderWave(waveFor(vcd)));
      meta.assets.wave = true;
      if (blockJson && top && isCombinational(blockJson, top)) meta.truth = truthTable(vcd, meta.ports);
    } catch (e) {
      fail(e.stage ?? 'waveform', e.message);
    }
  }

  if (meta.errors.length > 0) {
    meta.status = 'error';
    meta.stage = meta.errors[0].stage;
    meta.message = meta.errors[0].message;
  }
  fs.writeFileSync(path.join(outDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  return meta;
}

async function main() {
  const tools = {
    generator: GENERATOR_VERSION,
    steps: MAX_STEPS,
    yosys: toolVersion('yosys', ['-V']),
    iverilog: toolVersion('iverilog', ['-V']),
    netlistsvg: libVersion('netlistsvg'),
    elkjs: libVersion('elkjs'),
    wavedrom: libVersion('wavedrom'),
  };
  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { cache = {}; }
  const next = {};
  const wanted = new Set();
  const summary = { ok: 0, cached: 0, error: 0 };
  for (const category of listDirs(ARCHIVE)) {
    for (const slug of listDirs(path.join(ARCHIVE, category))) {
      const key = `${category}/${slug}`;
      wanted.add(key);
      const dir = path.join(ARCHIVE, category, slug);
      const hash = folderHash(dir, tools);
      const metaPath = path.join(OUT, category, slug, 'meta.json');
      if (cache[key] === hash && fs.existsSync(metaPath)) {
        next[key] = hash;
        summary.cached++;
        continue;
      }
      try {
        const meta = await build(category, slug);
        next[key] = hash;
        if (meta.status === 'ok') summary.ok++;
        else { summary.error++; console.warn(`[generate] ${key}: ${meta.errors.map((e) => `${e.stage}: ${e.message}`).join(' | ')}`); }
      } catch (e) {
        summary.error++;
        console.warn(`[generate] ${key}: ${e instanceof Error ? e.message : String(e)}`);
        fs.mkdirSync(path.dirname(metaPath), { recursive: true });
        fs.writeFileSync(metaPath, JSON.stringify({ status: 'error', stage: 'generator', message: e instanceof Error ? e.message : String(e), top: null, ports: [], truth: null, assets: { block: false, gate: false, wave: false }, errors: [] }));
      }
    }
  }
  for (const category of listDirs(OUT)) {
    for (const slug of listDirs(path.join(OUT, category))) {
      if (!wanted.has(`${category}/${slug}`)) fs.rmSync(path.join(OUT, category, slug), { recursive: true, force: true });
    }
  }
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`[generate] ${wanted.size} components: ${summary.ok} built, ${summary.cached} cached, ${summary.error} with errors`);
}

main().catch((e) => {
  console.warn(`[generate] unexpected failure: ${e instanceof Error ? e.message : String(e)}`);
}).finally(() => {
  process.exitCode = 0;
});
