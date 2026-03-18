const API_BASE = '/api';

export const api = {
  async getProfile(userId = 'usr_01') {
    const res = await fetch(`${API_BASE}/profile/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    const json = await res.json();
    return json.data;
  },

  async assessProfile(inputs) {
    const res = await fetch(`${API_BASE}/profile/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    if (!res.ok) throw new Error('Failed to assess profile');
    const json = await res.json();
    return json.data;
  },

  async getRecommendations(userId = 'usr_01', categoryId = null) {
    const url = categoryId
      ? `${API_BASE}/recommendations/${userId}?category_id=${categoryId}`
      : `${API_BASE}/recommendations/${userId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const json = await res.json();
    return json.data;
  },

  async getSectorBreakdown(categoryId) {
    const res = await fetch(`${API_BASE}/sectors/breakdown/${categoryId}`);
    if (!res.ok) throw new Error('Failed to fetch sector breakdown');
    const json = await res.json();
    return json.data;
  },

  async runSlide14Query(categoryId = 'cat_long') {
    const res = await fetch(`${API_BASE}/sql/slide14-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to execute Slide 14 query');
    return json;
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch risk categories');
    const json = await res.json();
    return json.data;
  },

  async getAssets() {
    const res = await fetch(`${API_BASE}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    const json = await res.json();
    return json.data;
  },

  async getPortfolio(userId = 'usr_01') {
    const res = await fetch(`${API_BASE}/portfolio/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    const json = await res.json();
    return json.data;
  },

  async getRebalance(userId = 'usr_01') {
    const res = await fetch(`${API_BASE}/portfolio/${userId}/rebalance`);
    if (!res.ok) throw new Error('Failed to fetch rebalance analysis');
    const json = await res.json();
    return json.data;
  },

  async simulateGrowth(initialPrincipal, monthlySip, years, baseCagrPct) {
    const res = await fetch(`${API_BASE}/simulation/growth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialPrincipal, monthlySip, years, baseCagrPct })
    });
    if (!res.ok) throw new Error('Failed to simulate compound growth');
    const json = await res.json();
    return json.data;
  },

  async getSchemaInspector() {
    const res = await fetch(`${API_BASE}/schema/inspector`);
    if (!res.ok) throw new Error('Failed to fetch schema inspector');
    const json = await res.json();
    return json.data;
  }
};
