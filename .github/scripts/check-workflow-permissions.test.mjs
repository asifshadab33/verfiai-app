import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { checkWorkflowDirectory, validateWorkflowPermissions } from './check-workflow-permissions.mjs';

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
  assert.throws(() => validateWorkflowPermissions(workflow('{ contents: write }')), /unapproved permission contents: write/);
});
test('write access is rejected at job level', () => {
  assert.throws(() => validateWorkflowPermissions(workflow(undefined, 'permissions: { contents: write }')), /job validate.*contents: write/);
});
test('additional read scopes are not in the approved set', () => {
  assert.throws(() => validateWorkflowPermissions(workflow(undefined, 'permissions: { pull-requests: read }')), /pull-requests: read/);
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
    assert.throws(() => checkWorkflowDirectory(directory), /new.yaml job validate.*packages: write/);
    const result = spawnSync(process.execPath, ['.github/scripts/check-workflow-permissions.mjs', directory], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /packages: write/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});