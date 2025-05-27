import { pgTable, uuid, varchar, boolean, timestamp, text, jsonb, bigint, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  loginType: varchar('login_type', { length: 50 }).default('password').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 角色表
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 用户-角色关联表
export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
});

// 广告模块数据模型
export const advertisements = pgTable('advertisements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  adType: varchar('ad_type', { length: 50 }).notNull(),
  targetUrl: text('target_url'),
  materialConfig: jsonb('material_config'), // 存储素材信息JSON
  displayConfig: jsonb('display_config'), // 用于多图广告的配置
  countryCodes: text('country_codes'), // 存储JSON格式的国家代码数组以,分隔
  isDisplayed: boolean('is_displayed').default(true).notNull(),
  totalClicks: bigint('total_clicks', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const adStatistics = pgTable('ad_statistics', {
  id: serial('id').primaryKey(),
  advertisementId: uuid('advertisement_id').notNull().references(() => advertisements.id),
  applicationId: uuid('application_id').notNull(), // 应用ID，需要在应用模块创建后再建立外键关联
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'click', 'impression'
  eventTime: timestamp('event_time', { withTimezone: true }).defaultNow().notNull(),
  countryCode: varchar('country_code', { length: 10 }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 50 }),
});

// 定义关系
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
})); 