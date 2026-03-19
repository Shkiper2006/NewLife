import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const packageJsonPath = path.join(cwd, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('[doctor] package.json не найден.');
  console.error('[doctor] Откройте терминал в корне проекта NewLife и повторите команду.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencies = Object.keys(packageJson.dependencies ?? {});
const devDependencies = Object.keys(packageJson.devDependencies ?? {});
const nodeModulesPath = path.join(cwd, 'node_modules');
const hasNodeModules = fs.existsSync(nodeModulesPath);

const importantPackages = [
  'react',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/rapier',
  'zustand',
  'ws',
  'vite',
  'typescript',
];

const missingPackages = importantPackages.filter((packageName) => !fs.existsSync(path.join(nodeModulesPath, packageName)));

console.log('=== NewLife doctor ===');
console.log(`Текущая папка: ${cwd}`);
console.log(`Проект: ${packageJson.name ?? 'unknown'}`);
console.log(`dependencies: ${dependencies.length}`);
console.log(`devDependencies: ${devDependencies.length}`);
console.log(`node_modules существует: ${hasNodeModules ? 'да' : 'нет'}`);
console.log(`Ключевые пакеты отсутствуют: ${missingPackages.length}`);

if (dependencies.length === 0 && devDependencies.length === 0) {
  console.error('\n[doctor] В package.json нет зависимостей.');
  process.exit(1);
}

if (!hasNodeModules) {
  console.error('\n[doctor] Папка node_modules отсутствует.');
  console.error('[doctor] Выполните: npm install');
  process.exit(1);
}

if (missingPackages.length > 0) {
  console.error('\n[doctor] Установлены не все нужные пакеты.');
  console.error(`[doctor] Отсутствуют: ${missingPackages.join(', ')}`);
  console.error('[doctor] Попробуйте выполнить команды:');
  console.error('  rm -rf node_modules package-lock.json');
  console.error('  npm install');
  console.error('  npm run doctor');
  process.exit(1);
}

console.log('\n[doctor] Похоже, зависимости установлены корректно.');
console.log('[doctor] Можно запускать: npm run dev');
