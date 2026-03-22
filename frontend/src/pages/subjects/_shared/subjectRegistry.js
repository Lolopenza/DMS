import { discreteMathModules } from '../discrete-math/index.js';
import { linearAlgebraModules } from '../linear-algebra/index.js';
import { algorithmModules } from '../algorithms/index.js';
import { probabilityStatisticsModules } from '../probability-statistics/index.js';
import { itLogicModules } from '../it-logic/index.js';

export const SUBJECT_MODULE_REGISTRIES = {
  'discrete-math': discreteMathModules,
  'linear-algebra': linearAlgebraModules,
  'algorithms': algorithmModules,
  'probability-statistics': probabilityStatisticsModules,
  'it-logic': itLogicModules,
};

export function isSubjectImplemented(subjectSlug) {
  return Boolean(subjectSlug && SUBJECT_MODULE_REGISTRIES[subjectSlug]);
}

export function getModuleSlugsBySubject(subjectSlug) {
  return Object.keys(SUBJECT_MODULE_REGISTRIES[subjectSlug] || {});
}

export function getKnownModuleSlugs() {
  const all = Object.values(SUBJECT_MODULE_REGISTRIES).flatMap((registry) => Object.keys(registry));
  return Array.from(new Set(all));
}

export async function loadSubjectModule(subjectSlug, moduleSlug) {
  const registry = SUBJECT_MODULE_REGISTRIES[subjectSlug];
  if (!registry) return undefined;

  const loader = registry[moduleSlug];
  if (!loader) return undefined;

  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load module ${subjectSlug}/${moduleSlug}:`, error);
    return undefined;
  }
}
