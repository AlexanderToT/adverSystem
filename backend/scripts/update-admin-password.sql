-- 这个脚本会更新admin用户的密码
-- 将使用一个预设的安全哈希值，对应于"admin123"密码
-- 这个哈希值是通过Web Crypto API的SHA-256算法生成的，与应用程序中的hashPassword函数匹配

-- 显示更新前的密码哈希值
SELECT username, password_hash FROM users WHERE username = 'admin';

-- 更新admin用户的密码哈希
-- 新密码: admin123
UPDATE users SET password_hash = 'jq1XbbljFUQ/j8xN8OMr1emz1O6uTbJEDQEhp3MeT16Oa4hcQQM9O7zyEGvYYHTC' WHERE username = 'admin';

-- 确认更新
SELECT username, password_hash FROM users WHERE username = 'admin'; 