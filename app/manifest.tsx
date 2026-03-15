import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BamBii',
    short_name: 'BamBii',
    description: 'BamBi - Find Basketball Courts Near You',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: 'logo.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}