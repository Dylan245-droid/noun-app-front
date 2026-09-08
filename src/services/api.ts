// On the server, we need an absolute URL to fetch data from the backend.
// On the client, we use the proxy (e.g. /api) to avoid CORS issues and properly forward HttpOnly cookies.
export const API_BASE_URL = typeof window === 'undefined'
  ? `${process.env.BACKEND_URL || 'http://127.0.0.1:8031'}/api`
  : process.env.NEXT_PUBLIC_API_URL || '/api';

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

  return response.json();
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
