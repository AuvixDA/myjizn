import { describe, expect, it } from 'vitest';
import { pluralizeRu } from './pluralize';

const FORMS: [string, string, string] = ['задача', 'задачи', 'задач'];

describe('pluralizeRu', () => {
  it.each([
    [1, 'задача'],
    [2, 'задачи'],
    [3, 'задачи'],
    [4, 'задачи'],
    [5, 'задач'],
    [0, 'задач'],
    [11, 'задач'],
    [12, 'задач'],
    [14, 'задач'],
    [21, 'задача'],
    [22, 'задачи'],
    [25, 'задач'],
    [101, 'задача'],
  ])('%i -> %s', (count, expected) => {
    expect(pluralizeRu(count, FORMS)).toBe(expected);
  });
});
