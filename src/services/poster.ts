// Service to fetch official movie posters from public Wikimedia/Wikipedia API

const cache = new Map<string, string>();

export async function fetchOfficialPoster(title: string, year?: string): Promise<string | null> {
  const cacheKey = `${title.toLowerCase().trim()}_${(year || '').trim()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Check sessionStorage if available
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`poster_${cacheKey}`);
      if (stored) {
        cache.set(cacheKey, stored);
        return stored;
      }
    } catch {}
  }

  const cleanTitle = title
    .replace(/[^\w\s:.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const queries = [
    `${cleanTitle} ${year || ''} film`.trim(),
    `${cleanTitle} film`.trim(),
    cleanTitle
  ];

  for (const query of queries) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=800&pilicense=any&format=json&origin=*`;
      
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      if (data?.query?.pages) {
        const pages = Object.values(data.query.pages) as any[];
        if (pages.length > 0 && pages[0]?.thumbnail?.source) {
          const posterUrl = pages[0].thumbnail.source;
          cache.set(cacheKey, posterUrl);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(`poster_${cacheKey}`, posterUrl);
            } catch {}
          }
          return posterUrl;
        }
      }
    } catch (e) {
      console.warn(`Error fetching poster for query "${query}":`, e);
    }
  }

  // Fallback to Wikipedia summary endpoint
  try {
    const summaryTitle = cleanTitle.replace(/\s+/g, '_');
    const summaryUrls = [
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(summaryTitle + (year ? `_(${year}_film)` : '_(film)'))}`,
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(summaryTitle)}`
    ];

    for (const sUrl of summaryUrls) {
      const resp = await fetch(sUrl);
      if (resp.ok) {
        const sData = await resp.json();
        const posterUrl = sData?.thumbnail?.source || sData?.originalimage?.source;
        if (posterUrl) {
          cache.set(cacheKey, posterUrl);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(`poster_${cacheKey}`, posterUrl);
            } catch {}
          }
          return posterUrl;
        }
      }
    }
  } catch {}

  return null;
}
