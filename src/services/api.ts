// On the server, we need an absolute URL to fetch data from the backend.
// On the client, we use the proxy (e.g. /api) to avoid CORS issues and properly forward HttpOnly cookies.
export const API_BASE_URL = typeof window === 'undefined'
  ? `${process.env.BACKEND_URL || 'http://localhost:8031'}/api`
  : process.env.NEXT_PUBLIC_API_URL || '/api';

// DRF absolutises ImageField/FileField URLs via request.build_absolute_uri().
// SSR fetches hit http://backend:8000 directly, so Django bakes the internal
// host into the HTML (mixed content + ERR_NAME_NOT_RESOLVED in the browser).
// Rewrite any such media URL back to a path the /media rewrite can serve.
const INTERNAL_MEDIA_HOSTS = new Set([
  'backend',
  'backend:8000',
  'noun_backend',
  'localhost',
  'localhost:8000',
  'localhost:8031',
  '127.0.0.1',
  '127.0.0.1:8000',
  'nounconcept.com',
  'www.nounconcept.com',
  'api.nounconcept.com',
]);

const normalizeMediaString = (value: string): string => {
  const absolute = value.match(/^(https?:\/\/[^/]+)(\/media\/.*)$/i);
  if (absolute) {
    const host = absolute[1].replace(/^https?:\/\//, '').toLowerCase();
    if (INTERNAL_MEDIA_HOSTS.has(host)) {
      return absolute[2];
    }
    return value;
  }
  if (value.startsWith('media/')) {
    return `/${value}`;
  }
  return value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMediaUrls = (data: unknown): any => {
  if (typeof data === 'string') return normalizeMediaString(data);
  if (Array.isArray(data)) return data.map(normalizeMediaUrls);
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, val]) => [
        key,
        normalizeMediaUrls(val),
      ])
    );
  }
  return data;
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const isFormData = options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    'Accept-Language': 'fr',
  };
  
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Extremely important for HttpOnly cookies
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    throw new Error(errorData.detail || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return normalizeMediaUrls(await response.json());
};

export const publicApi = {
  getProjects: async (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return fetchApi(`/projects/${query}`);
  },
  getProject: async (slug: string) => {
    return fetchApi(`/portfolio/projects/${slug}/`);
  },
  submitContact: async (message: Record<string, unknown>) => {
    return fetchApi('/contact/messages/', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },
  getSeo: async (page: string) => {
    return fetchApi(`/seo/${page}/`, { next: { revalidate: 60 } }).catch(() => null);
  }
};
