export const tripHref = (t: { type: string; slug: string }) =>
  t.type === 'coastal' ? `/coastal-tours/${t.slug}` : t.type === 'walking' ? `/walking-and-mountain/${t.slug}` : `/safaris/${t.slug}`
export const destinationHref = (slug: string) => `/destinations/${slug}`
