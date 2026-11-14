/** Real Google reviews via the Places API (New). Cached for 12 hours; never invented or filtered. */
import { getConfig } from '@/lib/config'

export type GoogleReview = { author: string; authorUrl?: string; photo?: string; rating: number; when: string; text: string; publishTime?: string }
export type GoogleReviews = { name: string; rating: number; count: number; url?: string; reviews: GoogleReview[] }

export async function googleReviews(): Promise<GoogleReviews | null> {
  const { placesApiKey, placeId } = (await getConfig()).google
  if (!placesApiKey || !placeId) return null
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: { 'X-Goog-Api-Key': placesApiKey, 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri' },
      next: { revalidate: 43200 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const j = (await res.json()) as {
      displayName?: { text: string }; rating?: number; userRatingCount?: number; googleMapsUri?: string
      reviews?: { rating: number; relativePublishTimeDescription?: string; publishTime?: string; text?: { text: string }; originalText?: { text: string }; authorAttribution?: { displayName: string; uri?: string; photoUri?: string } }[]
    }
    if (!j.rating || !j.userRatingCount) return null
    return {
      name: j.displayName?.text ?? '',
      rating: j.rating,
      count: j.userRatingCount,
      url: j.googleMapsUri,
      reviews: (j.reviews ?? [])
        .filter((r) => (r.text?.text || r.originalText?.text)?.trim())
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? 'Google user',
          authorUrl: r.authorAttribution?.uri,
          photo: r.authorAttribution?.photoUri,
          rating: r.rating,
          when: r.relativePublishTimeDescription ?? '',
          publishTime: r.publishTime,
          text: (r.text?.text || r.originalText?.text || '').trim(),
        })),
    }
  } catch {
    return null
  }
}
