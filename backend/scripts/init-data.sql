-- 添加角色
INSERT INTO roles (name, description) VALUES 
('super_admin', '超级管理员，拥有所有权限'),
('user', '普通用户，权限受限')
ON CONFLICT (name) DO NOTHING;

-- 获取super_admin角色ID
DO $$
DECLARE
    super_admin_id UUID;
    admin_user_id UUID;
BEGIN
    -- 获取超级管理员角色ID
    SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
    
    -- 创建管理员用户(密码: admin123)
    -- 注意: 这个密码哈希是使用我们的Web Crypto API生成的，与实际系统匹配
    -- 实际项目中应该使用代码生成而不是硬编码
    INSERT INTO users (username, password_hash, display_name, email, login_type, is_active) 
    VALUES ('admin', 'jq1XbbljFUQ/j8xN8OMr1emz1O6uTbJEDQEhp3MeT16Oa4hcQQM9O7zyEGvYYHTC', '系统管理员', 'admin@example.com', 'password', true)
    ON CONFLICT (username) DO NOTHING
    RETURNING id INTO admin_user_id;
    
    -- 如果创建了新用户，分配超级管理员角色
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id) VALUES (admin_user_id, super_admin_id);
    END IF;
END $$; 