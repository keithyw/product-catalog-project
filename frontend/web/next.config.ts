import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				// Using a wildcard for the hostname allows images from any domain.
				hostname: '**',
				port: '',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '7000',
			},
		],
	},
	reactStrictMode: false,
}

export default nextConfig
