import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials are not configured');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
};

/**
 * Génère l'URL publique d'un fichier Supabase
 * @param bucket - Nom du bucket (ex: 'vehicle_medias')
 * @param path - Chemin du fichier dans le bucket
 * @returns URL publique complète du fichier
 */
export const getSupabasePublicUrl = (bucket: string, path: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.warn('Supabase URL is not configured');
    return '';
  }

  // Nettoyer le chemin: enlever les slashes au début et à la fin
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  
  // Format: https://[supabase-url]/storage/v1/object/public/[bucket]/[path]
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
};

/**
 * Vérifie si une URL est une URL Supabase valide
 * @param url - URL à vérifier
 * @returns true si c'est une URL valide
 */
export const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/storage/v1/object/public/') || url.startsWith('http');
};
