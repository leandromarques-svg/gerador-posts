
import { QuoteData, BookData, JobData, QuoteCategory, BookCategory, INITIAL_QUOTE_DATA, INITIAL_BOOK_DATA, INITIAL_JOB_DATA } from '../types';
import { supabase } from './supabaseClient';
import { SEED_QUOTES, SEED_BOOKS } from '../data/seedData';

// Helper para limpar nome de arquivo
const sanitizeFileName = (name: string) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, '-') // Espaços viram hífens
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove tudo que não for seguro
        .toLowerCase();
};

// --- OTIMIZAÇÃO DE IMAGEM ---
// Redimensiona para no máx 500px de altura (conforme solicitado) e comprime para JPEG 80%
const resizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // CONFIGURAÇÃO DE TAMANHO (Solicitado: Altura Máxima 500px)
                const MAX_HEIGHT = 500;
                const MAX_WIDTH = 1000; // Limite de segurança para largura

                let width = img.width;
                let height = img.height;

                // 1. Redimensionar pela Altura (Prioridade)
                if (height > MAX_HEIGHT) {
                    width = Math.round(width * (MAX_HEIGHT / height));
                    height = MAX_HEIGHT;
                }

                // 2. Se a largura ainda for muito grande (ex: imagem panorâmica), reduz pela largura
                if (width > MAX_WIDTH) {
                    height = Math.round(height * (MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback: retorna original se falhar canvas
                    return;
                }
                
                // Desenha imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Converte para Blob JPEG com qualidade 0.8 (80%)
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Cria novo arquivo com extensão .jpg fixada
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const optimizedFile = new File([blob], newName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(optimizedFile);
                    } else {
                        resolve(file); // Fallback
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => resolve(file); // Fallback em erro de load
        };
        reader.onerror = (err) => resolve(file); // Fallback em erro de leitura
    });
};

// Helper para obter extensão segura
const getFileExtension = (filename: string) => {
    return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg';
};

// Helper INTELIGENTE para escrita no banco
const safeSupabaseWrite = async (table: string, payload: any, id?: string) => {
    const currentPayload = { ...payload };
    
    // Função auxiliar para executar a query
    const executeQuery = async (p: any) => {
        if (id) {
            return await supabase.from(table).update(p).eq('id', id).select().single();
        } else {
            return await supabase.from(table).insert(p).select().single();
        }
    };

    // Tentativa 1: Payload Completo
    let { data, error } = await executeQuery(currentPayload);

    // Verificação de erro específico: Coluna não encontrada
    const isColumnError = error && (
        error.message?.includes('caption') || 
        error.message?.includes('column') || 
        error.message?.includes('schema cache')
    );

    if (isColumnError) {
        console.warn(`[Auto-Fix] A tabela '${table}' não tem a coluna 'caption'. Salvando sem ela.`);
        delete currentPayload.caption;
        const retry = await executeQuery(currentPayload);
        data = retry.data;
        error = retry.error;
    }

    if (error) throw error;
    return data;
};

