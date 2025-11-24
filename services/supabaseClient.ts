
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// ID do projeto extraído: cnwxpqttflndiuqymtmw

const SUPABASE_URL = 'https://cnwxpqttflndiuqymtmw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNud3hwcXR0ZmxuZGl1cXltdG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTUzMzMsImV4cCI6MjA3OTM5MTMzM30.-p59cN_rT2e7c5evmFX6-pdOpRBHJKhlrfF7V8947hk';

// -------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkSupabaseConfig = () => {
    return true;
};

export const checkConnection = async (): Promise<boolean> => {
    try {
        // Tenta fazer uma query leve (apenas o head) para verificar conectividade
        const { error } = await supabase.from('quotes').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("Erro de conexão Supabase:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Erro inesperado Supabase:", e);
        return false;
    }
};
