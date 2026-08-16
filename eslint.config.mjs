import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['out/**', '.next/**', 'node_modules/**', 'public/ask/**', 'scripts/**'] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