export const dbService = {
  
  // --- SEED (POPULAR BANCO) ---
  
  seedDatabase: async () => {
      let addedQuotes = 0;
      let addedBooks = 0;

      // 1. Inserir Frases
      for (const q of SEED_QUOTES) {
          const { data } = await supabase.from('quotes').select('id').eq('quote', q.quote).single();
          
          if (!data) {
              const payload = {
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
                  caption: null
              };

              try {
                  await safeSupabaseWrite('quotes', payload);
                  addedQuotes++;
              } catch (e) {
                  console.error("Erro no seed de quotes:", e);
              }
          }
      }

      // 2. Inserir Livros
      for (const b of SEED_BOOKS) {
           const { data } = await supabase.from('books').select('id').eq('book_title', b.bookTitle).single();
           if (!data) {
               const payload = {
                  category: b.category || 'Desenvolvimento',
                  book_title: b.bookTitle,
                  book_author: b.bookAuthor,
                  cover_image: b.coverImage || null,
                  review: b.review || '',
                  social_handle: b.socialHandle || '@metarhconsultoria',
                  footer_logo_url: b.footerLogoUrl || null,
                  caption: null
               };

               try {
                  await safeSupabaseWrite('books', payload);
                  addedBooks++;
               } catch (e) {
                  console.error("Erro no seed de books:", e);
               }
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
            // OTIMIZAÇÃO: Redimensiona e comprime antes de enviar
            const optimizedFile = await resizeImage(imageFile);
            
            // Força a extensão .jpg pois o otimizador converte para jpeg
            const safeName = sanitizeFileName(imageFile.name.split('.')[0]);
            const fileName = `authors/${Date.now()}_${safeName}.jpg`;
            
            const { error: uploadError } = await supabase.storage
                .from('images') 
                .upload(fileName, optimizedFile, { 
                    cacheControl: '3600', 
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                if (uploadError.message.includes('row-level security')) {
                     throw new Error(`ERRO DE PERMISSÃO: O Bucket 'images' no Supabase precisa de uma Policy para permitir INSERT/UPLOAD público.`);
                }
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
        author_image: imageUrl || null, 
        author_image_offset_x: data.authorImageOffset?.x || 0,
        author_image_offset_y: data.authorImageOffset?.y || 0,
        social_handle: data.socialHandle,
        footer_logo_url: data.footerLogoUrl || null,
        website_url: data.websiteUrl,
        caption: data.caption || null
    };

    const result = await safeSupabaseWrite('quotes', dbPayload, data.id);

    return {
        ...data,
        id: result.id,
        authorImage: result.author_image || '',
        authorImageOffset: { x: Number(result.author_image_offset_x), y: Number(result.author_image_offset_y) },
        caption: result.caption || ''
    };
  },

  deleteQuote: async (id: string): Promise<void> => {
     await supabase.from('quotes').delete().eq('id', id);
  },

  getRandomQuote: async (category?: string): Promise<QuoteData | null> => {
    let query = supabase.from('quotes').select('*');
    
    // Se a categoria for passada e NÃO for "Todos", filtra. 
    // Se for "Todos" ou vazia, traz qualquer um.
    if (category && category !== 'Todos') {
        query = query.eq('category', category);
    }
    
    // Traz até 100 itens para escolher um aleatório
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
            // OTIMIZAÇÃO
            const optimizedFile = await resizeImage(coverFile);

            const safeName = sanitizeFileName(coverFile.name.split('.')[0]);
            const fileName = `books/${Date.now()}_${safeName}.jpg`;
            
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, optimizedFile, { 
                    cacheControl: '3600', 
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                if (uploadError.message.includes('row-level security')) {
                     throw new Error(`ERRO DE PERMISSÃO: O Bucket 'images' no Supabase precisa de uma Policy para permitir INSERT/UPLOAD público.`);
                }
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
        cover_image: coverUrl || null,
        review: data.review,
        social_handle: data.socialHandle,
        footer_logo_url: data.footerLogoUrl || null,
        caption: data.caption || null
    };

    const result = await safeSupabaseWrite('books', dbPayload, data.id);

    return { 
        ...data, 
        id: result?.id || data.id, 
        coverImage: result?.cover_image || coverUrl || '',
        caption: result?.caption || ''
    };
  },

  deleteBook: async (id: string): Promise<void> => {
     await supabase.from('books').delete().eq('id', id);
  },

  getRandomBook: async (category?: string): Promise<BookData | null> => {
    let query = supabase.from('books').select('*');
    
    // Lógica para 'Todos'
    if (category && category !== 'Todos') {
        query = query.eq('category', category);
    }
    
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
            // OTIMIZAÇÃO
            const optimizedFile = await resizeImage(imageFile);

            const safeName = sanitizeFileName(imageFile.name.split('.')[0]);
            const fileName = `jobs/${Date.now()}_${safeName}.jpg`;
            
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, optimizedFile, { 
                    cacheControl: '3600', 
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError);
                if (uploadError.message.includes('row-level security')) {
                     throw new Error(`ERRO DE PERMISSÃO: O Bucket 'images' no Supabase precisa de uma Policy para permitir INSERT/UPLOAD público.`);
                }
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
        image_url: imageUrl || null,
        footer_logo_url: data.footerLogoUrl || null,
        website_url: data.websiteUrl,
        caption: data.caption || null
    };

    const result = await safeSupabaseWrite('jobs', dbPayload, data.id);

    return { 
        ...data, 
        id: result?.id || data.id, 
        imageUrl: result?.image_url || imageUrl || '',
        caption: result?.caption || ''
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
