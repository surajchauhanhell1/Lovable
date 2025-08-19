'use client';

export default function Page() {
	return (
		<main className="min-h-screen bg-gray-50 text-gray-900">
			<section className="mx-auto max-w-3xl px-6 py-16 grid gap-6 place-items-center text-center">
				<div>
					<h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Open Lovable</h1>
					<p className="mt-4 text-sm sm:text-base text-gray-600">
						Deployment is active. This lightweight UI is optimized for Cloudflare Pages (Edge) compatibility.
					</p>
					<div className="mt-5 inline-flex items-center gap-3 text-xs sm:text-sm text-gray-600 justify-center">
						<span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
						<span className="font-medium">Edge runtime ready</span>
					</div>
				</div>

				<div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
					<a
						href="/api/sandbox-status"
						className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
					>
						Check API Status
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
			</section>
		</main>
	);
}

