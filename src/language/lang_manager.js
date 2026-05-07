import { spanish } from './spanish.js';
import { english } from './english.js';
import { french } from './french.js';

let currentLanguage = spanish;

export function setLanguage(langObj) {
  currentLanguage = langObj;
}

export function t(key) {
  return currentLanguage[key] || key;
}