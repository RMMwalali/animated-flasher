/** TikTok video details from TikTok's public oEmbed endpoint (no API key). Cached for a day. */
export type TikTokVideo = { url: string; id: string; title: string; author: string; thumbnail?: string }

export const tiktokIdFrom = (url: string): string | null => /\/video\/(\d{8,25})/.exec(url)?.[1] ?? null

export async function tiktokVideos(urls: string[]): Promise<TikTokVideo[]> {
  const out = await Promise.all(
    urls.slice(0, 12).map(async (url): Promise<TikTokVideo | null> => {
      try {
        const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000) })
        if (!res.ok) return null
        const j = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string; embed_product_id?: string }
        const id = j.embed_product_id || tiktokIdFrom(url)
        if (!id) return null
        return { url, id, title: (j.title ?? '').slice(0, 140), author: j.author_name ?? '', thumbnail: j.thumbnail_url }
      } catch {
        // offline or removed video: still show it if the link has an id
        const id = tiktokIdFrom(url)
        return id ? { url, id, title: '', author: '' } : null
      }
    }),
  )
  return out.filter((v): v is TikTokVideo => Boolean(v))
}
