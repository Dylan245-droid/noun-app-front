import { fetchApi } from './api';

export const physicsApi = {
  getScenes: async () => fetchApi('/physics/scenes/'),
  getScene: async (slug: string) => fetchApi(`/physics/scenes/${slug}/`),
  getBuildings: async () => fetchApi('/physics/buildings/'),
  getBuilding: async (id: string) => fetchApi(`/physics/buildings/${id}/`),
  createBuilding: async (data: Record<string, unknown>) =>
    fetchApi('/physics/buildings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBuilding: async (id: string, data: Record<string, unknown>) =>
    fetchApi(`/physics/buildings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteBuilding: async (id: string) =>
    fetchApi(`/physics/buildings/${id}/`, { method: 'DELETE' }),
  simulateBuilding: async (id: string, durationSeconds = 3) =>
    fetchApi(`/physics/buildings/${id}/simulate-all/`, {
      method: 'POST',
      body: JSON.stringify({ duration_seconds: durationSeconds }),
    }),
  createScene: async (data: Record<string, unknown>) =>
    fetchApi('/physics/scenes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateScene: async (slug: string, data: Record<string, unknown>) =>
    fetchApi(`/physics/scenes/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteScene: async (slug: string) =>
    fetchApi(`/physics/scenes/${slug}/`, { method: 'DELETE' }),

  getFurniture: async () => fetchApi('/physics/furniture/'),
  getFurnitureItem: async (slug: string) => fetchApi(`/physics/furniture/${slug}/`),
  createFurniture: async (data: Record<string, unknown> | FormData) =>
    fetchApi('/physics/furniture/', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateFurniture: async (slug: string, data: Record<string, unknown> | FormData) =>
    fetchApi(`/physics/furniture/${slug}/`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteFurniture: async (slug: string) =>
    fetchApi(`/physics/furniture/${slug}/`, { method: 'DELETE' }),
  computeDimensions: async (slug: string) =>
    fetchApi(`/physics/furniture/${slug}/compute-dimensions/`, { method: 'POST' }),

  getObjects: async (sceneId?: string) => {
    const query = sceneId ? `?scene=${sceneId}` : '';
    return fetchApi(`/physics/objects/${query}`);
  },
  createObject: async (data: Record<string, unknown>) =>
    fetchApi('/physics/objects/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateObject: async (id: string, data: Record<string, unknown>) =>
    fetchApi(`/physics/objects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteObject: async (id: string) =>
    fetchApi(`/physics/objects/${id}/`, { method: 'DELETE' }),

  getSimulations: async () => fetchApi('/physics/simulations/'),
  getSimulation: async (id: string) => fetchApi(`/physics/simulations/${id}/`),
  deleteSimulation: async (id: string) =>
    fetchApi(`/physics/simulations/${id}/`, { method: 'DELETE' }),
  getSimulationStatus: async (id: string) =>
    fetchApi(`/physics/simulations/${id}/status/`),
  getSimulationFrames: async (simulationId: string) =>
    fetchApi(`/physics/frames/?simulation=${simulationId}`),
  runSimulation: async (id: string) =>
    fetchApi(`/physics/simulations/${id}/simulate/`, { method: 'POST' }),
  runDemo: async (sceneSlug: string) =>
    fetchApi(`/physics/scenes/${sceneSlug}/demo/`, { method: 'POST' }),
  quickDemo: async () =>
    fetchApi('/physics/scenes/quick-demo/', { method: 'POST' }),
  runScene: async (sceneSlug: string, durationSeconds = 5) =>
    fetchApi(`/physics/scenes/${sceneSlug}/run/`, {
      method: 'POST',
      body: JSON.stringify({ duration_seconds: durationSeconds }),
    }),
  quickRun: async (durationSeconds = 5) =>
    fetchApi('/physics/scenes/quick-run/', {
      method: 'POST',
      body: JSON.stringify({ duration_seconds: durationSeconds }),
    }),

  getShares: async () => fetchApi('/physics/shares/'),
  createShare: async (data: Record<string, unknown>) =>
    fetchApi('/physics/shares/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteShare: async (id: number) =>
    fetchApi(`/physics/shares/${id}/`, { method: 'DELETE' }),
  getShare: async (token: string) => fetchApi(`/physics/share/${token}/`),
  getProjectViewer: async (slug: string) =>
    fetchApi(`/physics/projects/${slug}/viewer/`),
  publicSimulate: async (payload: Record<string, unknown>) =>
    fetchApi('/physics/public/simulate/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTemplates: async () => fetchApi('/physics/templates/'),
  getMaterials: async (kind?: string) =>
    fetchApi(`/physics/materials/${kind ? `?kind=${kind}` : ''}`),
  createOpening: async (data: Record<string, unknown>) =>
    fetchApi('/physics/openings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteOpening: async (id: number) =>
    fetchApi(`/physics/openings/${id}/`, { method: 'DELETE' }),
  submitProject: async (payload: Record<string, unknown>) =>
    fetchApi('/physics/public/projects/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
