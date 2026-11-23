import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// js-yaml is installed by the existing ESLint dependency tree.
const { load, JSON_SCHEMA } = createRequire(import.meta.url)('js-yaml');
const isMapping = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function checkPermissions(value, location) {
  if (!isMapping(value)) {
    throw new Error(`${location}: permissions must be an explicit mapping (only contents: read or no permissions).`);
  }
  for (const [scope, level] of Object.entries(value)) {
    if (level === 'none' || (scope === 'contents' && level === 'read')) continue;
    throw new Error(`${location}: unapproved permission ${scope}: ${String(level)}; only contents: read is approved.`);
  }
}

export function validateWorkflowPermissions(source, filename = 'workflow') {
  const workflow = load(source, { schema: JSON_SCHEMA });
  if (!isMapping(workflow)) throw new Error(`${filename}: expected a workflow mapping.`);
  // Omitted workflow permissions can inherit repository defaults, including write access.
  checkPermissions(workflow.permissions, `${filename} workflow`);
  if (!isMapping(workflow.jobs) || Object.keys(workflow.jobs).length === 0) {
    throw new Error(`${filename}: expected at least one job.`);
  }
  for (const [name, job] of Object.entries(workflow.jobs)) {
    if (!isMapping(job)) throw new Error(`${filename} job ${name}: expected a job mapping.`);
    if (Object.hasOwn(job, 'permissions')) {
      checkPermissions(job.permissions, `${filename} job ${name}`);
    }
    // Jobs without overrides inherit the already-validated workflow permissions.
  }
}

export function checkWorkflowDirectory(directory) {
  const files = readdirSync(directory).filter((file) => /\.ya?ml$/i.test(file)).sort();
  if (files.length === 0) throw new Error('No workflow files found; refusing to skip the permissions check.');
  const errors = [];
  for (const file of files) {
    try {
      validateWorkflowPermissions(readFileSync(resolve(directory, file), 'utf8'), file);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return files.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const count = checkWorkflowDirectory(resolve(process.argv[2] ?? '.github/workflows'));
    console.log(`Read-only permissions verified for ${count} workflow(s).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}