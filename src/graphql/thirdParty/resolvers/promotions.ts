import type { Resolver } from '@faststore/api';

const DEFAULT_API_HOST = 'https://api.azu.synerise.com';

// Helper function to authenticate and get token
const authenticate = async (apiHost: string, apiKey: string): Promise<string> => {
  const url = `${apiHost.replace(/\/$/, '')}/uauth/v2/auth/login/profile`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  
  if (!res.ok) {
    throw new Error(`Authentication failed: ${res.status}`);
  }
  
  const json = await res.json();
  const token = json?.data?.token ?? json?.token ?? json?.accessToken;
  
  if (!token) {
    throw new Error('No token received from authentication');
  }
  
  return token;
};

// Helper function to fetch promotions
const getPromotions = async (
  apiHost: string,
  authToken: string,
  clientUUID: string
): Promise<{ data: any[] }> => {
  const url = `${apiHost.replace(/\/$/, '')}/v4/promotions/v2/promotion/get-for-client/uuid/${clientUUID}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch promotions: ${res.status}`);
  }
  
  const json = await res.json();
  return { data: json?.data ?? [] };
};

const SynerisePromotionsResult: Record<string, Resolver<any, any>> = {
  promotions: async (root, { clientUUID }, _ctx) => {
    const apiHost = root.apiHost ?? DEFAULT_API_HOST;
    const apiKey = root.apiKey;
    
    // Authenticate first to get token
    const authToken = await authenticate(apiHost, apiKey);
    
    // Use token to fetch promotions
    const result = await getPromotions(apiHost, authToken, clientUUID);
    
    return result;
  },
};

const Query = {
  synerisePromotions: (
    _root: unknown,
    { apiHost, apiKey }: { apiHost?: string; apiKey: string },
    _ctx: any
  ) => {
    return { 
      apiHost: apiHost ?? DEFAULT_API_HOST,
      apiKey,
    };
  },
};

export default {
  Query,
  SynerisePromotionsResult,
};