import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const billingCycleEnum = pgEnum('billing_cycle', [
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'paused',
  'cancelled',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'email',
  'whatsapp',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'sent',
  'failed',
]);

export const categories = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    icon: varchar('icon', { length: 50 }).notNull().default('folder'),
    color: varchar('color', { length: 20 }).notNull().default('#6366f1'),
  },
  (table) => ({
    nameLowerUniqueIndex: uniqueIndex('idx_categories_name_lower_unique').on(
      sql`LOWER(${table.name})`
    ),
  })
);

export const subscriptionTemplates = pgTable('subscription_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  defaultCurrency: varchar('default_currency', { length: 3 }).notNull().default('USD'),
  logoUrl: varchar('logo_url', { length: 500 }),
  websiteUrl: varchar('website_url', { length: 500 }),
});

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    billingCycle: billingCycleEnum('billing_cycle').notNull(),
    nextRenewalDate: date('next_renewal_date').notNull(),
    startDate: date('start_date'),
    status: subscriptionStatusEnum('status').notNull().default('active'),
    notes: text('notes'),
    logoUrl: varchar('logo_url', { length: 500 }),
    templateId: integer('template_id').references(() => subscriptionTemplates.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    statusIndex: index('idx_subscriptions_status').on(table.status),
    nextRenewalIndex: index('idx_subscriptions_next_renewal').on(table.nextRenewalDate),
    categoryIndex: index('idx_subscriptions_category').on(table.categoryId),
  })
);

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  preferredCurrency: varchar('preferred_currency', { length: 3 }).notNull().default('INR'),
  email: varchar('email', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  whatsappNotifications: boolean('whatsapp_notifications').notNull().default(true),
  reminderDaysBefore: integer('reminder_days_before').notNull().default(7),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: serial('id').primaryKey(),
    subscriptionId: integer('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    status: notificationStatusEnum('status').notNull(),
    renewalDate: date('renewal_date').notNull(),
    message: text('message'),
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    subscriptionRenewalIndex: index('idx_notification_logs_subscription').on(
      table.subscriptionId,
      table.renewalDate
    ),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  subscriptionTemplates: many(subscriptionTemplates),
  subscriptions: many(subscriptions),
}));

export const subscriptionTemplatesRelations = relations(subscriptionTemplates, ({ one, many }) => ({
  category: one(categories, {
    fields: [subscriptionTemplates.categoryId],
    references: [categories.id],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  category: one(categories, {
    fields: [subscriptions.categoryId],
    references: [categories.id],
  }),
  template: one(subscriptionTemplates, {
    fields: [subscriptions.templateId],
    references: [subscriptionTemplates.id],
  }),
  notificationLogs: many(notificationLogs),
}));

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [notificationLogs.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type SubscriptionTemplate = typeof subscriptionTemplates.$inferSelect;
export type NewSubscriptionTemplate = typeof subscriptionTemplates.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type NewNotificationLog = typeof notificationLogs.$inferInsert;