import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { checkWorkflowDirectory, formatAnnotation, validateWorkflowPermissions } from './check-workflow-permissions.mjs';

const workflow = (top = '{ contents: read }', job = '') => `
permissions: ${top}
jobs:
  validate:
    runs-on: ubuntu-latest
    ${job}
`;

test('contents read is approved at workflow and job levels', () => {
  assert.doesNotThrow(() => validateWorkflowPermissions(workflow(undefined, 'permissions: { contents: read }')));
});
test('jobs may inherit explicitly read-only workflow permissions', () => {
  assert.doesNotThrow(() => validateWorkflowPermissions(workflow()));
});
test('empty permissions and explicit none cannot grant access', () => {
  assert.doesNotThrow(() => validateWorkflowPermissions(workflow('{}', 'permissions: { contents: none, actions: none }')));
});
test('write access is rejected at workflow level', () => {
  assert.throws(() => validateWorkflowPermissions(workflow('{ contents: write }')), /disallowed permission contents: write/);
});
test('write access is rejected at job level', () => {
  assert.throws(() => validateWorkflowPermissions(workflow(undefined, 'permissions: { contents: write }')), /job validate.*contents: write/);
});
test('additional read scopes are not in the approved set', () => {
  assert.throws(() => validateWorkflowPermissions(workflow(undefined, 'permissions: { pull-requests: read }')), /pull-requests: read/);
});
test('failure report names the workflow file, job, and every disallowed permission', () => {
  const source = `
permissions: { contents: read }
jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: write, packages: write }
  deploy:
    runs-on: ubuntu-latest
    permissions: { id-token: write }
`;
  assert.throws(
    () => validateWorkflowPermissions(source, 'release.yml'),
    (error) => {
      assert.match(error.message, /^Disallowed workflow permissions found:/);
      assert.match(error.message, /workflow release\.yml, job build: disallowed permission contents: write/);
      assert.match(error.message, /workflow release\.yml, job build: disallowed permission packages: write/);
      assert.match(error.message, /workflow release\.yml, job deploy: disallowed permission id-token: write/);
      assert.match(error.message, /approved set: contents: read/);
      return true;
    },
  );
});
test('top-level violations are reported with the workflow file name', () => {
  assert.throws(
    () => validateWorkflowPermissions(workflow('{ contents: write, actions: write }'), 'ci.yml'),
    (error) => {
      assert.match(error.message, /workflow ci\.yml \(top level\): disallowed permission contents: write/);
      assert.match(error.message, /workflow ci\.yml \(top level\): disallowed permission actions: write/);
      return true;
    },
  );
});
for (const shorthand of ['read-all', 'write-all', 'null', "'${{ inputs.permissions }}'"]) {
  test(`permission shorthand ${shorthand} fails closed`, () => {
    assert.throws(() => validateWorkflowPermissions(workflow(shorthand)), /explicit mapping/);
  });
}
test('omitting workflow permissions cannot inherit repository write defaults', () => {
  assert.throws(() => validateWorkflowPermissions('jobs: { validate: { runs-on: ubuntu-latest } }'), /explicit mapping/);
});
test('duplicate YAML keys are rejected rather than silently overwritten', () => {
  assert.throws(() => validateWorkflowPermissions('permissions: { contents: write }\n' + workflow()), /duplicated mapping key/);
});
test('YAML aliases cannot hide elevated job permissions', () => {
  assert.throws(() => validateWorkflowPermissions('extra: &elevated { id-token: write }\n' + workflow(undefined, 'permissions: *elevated')), /id-token: write/);
});
test('every workflow extension is scanned and an unsafe new workflow exits nonzero', () => {
  const directory = mkdtempSync(join(tmpdir(), 'workflow-permissions-'));
  try {
    writeFileSync(join(directory, 'safe.yml'), workflow());
    assert.equal(checkWorkflowDirectory(directory), 1);
    writeFileSync(join(directory, 'new.yaml'), workflow(undefined, 'permissions: { packages: write }'));
    assert.throws(() => checkWorkflowDirectory(directory), /workflow new\.yaml, job validate.*packages: write/);
    const result = spawnSync(process.execPath, ['.github/scripts/check-workflow-permissions.mjs', directory], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /packages: write/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('violations carry file, job, scope, and line for annotations', () => {
  const source = workflow(undefined, 'permissions: { contents: write }');
  assert.throws(
    () => validateWorkflowPermissions(source, 'deploy.yml'),
    (error) => {
      assert.equal(error.violations.length, 1);
      const [violation] = error.violations;
      assert.equal(violation.file, 'deploy.yml');
      assert.equal(violation.job, 'validate');
      assert.equal(violation.scope, 'contents');
      assert.equal(violation.level, 'write');
      // The first line mentioning the scope is used; here the top-level permissions line.
      assert.equal(violation.line, 2);
      return true;
    },
  );
});

test('formatAnnotation emits a GitHub Actions error command with file and line', () => {
  const annotation = formatAnnotation({ file: 'ci.yml', line: 12, message: 'workflow ci.yml (top level): disallowed permission contents: write' });
  assert.equal(annotation, '::error file=ci.yml,line=12::workflow ci.yml (top level): disallowed permission contents: write');
});

test('formatAnnotation escapes percent, CR, and LF so messages stay on one line', () => {
  const annotation = formatAnnotation({ file: 'ci.yml', message: 'bad\n50%\rvalue' });
  assert.equal(annotation, '::error file=ci.yml::bad%0A50%25%0Dvalue');
});

test('CLI emits error annotations only when running under GitHub Actions', () => {
  const directory = mkdtempSync(join(tmpdir(), 'workflow-annotations-'));
  try {
    writeFileSync(join(directory, 'unsafe.yml'), workflow(undefined, 'permissions: { packages: write }'));
    const plain = spawnSync(process.execPath, ['.github/scripts/check-workflow-permissions.mjs', directory], { encoding: 'utf8' });
    assert.equal(plain.status, 1);
    assert.doesNotMatch(plain.stdout + plain.stderr, /::error/);
    const ci = spawnSync(process.execPath, ['.github/scripts/check-workflow-permissions.mjs', directory], {
      encoding: 'utf8',
      env: { ...process.env, GITHUB_ACTIONS: 'true' },
    });
    assert.equal(ci.status, 1);
    assert.match(ci.stdout, /^::error file=unsafe\.yml,line=\d+::workflow unsafe\.yml, job validate: disallowed permission packages: write/m);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('invalid YAML syntax fails closed and names the workflow file', () => {
  assert.throws(
    () => validateWorkflowPermissions('permissions: { contents: read\njobs: [', 'broken.yml'),
    /broken\.yml/,
  );
});

test('a scalar workflow document fails closed and names the workflow file', () => {
  assert.throws(() => validateWorkflowPermissions('just a string', 'scalar.yml'), /scalar\.yml: expected a workflow mapping/);
});

test('permissions as a list fails closed and names the workflow file', () => {
  assert.throws(
    () => validateWorkflowPermissions('permissions: [read]\njobs: { validate: { runs-on: ubuntu-latest } }', 'list.yml'),
    /workflow list\.yml \(top level\): permissions must be an explicit mapping/,
  );
});

test('a non-string permission level is rejected, not treated as read-only', () => {
  assert.throws(
    () => validateWorkflowPermissions(workflow('{ contents: [read] }'), 'levels.yml'),
    /workflow levels\.yml \(top level\): disallowed permission contents: read/,
  );
});

test('a workflow without jobs fails closed and names the workflow file', () => {
  assert.throws(
    () => validateWorkflowPermissions('permissions: { contents: read }\njobs: {}', 'nojobs.yml'),
    /nojobs\.yml: expected at least one job/,
  );
});

test('a scalar job definition fails closed and names the workflow file and job', () => {
  assert.throws(
    () => validateWorkflowPermissions('permissions: { contents: read }\njobs: { validate: oops }', 'badjob.yml'),
    /workflow badjob\.yml, job validate: expected a job mapping/,
  );
});

test('directory scan reports the file for syntactically invalid workflows', () => {
  const directory = mkdtempSync(join(tmpdir(), 'workflow-invalid-'));
  try {
    writeFileSync(join(directory, 'valid.yml'), workflow());
    writeFileSync(join(directory, 'invalid.yml'), 'permissions: { contents: read\njobs: [');
    assert.throws(() => checkWorkflowDirectory(directory), /invalid\.yml/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});