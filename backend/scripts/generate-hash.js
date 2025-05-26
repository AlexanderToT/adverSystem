#!/usr/bin/env node

// 一个简单的脚本，用于编译并运行密码哈希生成工具

const { execSync } = require('child_process');
const path = require('path');

console.log('编译TypeScript...');
try {
    execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
} catch (error) {
    console.error('编译失败，请确保安装了所有依赖项');
    process.exit(1);
}

console.log('运行哈希生成工具...');
try {
    execSync('node dist/utils/generate-admin-hash.js', { stdio: 'inherit' });
} catch (error) {
    console.error('运行哈希生成工具时出错');
    process.exit(1);
} 