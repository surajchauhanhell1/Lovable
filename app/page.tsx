'use client';

import { useEffect, useState } from 'react';

export default function Page() {
	const [status, setStatus] = useState<{ ok: boolean; detail?: any } | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch('/api/health', { cache: 'no-store' });
				const json = await res.json();
				if (mounted) setStatus({ ok: json.success === true, detail: json });
			} catch (e) {
				if (mounted) setStatus({ ok: false, detail: { error: (e as Error).message } });
			}
		})();
		return () => { mounted = false };
	}, []);

	return (
		<main className="min-h-screen bg-gray-50 text-gray-900">
			<section className="mx-auto max-w-3xl px-6 py-16 grid gap-6 place-items-center text-center">
				<div>
					<h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Open Lovable</h1>
					<p className="mt-4 text-sm sm:text-base text-gray-600">
						Production deployment is active on Cloudflare Pages (Edge).
					</p>
					<div className="mt-5 inline-flex items-center gap-3 text-xs sm:text-sm text-gray-600 justify-center">
						<span className={"inline-flex h-2.5 w-2.5 rounded-full " + (status?.ok ? 'bg-emerald-500' : 'bg-amber-500')} />
						<span className="font-medium">{status ? (status.ok ? 'All systems operational' : 'Partial configuration') : 'Checking status...'}</span>
					</div>
				</div>

				<div className="mt-8 grid gap-3 w-full sm:w-auto">
					<div className="rounded-lg border bg-white/60 p-4 text-left">
						<p className="text-sm font-medium text-gray-800">Live Health</p>
						<pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-900 p-3 text-left text-xs text-gray-100">
							{status?.detail ? JSON.stringify(status.detail, null, 2) : 'Loading...'}
						</pre>
					</div>

					<div className="flex flex-col sm:flex-row items-center gap-3">
						<a
							href="/api/health"
							className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
						>
							Open Health JSON
						</a>
						<a
							href="https://github.com/ai-hub-2/open-lovable"
							target="_blank"
							rel="noreferrer"
							className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 hover:bg-white/60 transition"
						>
							View Repository
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}

