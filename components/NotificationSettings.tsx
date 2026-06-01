'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

type NotificationConfig = {
  telegram: string;
  discord: string;
};

const STORAGE_KEY = 'uae7guard.notifications.v25';

function loadInitialConfig(): NotificationConfig {
  if (typeof window === 'undefined') {
    return {telegram: '', discord: ''};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {telegram: '', discord: ''};
  }

  try {
    const parsed = JSON.parse(raw) as NotificationConfig;
    return {
      telegram: typeof parsed.telegram === 'string' ? parsed.telegram : '',
      discord: typeof parsed.discord === 'string' ? parsed.discord : ''
    };
  } catch {
    return {telegram: '', discord: ''};
  }
}

export default function NotificationSettings() {
  const t = useTranslations('notifications');
  const [config, setConfig] = useState<NotificationConfig>(loadInitialConfig);
  const [saved, setSaved] = useState(false);

  function onSave() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('telegram')}</span>
          <input
            value={config.telegram}
            onChange={(event) =>
              setConfig((previous) => ({...previous, telegram: event.target.value}))
            }
            placeholder="https://api.telegram.org/bot..."
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>{t('discord')}</span>
          <input
            value={config.discord}
            onChange={(event) =>
              setConfig((previous) => ({...previous, discord: event.target.value}))
            }
            placeholder="https://discord.com/api/webhooks/..."
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button type="button" className="cta-btn" onClick={onSave}>
          {t('save')}
        </button>
        {saved ? <span className="text-sm text-emerald-300">{t('saved')}</span> : null}
      </div>
    </section>
  );
}
