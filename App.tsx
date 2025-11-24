
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Upload, Layout, Quote, BookOpen, Briefcase, Image as ImageIcon, X, Database, Shuffle, Save, Trash2, Copy, CheckCircle, Clock, Loader2, RefreshCw, Wifi, WifiOff, CloudUpload, Settings, Filter } from 'lucide-react';
import { QuoteCard } from './components/QuoteCard';
import { BookCard } from './components/BookCard';
import { JobCard } from './components/JobCard';
import { AdminDashboard } from './components/AdminDashboard';
import { QuoteData, BookData, JobData, INITIAL_QUOTE_DATA, INITIAL_BOOK_DATA, INITIAL_JOB_DATA, QUOTE_CATEGORIES, BOOK_CATEGORIES, QuoteCategory, BookCategory } from './types';
import { dbService } from './services/databaseService';
import { checkSupabaseConfig, checkConnection } from './services/supabaseClient';

const PREVIEW_SCALE = 0.45;

type AppMode = 'quote' | 'book' | 'job';

export default function App() {
  const [mode, setMode] = useState<AppMode>('quote');
  
  const [quoteData, setQuoteData] = useState<QuoteData>(INITIAL_QUOTE_DATA);
  const [bookData, setBookData] = useState<BookData>(INITIAL_BOOK_DATA);
  const [jobData, setJobData] = useState<JobData>(INITIAL_JOB_DATA);
  
  // Estados para arquivos selecionados (para upload)
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = checking, true = connected, false = error
  
  // Estado para a Legenda Editável
  const [captionText, setCaptionText] = useState('');
  
  // Ref para controlar se devemos pular a geração automática de legenda
  // Isso é necessário quando carregamos uma legenda salva do banco
  const skipCaptionGeneration = useRef(false);

  const quoteCardRef = useRef<HTMLDivElement>(null);
  const bookCardRef = useRef<HTMLDivElement>(null);
  const jobCardRef = useRef<HTMLDivElement>(null);
  
  const quoteImageInputRef = useRef<HTMLInputElement>(null);
  const bookCoverInputRef = useRef<HTMLInputElement>(null);
  const jobImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const init = async () => {
        checkSupabaseConfig();
        const connected = await checkConnection();
        setIsConnected(connected);
      };
      init();
  }, []);

  // Atualiza o texto da legenda automaticamente quando os dados mudam
  useEffect(() => {
      if (skipCaptionGeneration.current) {
          skipCaptionGeneration.current = false;
          return;
      }
      setCaptionText(generateCaptionText());
  }, [mode, quoteData, bookData, jobData]);

  const showFeedback = (msg: string) => {
      setFeedbackMsg(msg);
      setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const generateCaptionText = () => {
      if (mode === 'quote') {
          return `✨ Dose diária de ${quoteData.category === 'Todos' ? 'Inspiração' : quoteData.category.toLowerCase()} para você!\n\n"${quoteData.quote.replace(/\*/g, '')}"\n— ${quoteData.authorName}\n\nO que essa frase desperta em você hoje? Conta pra gente nos comentários! 👇\n\n#METARH #DesenvolvimentoHumano #${quoteData.category !== 'Todos' ? quoteData.category.replace(/\s+/g, '') : 'Inspiração'} #Inspiração`;
      } else if (mode === 'book') {
          return `📚 Dica de Leitura: ${bookData.bookTitle}\n\n${bookData.review.replace(/\*/g, '')}\n\nUma obra incrível de ${bookData.bookAuthor} para quem busca evoluir em ${bookData.category === 'Todos' ? 'Desenvolvimento' : bookData.category}.\n\nVocê já leu ou tem vontade de ler esse livro? 🤓\n\n#METARH #DicaDeLeitura #${bookData.category !== 'Todos' ? bookData.category.replace(/\s+/g, '') : 'Leitura'} #Conhecimento`;
      } else {
          return `🚀 Oportunidade na METARH!\n\nEstamos buscando: ${jobData.jobTitle}\n\n🔹 Local: ${jobData.location}\n🔹 Modelo: ${jobData.modality} | ${jobData.contractType}\n\n💡 ${jobData.tagline}\n\nSe você se identifica com nosso propósito, venha fazer parte do time! \n\n👉 Candidate-se em: ${jobData.websiteUrl}\nOu clique no link da bio!\n\n#Vagas #Oportunidade #${jobData.sector.replace(/\s+/g, '')} #METARH #Carreira`;
      }
  };

  const handleCopyCaption = () => {
      navigator.clipboard.writeText(captionText);
      showFeedback('Legenda copiada!');
  };

  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuoteImageDrag = useCallback((deltaX: number, deltaY: number) => {
    setQuoteData(prev => ({
        ...prev,
        authorImageOffset: {
            x: (prev.authorImageOffset?.x || 0) + deltaX,
            y: (prev.authorImageOffset?.y || 0) + deltaY
        }
    }));
  }, []);

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: AppMode) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      if (type === 'quote') {
          setQuoteFile(file);
          setQuoteData(prev => ({ ...prev, authorImage: objectUrl }));
      } else if (type === 'book') {
          setBookFile(file);
          setBookData(prev => ({ ...prev, coverImage: objectUrl }));
      } else {
          setJobFile(file);
          setJobData(prev => ({ ...prev, imageUrl: objectUrl }));
      }
    }
  };

  const handleDownload = useCallback(async () => {
    let targetRef: HTMLElement | null = null;
    let filename = '';
    let currentId: string | undefined;

    if (mode === 'quote') {
        targetRef = quoteCardRef.current;
        filename = `METARH-frase.png`;
        currentId = quoteData.id;
    } else if (mode === 'book') {
        targetRef = bookCardRef.current;
        filename = `METARH-livro-${bookData.bookTitle.slice(0, 10)}.png`;
        currentId = bookData.id;
    } else {
        targetRef = jobCardRef.current;
        filename = `METARH-vaga-${jobData.jobCode}.png`;
        currentId = jobData.id;
    }

    if (!targetRef) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(targetRef, { 
          quality: 1.0,
          width: 1080,
          height: 1350,
          pixelRatio: 1,
          cacheBust: true, 
          style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      if (currentId) {
          await dbService.markAsDownloaded(currentId, mode);
          showFeedback('Baixado e atualizado!');
      }

    } catch (err) {
      console.error('Falha ao gerar imagem', err);
      alert('Erro ao baixar a imagem. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  }, [mode, bookData, quoteData, jobData]);

  const generateRandom = async () => {
    setIsLoadingRandom(true);
    try {
        if (mode === 'quote') {
            const randomQuote = await dbService.getRandomQuote(quoteData.category === 'Todos' ? undefined : quoteData.category);
            if (randomQuote) {
                // Ao carregar do banco, verificamos se tem legenda salva
                if (randomQuote.caption) {
                    skipCaptionGeneration.current = true;
                    setCaptionText(randomQuote.caption);
                }
                setQuoteData(prev => ({ ...prev, ...randomQuote }));
                setQuoteFile(null);
                showFeedback(`Frase carregada!`);
            } else alert('Nenhuma frase encontrada no Banco.');
        } else if (mode === 'book') {
            const randomBook = await dbService.getRandomBook(bookData.category === 'Todos' ? undefined : bookData.category);
            if (randomBook) {
                if (randomBook.caption) {
                    skipCaptionGeneration.current = true;
                    setCaptionText(randomBook.caption);
                }
                setBookData(prev => ({ ...prev, ...randomBook }));
                setBookFile(null);
                showFeedback(`Dica carregada!`);
            } else alert('Nenhum livro encontrado no Banco.');
        } else {
             alert('Geração aleatória de vagas não implementada (use a Biblioteca).');
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao conectar ao banco de dados.");
    } finally {
        setIsLoadingRandom(false);
    }
  };

  const saveToLibrary = async () => {
    setIsSaving(true);
    try {
        if (mode === 'quote') {
            // Inclui a legenda atual no objeto salvo
            const payload = { ...quoteData, caption: captionText };
            const saved = await dbService.saveQuote(payload, quoteFile || undefined);
            if (saved) {
                setQuoteData(saved);
                setQuoteFile(null);
                showFeedback('Frase e legenda salvas!');
            }
        } else if (mode === 'book') {
            const payload = { ...bookData, caption: captionText };
            const saved = await dbService.saveBook(payload, bookFile || undefined);
            if (saved) {
                setBookData(saved);
                setBookFile(null);
                showFeedback('Livro e legenda salvos!');
            }
        } else {
            const payload = { ...jobData, caption: captionText };
            const saved = await dbService.saveJob(payload, jobFile || undefined);
            if (saved) {
                setJobData(saved);
                setJobFile(null);
                showFeedback('Vaga e legenda salvas!');
            }
        }
    } catch (error: any) {
        console.error(error);
        alert(`Erro ao salvar: ${error.message || 'Verifique se o Bucket "images" foi criado no Supabase e tem permissões públicas.'}`);
    } finally {
        setIsSaving(false);
    }
  };

  const inputClass = "w-full px-5 h-[54px] bg-gray-50 border border-gray-200 rounded-[2rem] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none text-sm font-medium text-gray-700 transition-all placeholder-gray-400 flex items-center";
  const textAreaClass = "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[2rem] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none text-sm font-medium text-gray-700 transition-all placeholder-gray-400 min-h-[120px] resize-none";
  const selectClass = "w-full px-5 h-[54px] bg-gray-50 border border-gray-200 rounded-[2rem] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none text-sm font-medium text-gray-700 transition-all cursor-pointer appearance-none";

  const getActiveColor = () => {
    if (mode === 'quote') return 'bg-brand-pink';
    if (mode === 'book') return 'bg-indigo-600';
    return 'bg-purple-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row font-sans">
      
      {/* Sidebar - Controls */}
      <div className="w-full lg:w-[420px] bg-white shadow-xl flex flex-col h-screen border-r border-gray-200 z-20 relative">
        
        {/* Header & Menu */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center">
                <h1 className="font-condensed font-bold text-3xl text-brand-purple flex items-center gap-2">
                    <Layout className="w-7 h-7 text-brand-pink" />
                    Criador de Posts
                </h1>

                <div className="flex items-center gap-2">
                    {/* Botão Admin */}
                    <button 
                        onClick={() => setShowAdmin(true)}
                        disabled={!isConnected}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-brand-purple transition"
                        title="Administrar Banco de Dados"
                    >
                        <Settings size={20} />
                    </button>
                    
                    {/* Connection Status Indicator - VISIBLE PILL */}
                    <div 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors
                            ${isConnected === true ? 'bg-green-50 border-green-200 text-green-700' : 
                            isConnected === false ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                        title={isConnected ? "Conectado ao Supabase" : "Desconectado"}
                    >
                        <div className={`w-2 h-2 rounded-full ${isConnected === true ? 'bg-green-500 animate-pulse' : isConnected === false ? 'bg-red-500' : 'bg-gray-400'}`} />
                        {isConnected === true ? 'On' : 'Off'}
                    </div>
                </div>
              </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex bg-gray-100 p-1 rounded-full mb-4">
             <button 
                onClick={() => setMode('quote')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'quote' ? 'bg-white text-brand-pink shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <Quote size={14} /> Frase
             </button>
             <button 
                onClick={() => setMode('book')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'book' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <BookOpen size={14} /> Livro
             </button>
             <button 
                onClick={() => setMode('job')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mode === 'job' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <Briefcase size={14} /> Vaga
             </button>
          </div>

          {/* Generator Controls */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
             {/* Main Controls Row */}
             <div className="flex flex-col gap-3">
                 {mode !== 'job' && (
                    <div className="relative">
                        <select 
                            name="category" 
                            value={mode === 'quote' ? quoteData.category : bookData.category}
                            onChange={(e) => mode === 'quote' ? setQuoteData(p => ({...p, category: e.target.value as any})) : setBookData(p => ({...p, category: e.target.value as any}))}
                            className={selectClass}
                        >
                            <option value="Todos">Todos (Qualquer Categoria)</option>
                            {mode === 'quote' 
                            ? QUOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                            : BOOK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                            }
                        </select>
                    </div>
                 )}
                 
                 <div className="flex gap-2">
                     {mode !== 'job' && (
                        <button 
                            onClick={generateRandom}
                            disabled={isLoadingRandom || !isConnected}
                            className="flex-1 flex items-center justify-center gap-2 bg-brand-purple text-white py-3 rounded-xl text-xs font-bold uppercase hover:bg-purple-900 transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!isConnected ? "Conecte-se ao banco para usar" : ""}
                        >
                            {isLoadingRandom ? <Loader2 className="animate-spin w-4 h-4" /> : <Shuffle size={14} />}
                            Aleatório
                        </button>
                     )}
                     
                     <button 
                        onClick={() => setShowLibrary(true)}
                        disabled={!isConnected}
                        className="flex-1 flex items-center justify-center bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-xs font-bold uppercase gap-2 disabled:opacity-50"
                     >
                         <Database size={14} /> Biblioteca
                     </button>
                 </div>
             </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Feedback Toast */}
          {feedbackMsg && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg z-50 font-bold text-sm animate-bounce flex items-center gap-2">
                  <CheckCircle size={16} /> {feedbackMsg}
              </div>
          )}

          {/* --- QUOTE FORM --- */}
          {mode === 'quote' && (
             <>
                <section>
                    <h3 className="flex items-center gap-2 text-brand-pink font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <Quote className="w-5 h-5" /> Conteúdo
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-1 px-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase">A Frase</label>
                                <span className="text-[10px] text-brand-pink font-bold bg-pink-50 px-2 py-1 rounded-full">Use * para negrito</span>
                            </div>
                            <textarea name="quote" value={quoteData.quote} onChange={handleQuoteChange} className={textAreaClass} placeholder="Digite a frase..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Nome do Autor</label>
                            <input type="text" name="authorName" value={quoteData.authorName} onChange={handleQuoteChange} className={inputClass} />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="flex items-center gap-2 text-brand-pink font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <ImageIcon className="w-5 h-5" /> Foto do Autor
                    </h3>
                    <div 
                        className={`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center cursor-pointer transition group bg-white mb-2
                            ${quoteFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-pink-50 hover:border-brand-pink'}`}
                        onClick={() => quoteImageInputRef.current?.click()}
                    >
                        <Upload className={`w-8 h-8 mb-2 transition-colors ${quoteFile ? 'text-green-600' : 'text-gray-300 group-hover:text-brand-pink'}`} />
                        <span className={`text-sm font-medium ${quoteFile ? 'text-green-700' : 'text-gray-600 group-hover:text-brand-pink'}`}>
                            {quoteFile ? 'Nova foto selecionada' : 'Carregar foto'}
                        </span>
                        <input ref={quoteImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'quote')} />
                    </div>
                </section>
             </>
          )}

          {/* --- BOOK FORM --- */}
          {mode === 'book' && (
             <>
                <section>
                    <h3 className="flex items-center gap-2 text-indigo-600 font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <BookOpen className="w-5 h-5" /> Conteúdo
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Título</label>
                            <input type="text" name="bookTitle" value={bookData.bookTitle} onChange={handleBookChange} className={inputClass} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Autor</label>
                            <input type="text" name="bookAuthor" value={bookData.bookAuthor} onChange={handleBookChange} className={inputClass} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 px-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Review</label>
                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-full">Use * para negrito</span>
                            </div>
                            <textarea name="review" value={bookData.review} onChange={handleBookChange} className={textAreaClass} placeholder="Review..." />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="flex items-center gap-2 text-indigo-600 font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <ImageIcon className="w-5 h-5" /> Capa
                    </h3>
                    <div 
                        className={`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center cursor-pointer transition group bg-white mb-2
                             ${bookFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-indigo-50 hover:border-indigo-500'}`}
                        onClick={() => bookCoverInputRef.current?.click()}
                    >
                        <Upload className={`w-8 h-8 mb-2 transition-colors ${bookFile ? 'text-green-600' : 'text-gray-300 group-hover:text-indigo-600'}`} />
                        <span className={`text-sm font-medium ${bookFile ? 'text-green-700' : 'text-gray-600 group-hover:text-indigo-600'}`}>
                            {bookFile ? 'Nova capa selecionada' : 'Carregar Capa'}
                        </span>
                        <input ref={bookCoverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'book')} />
                    </div>
                </section>
             </>
          )}

          {/* --- JOB FORM --- */}
          {mode === 'job' && (
             <>
                <section>
                    <h3 className="flex items-center gap-2 text-purple-600 font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <Briefcase className="w-5 h-5" /> Detalhes da Vaga
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Nome da Vaga</label>
                            <input type="text" name="jobTitle" value={jobData.jobTitle} onChange={handleJobChange} className={inputClass} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Tagline (Frase de Efeito)</label>
                            <input type="text" name="tagline" value={jobData.tagline} onChange={handleJobChange} className={inputClass} />
                        </div>
                        <div className="flex gap-3">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Setor</label>
                                <input type="text" name="sector" value={jobData.sector} onChange={handleJobChange} className={inputClass} />
                            </div>
                             <div className="w-1/3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Código</label>
                                <input type="text" name="jobCode" value={jobData.jobCode} onChange={handleJobChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Contrato</label>
                                <input type="text" name="contractType" value={jobData.contractType} onChange={handleJobChange} className={inputClass} />
                            </div>
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Modalidade</label>
                                <input type="text" name="modality" value={jobData.modality} onChange={handleJobChange} className={inputClass} />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 px-3">Localização</label>
                            <input type="text" name="location" value={jobData.location} onChange={handleJobChange} className={inputClass} />
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="flex items-center gap-2 text-purple-600 font-condensed font-bold text-xl uppercase mb-5 border-b border-gray-100 pb-2">
                        <ImageIcon className="w-5 h-5" /> Imagem da Vaga
                    </h3>
                    <div 
                        className={`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center cursor-pointer transition group bg-white mb-2
                             ${jobFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-purple-50 hover:border-purple-500'}`}
                        onClick={() => jobImageInputRef.current?.click()}
                    >
                        <Upload className={`w-8 h-8 mb-2 transition-colors ${jobFile ? 'text-green-600' : 'text-gray-300 group-hover:text-purple-600'}`} />
                        <span className={`text-sm font-medium ${jobFile ? 'text-green-700' : 'text-gray-600 group-hover:text-purple-600'}`}>
                            {jobFile ? 'Nova imagem selecionada' : 'Carregar Imagem'}
                        </span>
                        <input ref={jobImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'job')} />
                    </div>
                </section>
             </>
          )}

           {/* --- CAPTION GENERATOR (EDITABLE) --- */}
           <section className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
               <div className="flex items-center justify-between mb-3">
                   <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                       <Quote size={14} /> Legenda (Editável e Salva)
                   </h3>
                   <button onClick={handleCopyCaption} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600 hover:text-brand-purple hover:border-brand-purple transition flex items-center gap-1">
                       <Copy size={12} /> Copiar
                   </button>
               </div>
               <textarea 
                   className="w-full bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600 italic resize-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                   rows={6}
                   value={captionText}
                   onChange={(e) => setCaptionText(e.target.value)}
                   placeholder="A legenda será gerada automaticamente ou carregada do banco de dados..."
               />
           </section>

        </div>

        {/* Sidebar Footer */}
        <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] space-y-3">
             <div className="flex gap-3">
                <button
                    onClick={saveToLibrary}
                    disabled={isSaving || !isConnected}
                    className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-condensed font-bold uppercase text-lg py-4 rounded-[2rem] shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`flex-[2] text-white font-condensed font-bold uppercase text-lg py-4 rounded-[2rem] shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${getActiveColor()} hover:opacity-90`}
                >
                    {isDownloading ? <span className="animate-pulse">...</span> : <><Download className="w-5 h-5" /> Baixar</>}
                </button>
             </div>
        </div>
      </div>

      {/* Main Live Preview Area */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 overflow-auto items-center justify-center p-8 relative">
        <div 
            className="relative shadow-2xl bg-white shrink-0" 
            style={{ 
                width: `${1080 * PREVIEW_SCALE}px`, 
                height: `${1350 * PREVIEW_SCALE}px` 
            }}
        >
            <div className={mode === 'quote' ? 'block' : 'hidden'}>
                <QuoteCard ref={quoteCardRef} data={quoteData} scale={PREVIEW_SCALE} onImageDrag={handleQuoteImageDrag} />
            </div>
            <div className={mode === 'book' ? 'block' : 'hidden'}>
                <BookCard ref={bookCardRef} data={bookData} scale={PREVIEW_SCALE} />
            </div>
            <div className={mode === 'job' ? 'block' : 'hidden'}>
                <JobCard ref={jobCardRef} data={jobData} scale={PREVIEW_SCALE} />
            </div>
        </div>
        
        {/* Admin Dashboard Overlay */}
        {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      </div>

      {/* Library Modal */}
      {showLibrary && (
          <LibraryModal 
            mode={mode} 
            onClose={() => setShowLibrary(false)} 
            onSelect={(data) => {
                // Ao selecionar um item da biblioteca:
                // 1. Carregamos os dados no estado principal
                // 2. Verificamos se há legenda salva (caption)
                // 3. Se houver, setamos a legenda e ATIVAMOS o 'skipCaptionGeneration'
                //    para que o useEffect (que roda quando os dados mudam) NÃO sobrescreva a legenda salva.
                // 4. Se NÃO houver, deixamos o useEffect gerar uma nova.

                if (data.caption && data.caption.trim() !== '') {
                    skipCaptionGeneration.current = true;
                    setCaptionText(data.caption);
                } else {
                    skipCaptionGeneration.current = false;
                    // O useEffect rodará após o setDate e gerará uma nova legenda
                }

                if (mode === 'quote') {
                    setQuoteData(data as QuoteData);
                    setQuoteFile(null);
                } else if (mode === 'book') {
                    setBookData(data as BookData);
                    setBookFile(null);
                } else {
                    setJobData(data as JobData);
                    setJobFile(null);
                }
                setShowLibrary(false);
            }}
          />
      )}
    </div>
  );
}

// --- Library Modal Component ---

const LibraryModal = ({ mode, onClose, onSelect }: { mode: AppMode, onClose: () => void, onSelect: (data: any) => void }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('Todos');

    useEffect(() => {
        setLoading(true);
        const fetchItems = async () => {
            let data = [];
            if (mode === 'quote') data = await dbService.getQuotes();
            else if (mode === 'book') data = await dbService.getBooks();
            else data = await dbService.getJobs();
            setItems(data);
            setLoading(false);
        };
        fetchItems();
    }, [mode]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir?')) {
            if (mode === 'quote') await dbService.deleteQuote(id);
            else if (mode === 'book') await dbService.deleteBook(id);
            else await dbService.deleteJob(id);
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    // Filter Logic
    const availableCategories = ['Todos', ...(mode === 'quote' ? QUOTE_CATEGORIES : mode === 'book' ? BOOK_CATEGORIES : [])];
    const filteredItems = filterCategory === 'Todos' 
        ? items 
        : items.filter(i => i.category === filterCategory);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-condensed font-bold text-gray-800 uppercase flex items-center gap-2">
                             <Database className="w-6 h-6 text-brand-purple" />
                             Biblioteca de {mode === 'quote' ? 'Frases' : mode === 'book' ? 'Livros' : 'Vagas'}
                        </h2>
                        <p className="text-sm text-gray-500">Clique em um item para carregar no editor</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                {/* Filter Toolbar */}
                {mode !== 'job' && (
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500 uppercase">Filtrar por:</span>
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-purple focus:border-brand-purple block p-2 outline-none"
                        >
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <span className="text-xs text-gray-400 ml-auto">{filteredItems.length} itens encontrados</span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-10 h-10 text-brand-purple" /></div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Database size={48} className="mb-4 opacity-50" />
                            <p>Nenhum item encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item, idx) => (
                                <div key={item.id || idx} onClick={() => onSelect(item)} className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-brand-purple cursor-pointer transition relative group border ${item.lastDownloaded ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {item.lastDownloaded && (<div className="p-1.5 bg-green-100 text-green-700 rounded-full" title={`Baixado em: ${formatDate(item.lastDownloaded)}`}><CheckCircle size={14} /></div>)}
                                        <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
                                    </div>
                                    {mode === 'quote' ? (
                                        <>
                                            <div className="mb-2"><span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{item.category}</span></div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-3 mb-2">"{item.quote}"</p>
                                            <p className="text-xs text-gray-500 font-bold">- {item.authorName}</p>
                                        </>
                                    ) : mode === 'book' ? (
                                        <div className="flex gap-3">
                                            <div className="w-12 h-16 bg-gray-200 rounded shrink-0 overflow-hidden">{item.coverImage && <img src={item.coverImage} className="w-full h-full object-cover" />}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.bookTitle}</p>
                                                <p className="text-xs text-gray-500">{item.bookAuthor}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0 overflow-hidden">{item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.jobTitle}</p>
                                                <p className="text-xs text-gray-500 font-bold">{item.jobCode}</p>
                                                <p className="text-[10px] text-gray-400">{item.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
