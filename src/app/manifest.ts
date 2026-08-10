import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Urja-Link India Dashboard',
        short_name: 'UrjaLink',
        description: 'National Solar Energy Digital Twin & Marketplace',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#023e8a',
        icons: [
            {
                src: '/icon.svg',
                sizes: '192x192 512x512',
                type: 'image/svg+xml',
                purpose: 'maskable'
            }
        ]
    };
}
