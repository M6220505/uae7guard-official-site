'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

type AdminKeyGateProps = {
  title: string;
  description: string;
  unavailableMessage?: string | null;
};

export default function AdminKeyGate({
  title,
  description,
  unavailableMessage = null
}: AdminKeyGateProps) {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({adminKey})
      });

      const payload = (await response.json()) as {error?: string};
      if (!response.ok) {
        setError(payload.error ?? 'Failed to establish admin session.');
        return;
      }

      setAdminKey('');
      router.refresh();
    } catch {
      setError('Unable to reach admin session endpoint.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-zinc-300">{description}</p>

      {unavailableMessage ? (
        <p className="mt-4 rounded-lg border border-rose-700/50 bg-rose-900/20 p-3 text-sm text-rose-200">
          {unavailableMessage}
        </p>
      ) : (
        <form className="mt-4 grid gap-3 md:max-w-xl" onSubmit={onSubmit}>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Admin key</span>
            <input
              type="password"
              autoComplete="off"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Enter x-admin-key"
              required
            />
          </label>

          <button type="submit" className="cta-btn w-fit" disabled={submitting}>
            {submitting ? 'Validating...' : 'Unlock Usage Console'}
          </button>
        </form>
      )}

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
