'use client';

export default function Page() {
	return (
		<main className="min-h-screen grid place-items-center bg-gray-50 text-gray-900">
			<section className="text-center px-6">
				<h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Open Lovable</h1>
				<p className="mt-3 text-sm sm:text-base text-gray-600">
					Deployment is active. This lightweight UI is optimized for Cloudflare Pages (Edge) compatibility.
				</p>
				<div className="mt-6 inline-flex items-center gap-3 text-sm text-gray-500">
					<span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
					<span>Edge runtime ready</span>
				</div>
			</section>
		</main>
	);
}

