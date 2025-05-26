#!/bin/bash

# 清理脚本 - 移动完成重构后清理旧文件

# 确认操作
echo "此脚本将删除旧的账号管理模块文件，确保您已完成迁移后再运行"
read -p "确认删除旧文件? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

# 删除旧文件
echo "正在删除旧文件..."

if [ -d "./src/accounts" ]; then
    echo "删除 src/accounts 目录"
    rm -rf ./src/accounts
fi

echo "清理完成！"
echo "请确保新的目录结构正常工作后再运行项目" 