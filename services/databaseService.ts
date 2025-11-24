
import { QuoteData, BookData, JobData, QuoteCategory, BookCategory, INITIAL_QUOTE_DATA, INITIAL_BOOK_DATA, INITIAL_JOB_DATA } from '../types';
import { supabase } from './supabaseClient';
import { SEED_QUOTES, SEED_BOOKS } from '../data/seedData';

// Helper para limpar nome de arquivo - Remove acentos e caracteres especiais agressivamente
const sanitizeFileName = (name: string) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, '-') // Espaços viram hífens
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove tudo que não for seguro
        .toLowerCase();
};

// Helper para garantir que authorImageOffset existe ao inserir
const defaultOffset = { x: 0, y: 0 };

export const dbService = {
  
  // --- SEED (POPULAR BANCO) ---
  
  seedDatabase: async () => {
      let addedQuotes = 0;
      let addedBooks = 0;

      // 1. Inserir Frases
      for (const q of SEED_QUOTES) {
          const { data } = await supabase.from('quotes').select('id').eq('quote', q.quote).single();
          
          if (!data) {
              const { error } = await supabase.from('quotes').insert({
                  category: q.category || 'Inspiração',
                  quote: q.quote,
                  author_name: q.authorName,
                  author_role: q.authorRole || 'Autor',
                  author_image: q.authorImage || null,
                  author_image_offset_x: 0,
                  author_image_offset_y: 0,
                  social_handle: q.socialHandle || '@metarhconsultoria',
                  footer_logo_url: q.footerLogoUrl || null,
                  website_url: q.websiteUrl || 'www.metarh.com.br',
                  caption: null // Seed data sem caption específica, deixa gerar auto
              });
              if (!error) addedQuotes++;
          }
      }

      // 2. Inserir Livros
      for (const b of SEED_BOOKS) {
           const { data } = await supabase.from('books').select('id').eq('book_title', b.bookTitle).single();
           if (!data) {
               const { error } = await supabase.from('books').insert({
                  category: b.category || 'Desenvolvimento',
                  book_title: b.bookTitle,
                  book_author: b.bookAuthor,
                  cover_image: b.coverImage || null,
                  review: b.review || '',
                  social_handle: b.socialHandle || '@metarhconsultoria',
                  footer_logo_url: b.footerLogoUrl || null,
                  caption: null
               });
               if (!error) addedBooks++;
           }
      }

      if (addedQuotes === 0 && addedBooks === 0) {
          return "Nenhum item novo adicionado (todos já existiam).";
      }

      return `Sucesso! Adicionados: ${addedQuotes} frases e ${addedBooks} livros.`;
  },

  // --- QUOTES (FRASES) ---

  getQuotes: async (): Promise<QuoteData[]> => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar frases:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      lastDownloaded: item.last_downloaded,
      category: item.category || '',
      socialHandle: item.social_handle || '',
      quote: item.quote || '',
      authorName: item.author_name || '',
      authorRole: item.author_role || '',
      authorImage: item.author_image || '',
      authorImageOffset: { x: Number(item.author_image_offset_x) || 0, y: Number(item.author_image_offset_y) || 0 },
      footerLogoUrl: item.footer_logo_url || '',
      websiteUrl: item.website_url || '',
      caption: item.caption || ''
    }));
  },

  saveQuote: async (data: QuoteData, imageFile?: File): Promise<QuoteData | null> => {
    let imageUrl = data.authorImage;

    if (imageFile) {
        try {
            const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const safeName = sanitizeFileName(imageFile.name.split('.')[0]);
            const fileName = `authors/${Date.now()}_${safeName}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('images') 
                .upload(fileName, imageFile, { 
                    cacheControl: '3600', 
                    upsert: true 
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                throw new Error(`Erro ao subir imagem: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        } catch (err) {
            console.error("Erro fatal no upload:", err);
            throw err;
        }
    }

    const dbPayload = {
        category: data.category,
        quote: data.quote,
        author_name: data.authorName,
        author_role: data.authorRole,
        author_image: imageUrl,
        author_image_offset_x: data.authorImageOffset?.x || 0,
        author_image_offset_y: data.authorImageOffset?.y || 0,
        social_handle: data.socialHandle,
        footer_logo_url: data.footerLogoUrl,
        website_url: data.websiteUrl,
        caption: data.caption
    };

    let result;
    if (data.id) {
        const { data: updated, error } = await supabase.from('quotes').update(dbPayload).eq('id', data.id).select().single();
        if (error) throw error;
        result = updated;
    } else {
        const { data: inserted, error } = await supabase.from('quotes').insert(dbPayload).select().single();
        if (error) throw error;
        result = inserted;
    }

    return {
        ...data,
        id: result.id,
        authorImage: result.author_image,
        authorImageOffset: { x: Number(result.author_image_offset_x), y: Number(result.author_image_offset_y) },
        caption: result.caption
    };
  },

  deleteQuote: async (id: string): Promise<void> => {
     await supabase.from('quotes').delete().eq('id', id);
  },

  getRandomQuote: async (category?: QuoteCategory): Promise<QuoteData | null> => {
    let query = supabase.from('quotes').select('*');
    if (category) query = query.eq('category', category);
    
    // Random trick for PostgreSQL/Supabase often requires Extensions or fetching logic
    // Simplified: fetch random limit
    const { data, error } = await query.limit(100);
    
    if (error || !data || data.length === 0) return null;
    const item = data[Math.floor(Math.random() * data.length)];
    
    return {
      id: item.id,
      lastDownloaded: item.last_downloaded,
      category: item.category || '',
      socialHandle: item.social_handle || '',
      quote: item.quote || '',
      authorName: item.author_name || '',
      authorRole: item.author_role || '',
      authorImage: item.author_image || '',
      authorImageOffset: { x: Number(item.author_image_offset_x) || 0, y: Number(item.author_image_offset_y) || 0 },
      footerLogoUrl: item.footer_logo_url || '',
      websiteUrl: item.website_url || '',
      caption: item.caption || ''
    };
  },

  // --- BOOKS (LIVROS) ---

  getBooks: async (): Promise<BookData[]> => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];

    return data.map((item: any) => ({
        id: item.id,
        lastDownloaded: item.last_downloaded,
        category: item.category || '',
        bookTitle: item.book_title || '',
        bookAuthor: item.book_author || '',
        coverImage: item.cover_image || '',
        review: item.review || '',
        socialHandle: item.social_handle || '',
        footerLogoUrl: item.footer_logo_url || '',
        caption: item.caption || ''
    }));
  },

  saveBook: async (data: BookData, coverFile?: File): Promise<BookData | null> => {
    let coverUrl = data.coverImage;

    if (coverFile) {
        try {
            const fileExt = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const safeName = sanitizeFileName(coverFile.name.split('.')[0]);
            const fileName = `books/${Date.now()}_${safeName}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, coverFile, { 
                    cacheControl: '3600', 
                    upsert: true 
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                throw new Error(`Erro ao subir imagem: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            coverUrl = publicUrlData.publicUrl;
        } catch (err) {
            console.error("Erro fatal no upload:", err);
            throw err;
        }
    }

    const dbPayload = {
        category: data.category,
        book_title: data.bookTitle,
        book_author: data.bookAuthor,
        cover_image: coverUrl,
        review: data.review,
        social_handle: data.socialHandle,
        footer_logo_url: data.footerLogoUrl,
        caption: data.caption
    };

    let result;
    if (data.id) {
        const { data: updated, error } = await supabase.from('books').update(dbPayload).eq('id', data.id).select().single();
        if (error) throw error;
        result = updated;
    } else {
        const { data: inserted, error } = await supabase.from('books').insert(dbPayload).select().single();
        if (error) throw error;
        result = inserted;
    }

    // Retorna dados atualizados, fallback para os dados de entrada se a resposta do DB for parcial
    return { 
        ...data, 
        id: result?.id || data.id, 
        coverImage: result?.cover_image || coverUrl,
        caption: result?.caption
    };
  },

  deleteBook: async (id: string): Promise<void> => {
     await supabase.from('books').delete().eq('id', id);
  },

  getRandomBook: async (category?: BookCategory): Promise<BookData | null> => {
    let query = supabase.from('books').select('*');
    if (category) query = query.eq('category', category);
    
    const { data, error } = await query.limit(100);
    
    if (error || !data || data.length === 0) return null;
    const item = data[Math.floor(Math.random() * data.length)];
    return {
        id: item.id,
        lastDownloaded: item.last_downloaded,
        category: item.category || '',
        bookTitle: item.book_title || '',
        bookAuthor: item.book_author || '',
        coverImage: item.cover_image || '',
        review: item.review || '',
        socialHandle: item.social_handle || '',
        footerLogoUrl: item.footer_logo_url || '',
        caption: item.caption || ''
    };
  },

  // --- JOBS (VAGAS) ---

  getJobs: async (): Promise<JobData[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];

    return data.map((item: any) => ({
        id: item.id,
        lastDownloaded: item.last_downloaded,
        jobTitle: item.job_title || '',
        tagline: item.tagline || '',
        sector: item.sector || '',
        jobCode: item.job_code || '',
        contractType: item.contract_type || '',
        modality: item.modality || '',
        location: item.location || '',
        imageUrl: item.image_url || '',
        footerLogoUrl: item.footer_logo_url || '',
        websiteUrl: item.website_url || '',
        caption: item.caption || ''
    }));
  },

  saveJob: async (data: JobData, imageFile?: File): Promise<JobData | null> => {
    let imageUrl = data.imageUrl;

    if (imageFile) {
        try {
            const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const safeName = sanitizeFileName(imageFile.name.split('.')[0]);
            const fileName = `jobs/${Date.now()}_${safeName}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, imageFile, { 
                    cacheControl: '3600', 
                    upsert: true 
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                throw new Error(`Erro ao subir imagem: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        } catch (err) {
            console.error("Erro fatal no upload:", err);
            throw err;
        }
    }

    const dbPayload = {
        job_title: data.jobTitle,
        tagline: data.tagline,
        sector: data.sector,
        job_code: data.jobCode,
        contract_type: data.contractType,
        modality: data.modality,
        location: data.location,
        image_url: imageUrl,
        footer_logo_url: data.footerLogoUrl,
        website_url: data.websiteUrl,
        caption: data.caption
    };

    let result;
    if (data.id) {
        const { data: updated, error } = await supabase.from('jobs').update(dbPayload).eq('id', data.id).select().single();
        if (error) throw error;
        result = updated;
    } else {
        const { data: inserted, error } = await supabase.from('jobs').insert(dbPayload).select().single();
        if (error) throw error;
        result = inserted;
    }

    return { 
        ...data, 
        id: result?.id || data.id, 
        imageUrl: result?.image_url || imageUrl,
        caption: result?.caption
    };
  },

  deleteJob: async (id: string): Promise<void> => {
     await supabase.from('jobs').delete().eq('id', id);
  },

  markAsDownloaded: async (id: string, type: 'quote' | 'book' | 'job') => {
      let table = 'quotes';
      if (type === 'book') table = 'books';
      if (type === 'job') table = 'jobs';

      await supabase
        .from(table)
        .update({ last_downloaded: new Date().toISOString() })
        .eq('id', id);
  }
};