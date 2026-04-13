-- Seed Categories
INSERT INTO categories (name, icon, color) VALUES
  ('Entertainment', 'film', '#ef4444'),
  ('Productivity', 'briefcase', '#3b82f6'),
  ('Utilities & Storage', 'hard-drive', '#8b5cf6'),
  ('Food & Lifestyle', 'utensils', '#f97316'),
  ('News & Reading', 'book-open', '#10b981'),
  ('Gaming', 'gamepad-2', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Seed Subscription Templates
-- Entertainment (category_id = 1)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('Netflix', 1, 'INR', 'https://logo.clearbit.com/netflix.com', 'https://netflix.com'),
  ('Spotify', 1, 'INR', 'https://logo.clearbit.com/spotify.com', 'https://spotify.com'),
  ('Amazon Prime', 1, 'INR', 'https://logo.clearbit.com/amazon.com', 'https://amazon.in'),
  ('YouTube Premium', 1, 'INR', 'https://logo.clearbit.com/youtube.com', 'https://youtube.com'),
  ('Hotstar', 1, 'INR', 'https://logo.clearbit.com/hotstar.com', 'https://hotstar.com'),
  ('Apple TV+', 1, 'USD', 'https://logo.clearbit.com/apple.com', 'https://tv.apple.com'),
  ('Zee5', 1, 'INR', 'https://logo.clearbit.com/zee5.com', 'https://zee5.com'),
  ('SonyLIV', 1, 'INR', 'https://logo.clearbit.com/sonyliv.com', 'https://sonyliv.com'),
  ('JioCinema', 1, 'INR', 'https://logo.clearbit.com/jiocinema.com', 'https://jiocinema.com'),
  ('Mubi', 1, 'INR', 'https://logo.clearbit.com/mubi.com', 'https://mubi.com'),
  ('Apple Music', 1, 'INR', 'https://logo.clearbit.com/apple.com', 'https://music.apple.com')
ON CONFLICT DO NOTHING;

-- Productivity (category_id = 2)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('Notion', 2, 'USD', 'https://logo.clearbit.com/notion.so', 'https://notion.so'),
  ('Figma', 2, 'USD', 'https://logo.clearbit.com/figma.com', 'https://figma.com'),
  ('GitHub', 2, 'USD', 'https://logo.clearbit.com/github.com', 'https://github.com'),
  ('ChatGPT Plus', 2, 'USD', 'https://logo.clearbit.com/openai.com', 'https://chat.openai.com'),
  ('Copilot', 2, 'USD', 'https://logo.clearbit.com/microsoft.com', 'https://copilot.microsoft.com'),
  ('Adobe Creative Cloud', 2, 'USD', 'https://logo.clearbit.com/adobe.com', 'https://adobe.com'),
  ('Microsoft 365', 2, 'INR', 'https://logo.clearbit.com/microsoft.com', 'https://microsoft.com'),
  ('Google One', 2, 'INR', 'https://logo.clearbit.com/google.com', 'https://one.google.com'),
  ('Dropbox', 2, 'USD', 'https://logo.clearbit.com/dropbox.com', 'https://dropbox.com'),
  ('Slack', 2, 'USD', 'https://logo.clearbit.com/slack.com', 'https://slack.com'),
  ('Zoom', 2, 'USD', 'https://logo.clearbit.com/zoom.us', 'https://zoom.us'),
  ('Canva Pro', 2, 'INR', 'https://logo.clearbit.com/canva.com', 'https://canva.com'),
  ('Linear', 2, 'USD', 'https://logo.clearbit.com/linear.app', 'https://linear.app'),
  ('Loom', 2, 'USD', 'https://logo.clearbit.com/loom.com', 'https://loom.com')
ON CONFLICT DO NOTHING;

-- Utilities & Storage (category_id = 3)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('iCloud+', 3, 'INR', 'https://logo.clearbit.com/apple.com', 'https://apple.com/icloud'),
  ('Google One', 3, 'INR', 'https://logo.clearbit.com/google.com', 'https://one.google.com'),
  ('OneDrive', 3, 'INR', 'https://logo.clearbit.com/microsoft.com', 'https://onedrive.live.com'),
  ('NordVPN', 3, 'USD', 'https://logo.clearbit.com/nordvpn.com', 'https://nordvpn.com'),
  ('ExpressVPN', 3, 'USD', 'https://logo.clearbit.com/expressvpn.com', 'https://expressvpn.com')
ON CONFLICT DO NOTHING;

-- Food & Lifestyle (category_id = 4)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('Swiggy One', 4, 'INR', 'https://logo.clearbit.com/swiggy.com', 'https://swiggy.com'),
  ('Zomato Pro', 4, 'INR', 'https://logo.clearbit.com/zomato.com', 'https://zomato.com'),
  ('Cure.fit', 4, 'INR', 'https://logo.clearbit.com/cure.fit', 'https://cure.fit')
ON CONFLICT DO NOTHING;

-- News & Reading (category_id = 5)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('Medium', 5, 'USD', 'https://logo.clearbit.com/medium.com', 'https://medium.com'),
  ('The Ken', 5, 'INR', 'https://logo.clearbit.com/the-ken.com', 'https://the-ken.com'),
  ('Morning Brew', 5, 'USD', 'https://logo.clearbit.com/morningbrew.com', 'https://morningbrew.com')
ON CONFLICT DO NOTHING;

-- Gaming (category_id = 6)
INSERT INTO subscription_templates (name, category_id, default_currency, logo_url, website_url) VALUES
  ('Xbox Game Pass', 6, 'INR', 'https://logo.clearbit.com/xbox.com', 'https://xbox.com/gamepass'),
  ('PlayStation Plus', 6, 'INR', 'https://logo.clearbit.com/playstation.com', 'https://playstation.com'),
  ('EA Play', 6, 'INR', 'https://logo.clearbit.com/ea.com', 'https://ea.com'),
  ('Apple Arcade', 6, 'INR', 'https://logo.clearbit.com/apple.com', 'https://apple.com/arcade'),
  ('Google Play Pass', 6, 'INR', 'https://logo.clearbit.com/google.com', 'https://play.google.com')
ON CONFLICT DO NOTHING;

-- Default user settings
INSERT INTO user_settings (preferred_currency, email, whatsapp_number, email_notifications, whatsapp_notifications, reminder_days_before)
VALUES ('INR', '', '', true, true, 7)
ON CONFLICT DO NOTHING;
