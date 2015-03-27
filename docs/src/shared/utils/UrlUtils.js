import url from 'url';

let baseUrl;

if (typeof window === 'undefined') {
  const port = process.env.PORT || 3000;
  baseUrl = `http://localhost:${port}`;
} else {
  baseUrl = '/';
}

export function siteUrl(to) {
  if (typeof to === 'undefined') return baseUrl;

  return url.resolve(baseUrl, to);
}
