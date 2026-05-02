import React from 'react';
import { calcCombinatorics } from '../../api/combinatorics.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import combinatoricsTheory from '../../../../../data/content/discrete-math/combinatorics.content.js';

function toNumber(value) {
  return Number(value);
}

function buildCombinatoricsPayload({ operation, values }) {
  if (operation === 'factorial') {
    return { operation, n: toNumber(values.n) };
  }

  if (operation === 'permutation' || operation === 'combination') {
    return { operation, n: toNumber(values.n), r: toNumber(values.r) };
  }

  if (operation === 'pigeonhole') {
    return { operation, pigeons: toNumber(values.pigeons), holes: toNumber(values.holes) };
  }

  if (operation === 'catalan') {
    return { operation, n: toNumber(values.catalanN) };
  }

  if (operation === 'stirling') {
    return { operation, n: toNumber(values.stirlingN), k: toNumber(values.stirlingK) };
  }

  return { operation, n: toNumber(values.binomialN), k: toNumber(values.binomialK) };
}

const combinatoricsConfig = {
  id: 'combinatorics',
  eyebrow: 'Discrete Mathematics',
  title: 'Combinatorics',
  subtitle: 'A structured workspace for finite counting: factorials, permutations, combinations, and classical counting sequences.',
  theory: combinatoricsTheory,
  practice: {
    title: 'Counting Calculator',
    description: 'Select a counting model, provide the parameters, and compare the numeric result with the reference formula.',
    operationLabel: 'Counting Model',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcCombinatorics,
    buildPayload: buildCombinatoricsPayload,
    operations: [
      { value: 'factorial', label: 'Factorial (n!)', hint: 'Counts arrangements of n distinct objects.', default: true },
      { value: 'permutation', label: 'Permutation P(n, r)', hint: 'Order matters: arrange r objects from n.' },
      { value: 'combination', label: 'Combination C(n, r)', hint: 'Order does not matter: select r objects from n.' },
      { value: 'pigeonhole', label: 'Pigeonhole Principle', hint: 'Find the guaranteed minimum occupancy.' },
      { value: 'catalan', label: 'Catalan Number', hint: 'Counts recursive structures such as valid parentheses.' },
      { value: 'stirling', label: 'Stirling Number S(n, k)', hint: 'Partitions n labeled objects into k non-empty unlabeled subsets.' },
      { value: 'binomial', label: 'Binomial Coefficient', hint: 'Compute a coefficient from the binomial theorem.' },
    ],
    fields: [
      {
        name: 'n',
        label: 'n value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 170,
        defaultValue: 5,
        hint: 'Total number of elements.',
        showWhen: ['factorial', 'permutation', 'combination'],
        required: true,
      },
      {
        name: 'r',
        label: 'r value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 170,
        defaultValue: 2,
        hint: 'Number of selected or arranged elements.',
        showWhen: ['permutation', 'combination'],
        required: true,
      },
      {
        name: 'pigeons',
        label: 'Objects',
        smartType: 'validated-number',
        type: 'number',
        min: 1,
        defaultValue: 10,
        hint: 'Number of objects being distributed.',
        showWhen: ['pigeonhole'],
        required: true,
      },
      {
        name: 'holes',
        label: 'Containers',
        smartType: 'validated-number',
        type: 'number',
        min: 1,
        defaultValue: 9,
        hint: 'Number of available containers.',
        showWhen: ['pigeonhole'],
        required: true,
      },
      {
        name: 'catalanN',
        label: 'n value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 20,
        defaultValue: 4,
        hint: 'Index of the Catalan number.',
        showWhen: ['catalan'],
        required: true,
      },
      {
        name: 'stirlingN',
        label: 'n value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 50,
        defaultValue: 5,
        hint: 'Number of labeled elements.',
        showWhen: ['stirling'],
        required: true,
      },
      {
        name: 'stirlingK',
        label: 'k value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 50,
        defaultValue: 3,
        hint: 'Number of non-empty subsets.',
        showWhen: ['stirling'],
        required: true,
      },
      {
        name: 'binomialN',
        label: 'n value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 170,
        defaultValue: 5,
        hint: 'Upper value in the binomial coefficient.',
        showWhen: ['binomial'],
        required: true,
      },
      {
        name: 'binomialK',
        label: 'k value',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        max: 170,
        defaultValue: 2,
        hint: 'Lower value in the binomial coefficient.',
        showWhen: ['binomial'],
        required: true,
      },
    ],
  },
};

export default function Combinatorics() {
  return <ModuleExperience config={combinatoricsConfig} />;
}
