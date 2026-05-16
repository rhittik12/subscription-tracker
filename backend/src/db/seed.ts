import 'dotenv/config';

import { inArray } from 'drizzle-orm';

import { db } from './index';
import {
  categories,
  subscriptionTemplates,
  userSettings,
  type NewCategory,
  type NewSubscriptionTemplate,
  type NewUserSetting,
} from './schema';

type TemplateSeed = Omit<NewSubscriptionTemplate, 'categoryId'> & {
  categoryName: string;
};

const categorySeeds = [
  { name: 'Entertainment', icon: 'film', color: '#ef4444' },
  { name: 'Productivity', icon: 'briefcase', color: '#3b82f6' },
  { name: 'Utilities & Storage', icon: 'hard-drive', color: '#8b5cf6' },
  { name: 'Food & Lifestyle', icon: 'utensils', color: '#f97316' },
  { name: 'News & Reading', icon: 'book-open', color: '#10b981' },
  { name: 'Gaming', icon: 'gamepad-2', color: '#ec4899' },
] satisfies Array<NewCategory>;

const templateSeeds = [
  { name: 'Netflix', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/netflix.com', websiteUrl: 'https://netflix.com' },
  { name: 'Spotify', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/spotify.com', websiteUrl: 'https://spotify.com' },
  { name: 'Amazon Prime', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/amazon.com', websiteUrl: 'https://amazon.in' },
  { name: 'YouTube Premium', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/youtube.com', websiteUrl: 'https://youtube.com' },
  { name: 'Hotstar', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/hotstar.com', websiteUrl: 'https://hotstar.com' },
  { name: 'Apple TV+', categoryName: 'Entertainment', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/apple.com', websiteUrl: 'https://tv.apple.com' },
  { name: 'Zee5', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/zee5.com', websiteUrl: 'https://zee5.com' },
  { name: 'SonyLIV', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/sonyliv.com', websiteUrl: 'https://sonyliv.com' },
  { name: 'JioCinema', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/jiocinema.com', websiteUrl: 'https://jiocinema.com' },
  { name: 'Mubi', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/mubi.com', websiteUrl: 'https://mubi.com' },
  { name: 'Apple Music', categoryName: 'Entertainment', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/apple.com', websiteUrl: 'https://music.apple.com' },
  { name: 'Notion', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/notion.so', websiteUrl: 'https://notion.so' },
  { name: 'Figma', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/figma.com', websiteUrl: 'https://figma.com' },
  { name: 'GitHub', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/github.com', websiteUrl: 'https://github.com' },
  { name: 'ChatGPT Plus', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/openai.com', websiteUrl: 'https://chat.openai.com' },
  { name: 'Copilot', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/microsoft.com', websiteUrl: 'https://copilot.microsoft.com' },
  { name: 'Adobe Creative Cloud', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/adobe.com', websiteUrl: 'https://adobe.com' },
  { name: 'Microsoft 365', categoryName: 'Productivity', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/microsoft.com', websiteUrl: 'https://microsoft.com' },
  { name: 'Google One', categoryName: 'Productivity', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/google.com', websiteUrl: 'https://one.google.com' },
  { name: 'Dropbox', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/dropbox.com', websiteUrl: 'https://dropbox.com' },
  { name: 'Slack', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/slack.com', websiteUrl: 'https://slack.com' },
  { name: 'Zoom', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/zoom.us', websiteUrl: 'https://zoom.us' },
  { name: 'Canva Pro', categoryName: 'Productivity', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/canva.com', websiteUrl: 'https://canva.com' },
  { name: 'Linear', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/linear.app', websiteUrl: 'https://linear.app' },
  { name: 'Loom', categoryName: 'Productivity', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/loom.com', websiteUrl: 'https://loom.com' },
  { name: 'iCloud+', categoryName: 'Utilities & Storage', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/apple.com', websiteUrl: 'https://apple.com/icloud' },
  { name: 'Google One', categoryName: 'Utilities & Storage', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/google.com', websiteUrl: 'https://one.google.com' },
  { name: 'OneDrive', categoryName: 'Utilities & Storage', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/microsoft.com', websiteUrl: 'https://onedrive.live.com' },
  { name: 'NordVPN', categoryName: 'Utilities & Storage', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/nordvpn.com', websiteUrl: 'https://nordvpn.com' },
  { name: 'ExpressVPN', categoryName: 'Utilities & Storage', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/expressvpn.com', websiteUrl: 'https://expressvpn.com' },
  { name: 'Swiggy One', categoryName: 'Food & Lifestyle', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/swiggy.com', websiteUrl: 'https://swiggy.com' },
  { name: 'Zomato Pro', categoryName: 'Food & Lifestyle', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/zomato.com', websiteUrl: 'https://zomato.com' },
  { name: 'Cure.fit', categoryName: 'Food & Lifestyle', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/cure.fit', websiteUrl: 'https://cure.fit' },
  { name: 'Medium', categoryName: 'News & Reading', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/medium.com', websiteUrl: 'https://medium.com' },
  { name: 'The Ken', categoryName: 'News & Reading', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/the-ken.com', websiteUrl: 'https://the-ken.com' },
  { name: 'Morning Brew', categoryName: 'News & Reading', defaultCurrency: 'USD', logoUrl: 'https://logo.clearbit.com/morningbrew.com', websiteUrl: 'https://morningbrew.com' },
  { name: 'Xbox Game Pass', categoryName: 'Gaming', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/xbox.com', websiteUrl: 'https://xbox.com/gamepass' },
  { name: 'PlayStation Plus', categoryName: 'Gaming', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/playstation.com', websiteUrl: 'https://playstation.com' },
  { name: 'EA Play', categoryName: 'Gaming', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/ea.com', websiteUrl: 'https://ea.com' },
  { name: 'Apple Arcade', categoryName: 'Gaming', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/apple.com', websiteUrl: 'https://apple.com/arcade' },
  { name: 'Google Play Pass', categoryName: 'Gaming', defaultCurrency: 'INR', logoUrl: 'https://logo.clearbit.com/google.com', websiteUrl: 'https://play.google.com' },
] satisfies Array<TemplateSeed>;

const defaultUserSettings = {
  preferredCurrency: 'INR',
  email: '',
  whatsappNumber: '',
  emailNotifications: true,
  whatsappNotifications: true,
  reminderDaysBefore: 7,
} satisfies Omit<NewUserSetting, 'id' | 'createdAt' | 'updatedAt'>;

async function seedCategories(): Promise<Map<string, number>> {
  await db.insert(categories).values(categorySeeds).onConflictDoNothing();

  const existingCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return new Map(existingCategories.map((category) => [category.name.toLowerCase(), category.id]));
}

async function seedSubscriptionTemplates(categoryMap: Map<string, number>): Promise<void> {
  const existingTemplates = await db
    .select({ name: subscriptionTemplates.name, categoryId: subscriptionTemplates.categoryId })
    .from(subscriptionTemplates)
    .where(inArray(subscriptionTemplates.categoryId, Array.from(categoryMap.values())));

  const existingKeys = new Set(
    existingTemplates.map((template) => `${template.name}::${template.categoryId}`)
  );

  const templatesToInsert = templateSeeds
    .map(({ categoryName, ...template }) => {
      const categoryId = categoryMap.get(categoryName.toLowerCase());

      if (!categoryId) {
        throw new Error(`Missing category for template seed: ${categoryName}`);
      }

      return {
        ...template,
        categoryId,
      } satisfies NewSubscriptionTemplate;
    })
    .filter((template) => !existingKeys.has(`${template.name}::${template.categoryId}`));

  if (templatesToInsert.length > 0) {
    await db.insert(subscriptionTemplates).values(templatesToInsert);
  }
}

async function seedUserSettings(): Promise<void> {
  const existingSettings = await db.select({ id: userSettings.id }).from(userSettings).limit(1);

  if (existingSettings.length === 0) {
    await db.insert(userSettings).values(defaultUserSettings);
  }
}

async function main(): Promise<void> {
  const categoryMap = await seedCategories();
  await seedSubscriptionTemplates(categoryMap);
  await seedUserSettings();

  console.log('Database seed completed successfully');
}

main().catch((error) => {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
});