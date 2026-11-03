import { describe, it, expect } from 'vitest';
import { detectFallacies } from './fallacy-spotter';
describe('detectFallacies', () => { it('detects bandwagon', () => { expect(detectFallacies('everyone knows this is true').length).toBeGreaterThan(0); }); });
