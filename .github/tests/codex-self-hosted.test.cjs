const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const workflow = fs.readFileSync(path.join(__dirname, '../workflows/codex-self-hosted.yml'), 'utf8').replaceAll('\r\n', '\n');
// Execute the actual inline bodies, including on bases without helper scripts.
function body(name, key = 'run') {
  const step = workflow.split(`      - name: ${name}\n`)[1]?.split('\n      - name:')[0];
  assert.ok(step, name);
  const lines = step.split(`${key}: |\n`)[1].split('\n');
  const indent = lines.find(line => line.trim()).match(/^ */)[0].length;
  return lines.filter(line => !line.trim() || line.startsWith(' '.repeat(indent)))
    .map(line => line.slice(indent)).join('\n');
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-workflow-tests-'));
const pwsh = process.env.TEST_PWSH || path.join(spawnSync('pwsh', ['-NoProfile', '-Command', '$PSHOME'], { encoding: 'utf8' }).stdout.trim(), 'pwsh.exe');
let seq = 0;
function ps(script, env = {}, cwd = temp) {
  const file = path.join(temp, `step-${seq++}.ps1`);
  fs.writeFileSync(file, `$ErrorActionPreference = 'Stop'\n${script}`);
  return spawnSync(pwsh, ['-NoProfile', '-File', file], {
    cwd, env: { ...process.env, ...env }, encoding: 'utf8'
  });
}
function ok(result) { assert.equal(result.status, 0, result.stderr || result.error?.message); }
function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  ok(result); return result.stdout.trim();
}

test('all inline PowerShell parses', () => {
  const scripts = [...workflow.matchAll(/        run: \|\n((?:          .*\n|\n)+)/g)].map(m => m[1].replace(/^          /gm, ''));
  for (const script of scripts) {
    const file = path.join(temp, `parse-${seq++}.ps1`); fs.writeFileSync(file, script.replace(/\$\{\{.*?\}\}/g, '13'));
    ok(ps(`$tokens = $null; $errors = $null\n[System.Management.Automation.Language.Parser]::ParseFile('${file.replaceAll("'", "''")}', [ref]$tokens, [ref]$errors) | Out-Null\nif ($errors) { throw ($errors | Out-String) }`));
  }
});
test('missing inherited Git PATH is repaired and survives GITHUB_PATH replay', () => {
  const out = path.join(temp, 'github-path');
  ok(ps(body('Prepare Git for Windows PATH'), { PATH: process.env.SystemRoot + '\\System32', GITHUB_PATH: out }));
  const paths = fs.readFileSync(out, 'utf8').trim().split(/\r?\n/).reverse();
  const r = ps(`bash --noprofile --norc -c 'timeout --version; timeout 5 bash -c "exit 0"'\nif ($LASTEXITCODE -ne 0) { throw 'timeout failed' }`, { PATH: [...paths, process.env.SystemRoot + '\\System32'].join(';') });
  ok(r); assert.match(r.stdout, /GNU coreutils/);
});
test('missing Git installation produces actionable failure', () => {
  const result = ps("function Test-Path { return $false }\n" + body('Prepare Git for Windows PATH'), { GITHUB_PATH: path.join(temp, 'absent') });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Install Git for Windows/);
});

