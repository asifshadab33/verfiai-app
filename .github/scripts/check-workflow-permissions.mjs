import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// js-yaml is installed by the existing ESLint dependency tree.
const { load, JSON_SCHEMA } = createRequire(import.meta.url)('js-yaml');
const isMapping = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// GitHub Actions workflow-command data must escape %, CR and LF.
const escapeAnnotation = (value) => String(value).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

// Locate the first line mentioning a permission scope so annotations point at the offending line.
function findScopeLine(source, scope) {
  const pattern = new RegExp(`\\b${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`);
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) return index + 1;
  }
  return undefined;
}

export function formatAnnotation(violation) {
  const location = violation.line === undefined ? '' : `,line=${violation.line}`;
  return `::error file=${escapeAnnotation(violation.file)}${location}::${escapeAnnotation(violation.message)}`;
}

function checkPermissions(value, location, violations, context) {
  if (!isMapping(value)) {
    throw new Error(`${location}: permissions must be an explicit mapping (only contents: read or no permissions).`);
  }
  for (const [scope, level] of Object.entries(value)) {
    if (level === 'none' || (scope === 'contents' && level === 'read')) continue;
    violations.push({
      file: context.file,
      job: context.job,
      scope,
      level: String(level),
      line: findScopeLine(context.source, scope),
      message: `${location}: disallowed permission ${scope}: ${String(level)} (approved set: contents: read)`,
    });
  }
}

export function validateWorkflowPermissions(source, filename = 'workflow') {
  let workflow;
  try {
    workflow = load(source, { schema: JSON_SCHEMA });
  } catch (error) {
    // Fail closed on unparseable YAML and name the workflow so the report is actionable.
    throw new Error(`${filename}: invalid workflow YAML (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`);
  }
  if (!isMapping(workflow)) throw new Error(`${filename}: expected a workflow mapping.`);
  const violations = [];
  // Omitted workflow permissions can inherit repository defaults, including write access.
  checkPermissions(workflow.permissions, `workflow ${filename} (top level)`, violations, { source, file: filename, job: null });
  if (!isMapping(workflow.jobs) || Object.keys(workflow.jobs).length === 0) {
    throw new Error(`${filename}: expected at least one job.`);
  }
  for (const [name, job] of Object.entries(workflow.jobs)) {
    if (!isMapping(job)) throw new Error(`workflow ${filename}, job ${name}: expected a job mapping.`);
    if (Object.hasOwn(job, 'permissions')) {
      checkPermissions(job.permissions, `workflow ${filename}, job ${name}`, violations, { source, file: filename, job: name });
    }
    // Jobs without overrides inherit the already-validated workflow permissions.
  }
  if (violations.length) {
    const error = new Error(`Disallowed workflow permissions found:\n${violations.map((v) => `  - ${v.message}`).join('\n')}`);
    error.violations = violations;
    throw error;
  }
}

export function checkWorkflowDirectory(directory) {
  const files = readdirSync(directory).filter((file) => /\.ya?ml$/i.test(file)).sort();
  if (files.length === 0) throw new Error('No workflow files found; refusing to skip the permissions check.');
  const errors = [];
  const violations = [];
  for (const file of files) {
    try {
      validateWorkflowPermissions(readFileSync(resolve(directory, file), 'utf8'), file);
    } catch (error) {
      if (Array.isArray(error?.violations)) violations.push(...error.violations);
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length) {
    const error = new Error(errors.join('\n'));
    error.violations = violations;
    throw error;
  }
  return files.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const count = checkWorkflowDirectory(resolve(process.argv[2] ?? '.github/workflows'));
    console.log(`Read-only permissions verified for ${count} workflow(s).`);
  } catch (error) {
    // In Actions, annotate each violation so it surfaces in the job summary and file view.
    if (process.env['GITHUB_ACTIONS'] === 'true' && Array.isArray(error?.violations)) {
      for (const violation of error.violations) console.log(formatAnnotation(violation));
    }
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
