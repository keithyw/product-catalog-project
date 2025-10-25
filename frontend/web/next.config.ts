import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				// Using a wildcard for the hostname allows images from any domain.
				hostname: '**',
			},
		],
	},
	reactStrictMode: false,
}

export default nextConfig