test('branch reset, isolation, dirty refusal and lease protect real repositories', () => {
  const remote = path.join(temp, 'remote.git'); fs.mkdirSync(remote); git(remote, 'init', '--bare');
  const repo = path.join(temp, 'work'); fs.mkdirSync(repo); git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.name', 'Test'); git(repo, 'config', 'user.email', 'test@example.invalid');
  fs.writeFileSync(path.join(repo, 'file'), 'base'); git(repo, 'add', '.'); git(repo, 'commit', '-m', 'base');
  const base = git(repo, 'rev-parse', 'HEAD'); git(repo, 'remote', 'add', 'origin', remote); git(repo, 'push', 'origin', 'main');
  git(repo, 'branch', 'codex/issue-99');
  const output = path.join(temp, 'branch-output');
  const env = { ISSUE_NUMBER: '13', WORK_BRANCH: 'codex/issue-13', BASE_BRANCH: 'main', GITHUB_OUTPUT: output };
  const prepare = () => ps(body('Prepare Codex work branch'), env, repo);
  ok(prepare()); assert.equal(git(repo, 'branch', '--show-current'), env.WORK_BRANCH);
  fs.writeFileSync(path.join(repo, 'file'), 'old attempt'); git(repo, 'commit', '-am', 'attempt');
  ok(prepare()); assert.equal(git(repo, 'rev-parse', 'HEAD'), base); // local-only collision
  fs.writeFileSync(path.join(repo, 'file'), 'published'); git(repo, 'commit', '-am', 'published'); git(repo, 'push', 'origin', env.WORK_BRANCH);
  const published = git(repo, 'rev-parse', 'HEAD');
  ok(prepare()); assert.equal(git(repo, 'rev-parse', 'HEAD'), base); // remote is not reused as base
  assert.match(fs.readFileSync(output, 'utf8'), new RegExp(`expected=${published}`));
  assert.equal(git(repo, 'rev-parse', 'codex/issue-99'), base);
  assert.notEqual(ps(body('Prepare Codex work branch'), { ...env, WORK_BRANCH: 'codex/issue-99' }, repo).status, 0);
  assert.notEqual(ps(body('Prepare Codex work branch'), { ...env, BASE_BRANCH: env.WORK_BRANCH }, repo).status, 0);
  assert.notEqual(ps(body('Prepare Codex work branch'), { ...env, BASE_BRANCH: 'absent' }, repo).status, 0);
  fs.writeFileSync(path.join(repo, 'untracked'), 'preserve');
  assert.notEqual(prepare().status, 0); assert.equal(fs.readFileSync(path.join(repo, 'untracked'), 'utf8'), 'preserve');
  fs.unlinkSync(path.join(repo, 'untracked'));
  fs.writeFileSync(path.join(repo, 'file'), 'new attempt');
  ok(ps(body('Commit and push'), { ...env, EXPECTED_REMOTE: published }, repo));
  const newHead = git(repo, 'rev-parse', 'HEAD');
  assert.equal(git(repo, 'ls-remote', 'origin', `refs/heads/${env.WORK_BRANCH}`).split(/\s/)[0], newHead);
  fs.writeFileSync(path.join(repo, 'file'), 'stale attempt');
  assert.notEqual(ps(body('Commit and push'), { ...env, EXPECTED_REMOTE: published }, repo).status, 0);
  assert.equal(git(repo, 'ls-remote', 'origin', `refs/heads/${env.WORK_BRANCH}`).split(/\s/)[0], newHead);
});
test('verification stops at the first failed command', () => {
  fs.writeFileSync(path.join(temp, 'package.json'), '{}');
  const result = ps(`function npm.cmd { if ($args[1] -eq 'test:core') { $global:LASTEXITCODE = 17 } else { throw 'Should not reach later checks' } }\n` + body('Verify repository'));
  assert.notEqual(result.status, 0); assert.match(result.stderr, /test:core failed/); assert.doesNotMatch(result.stderr, /Should not reach/);
});

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const publish = new AsyncFunction('github', 'context', 'core', 'process', 'setTimeout', body('Open or update pull request', 'script'));
function fixture(options = {}) {
  const calls = []; let listCount = 0;
  const pr = { html_url: 'https://github.com/example/repo/pull/14', base: { ref: 'feature/base' }, draft: true, node_id: 'PR_14', ...options.pr };
  const github = { rest: {
    pulls: {
      list: async args => { calls.push(['list', args]); return { data: (++listCount > 1 && options.recover) || options.existing ? [pr] : [] }; },
      create: async args => { calls.push(['create', args]); if (options.error) throw options.error; return { data: pr }; }
    }, issues: { createComment: async () => { if (options.commentError) throw Error('notification unavailable'); } }
  }, graphql: async (...args) => calls.push(['draft', ...args]) };
  const core = { setOutput: (...args) => calls.push(['output', ...args]), warning: msg => calls.push(['warning', msg]), summary: { addLink: () => ({ write: async () => {} }) } };
  const run = () => publish(github, { repo: { owner: 'example', repo: 'repo' } }, core,
    { env: { WORK_BRANCH: 'codex/issue-13', BASE_BRANCH: 'feature/base', ISSUE_NUMBER: '13', ISSUE_TITLE: '[CODEX] Fix' } }, fn => fn());
  return { calls, run };
}
test('creates a draft against the requested stacked base', async () => {
  const f = fixture(); await f.run();
  const create = f.calls.find(c => c[0] === 'create')[1];
  assert.equal(create.draft, true); assert.equal(create.base, 'feature/base'); assert.equal(create.head, 'codex/issue-13');
});
test('reuses existing PR, converts ready PR back to draft', async () => {
  const f = fixture({ existing: true, pr: { draft: false } }); await f.run();
  assert.equal(f.calls.filter(c => c[0] === 'create').length, 0); assert.ok(f.calls.some(c => c[0] === 'draft'));
});
test('does not reuse or retarget a PR against a different base', async () => {
  const f = fixture({ existing: true, pr: { base: { ref: 'wrong-base' } } });
  await assert.rejects(f.run(), /Refusing to retarget/);
});
test('reconciles duplicate or lost-response PR creation', async () => {
  for (const status of [422, 502, undefined]) {
    const f = fixture({ recover: true, error: { status } }); await f.run();
    assert.equal(f.calls.filter(c => c[0] === 'create').length, 1);
  }
});
test('403 explains repository permission gate', async () => {
  const f = fixture({ error: { status: 403 } }); await assert.rejects(f.run(), /Allow GitHub Actions to create and approve/);
});
test('transient failures have bounded retries', async () => {
  const f = fixture({ error: { status: 502 } }); await assert.rejects(f.run());
  assert.equal(f.calls.filter(c => c[0] === 'create').length, 3);
});
test('notification failure does not mark delivered PR as failed', async () => {
  const f = fixture({ commentError: true }); await f.run(); assert.ok(f.calls.some(c => c[0] === 'warning'));
});
