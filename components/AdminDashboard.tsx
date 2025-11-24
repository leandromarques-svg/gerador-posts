
import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Edit2, Trash2, X, Save, Upload, 
    Quote, BookOpen, Briefcase, Loader2, Image as ImageIcon,
    AlertCircle, Plus, FileJson, CheckCircle
} from 'lucide-react';
import { dbService } from '../services/databaseService';
import { QuoteData, BookData, JobData, QUOTE_CATEGORIES, BOOK_CATEGORIES, INITIAL_QUOTE_DATA, INITIAL_BOOK_DATA, INITIAL_JOB_DATA } from '../types';

type AdminTab = 'quotes' | 'books' | 'jobs';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('quotes');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    // Estados para edição
    const [editFormData, setEditFormData] = useState<any>({});
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados para Importação JSON
    const [isImporting, setIsImporting] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Carregar dados
    const fetchData = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === 'quotes') data = await dbService.getQuotes();
            else if (activeTab === 'books') data = await dbService.getBooks();
            else data = await dbService.getJobs();
            setItems(data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSearchTerm('');
    }, [activeTab]);

    // Filtragem
    const filteredItems = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (activeTab === 'quotes') {
            const q = item as QuoteData;
            return (q.quote || '').toLowerCase().includes(searchLower) || 
                   (q.authorName || '').toLowerCase().includes(searchLower) ||
                   (q.category || '').toLowerCase().includes(searchLower);
        } else if (activeTab === 'books') {
            const b = item as BookData;
            return (b.bookTitle || '').toLowerCase().includes(searchLower) || 
                   (b.bookAuthor || '').toLowerCase().includes(searchLower);
        } else {
            const j = item as JobData;
            return (j.jobTitle || '').toLowerCase().includes(searchLower) || 
                   (j.jobCode || '').toLowerCase().includes(searchLower);
        }
    });

    // Ações de Criação / Edição
    const handleNewClick = () => {
        let initialData = {};
        if (activeTab === 'quotes') initialData = { ...INITIAL_QUOTE_DATA, id: undefined, caption: '' };
        else if (activeTab === 'books') initialData = { ...INITIAL_BOOK_DATA, id: undefined, caption: '' };
        else initialData = { ...INITIAL_JOB_DATA, id: undefined, caption: '' };
        
        setEditingItem({ id: 'new' }); // Placeholder ID for new item
        setEditFormData(initialData);
        setEditFile(null);
        setEditPreviewUrl(null);
    };

    const handleEditClick = (item: any) => {
        setEditingItem(item);
        setEditFormData({ ...item });
        setEditFile(null);
        setEditPreviewUrl(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFile(file);
            const objectUrl = URL.createObjectURL(file);
            setEditPreviewUrl(objectUrl);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'quotes') {
                await dbService.saveQuote(editFormData, editFile || undefined);
            } else if (activeTab === 'books') {
                await dbService.saveBook(editFormData, editFile || undefined);
            } else {
                await dbService.saveJob(editFormData, editFile || undefined);
            }
            
            // Recarregar lista e fechar modal
            await fetchData();
            setEditingItem(null);
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            // Mostrar a mensagem de erro real vinda do Supabase/Service
            alert(`Erro ao salvar: ${error.message || 'Erro desconhecido.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este item permanentemente?")) return;
        try {
            if (activeTab === 'quotes') await dbService.deleteQuote(id);
            else if (activeTab === 'books') await dbService.deleteBook(id);
            else await dbService.deleteJob(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    // Ações de Importação (JSON)
    const handleImportClick = () => {
        setIsImporting(true);
        setImportJsonText('');
    };

    const executeImport = async () => {
        if (!importJsonText) return;
        setIsSaving(true);
        try {
            const data = JSON.parse(importJsonText);
            if (!Array.isArray(data)) throw new Error("O JSON deve ser uma lista (Array) de objetos: [...]");

            let successCount = 0;
            
            for (const item of data) {
                 // Sanitização básica e preenchimento de defaults se necessário
                 if (activeTab === 'quotes') {
                     const payload = {
                         category: item.category || 'Inspiração',
                         quote: item.quote || 'Sem texto',
                         authorName: item.authorName || 'Desconhecido',
                         authorRole: item.authorRole || '',
                         authorImage: item.authorImage || null,
                         socialHandle: item.socialHandle || '@metarhconsultoria',
                         caption: item.caption || ''
                     };
                     await dbService.saveQuote(payload as QuoteData);
                 } else if (activeTab === 'books') {
                     const payload = {
                         category: item.category || 'Desenvolvimento',
                         bookTitle: item.bookTitle || 'Sem Título',
                         bookAuthor: item.bookAuthor || 'Desconhecido',
                         review: item.review || '',
                         coverImage: item.coverImage || null,
                         socialHandle: item.socialHandle || '@metarhconsultoria',
                         caption: item.caption || ''
                     };
                     await dbService.saveBook(payload as BookData);
                 }
                 // Não implementado importação em massa para vagas (Jobs) por complexidade
                 successCount++;
            }
            
            alert(`Importação concluída! ${successCount} itens adicionados.`);
            setIsImporting(false);
            fetchData();

        } catch (e: any) {
            alert("Erro no JSON: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Render Helpers
    const getImageSrc = (item: any) => {
        if (activeTab === 'quotes') return item.authorImage;
        if (activeTab === 'books') return item.coverImage;
        return item.imageUrl;
    };

    const getImageFieldName = () => {
        if (activeTab === 'quotes') return 'authorImage';
        if (activeTab === 'books') return 'coverImage';
        return 'imageUrl';
    };

    const labelClass = "text-xs font-bold text-gray-500 uppercase block mb-1";
    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition";

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-purple p-2 rounded-lg">
                        <Edit2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-condensed font-bold text-gray-900 uppercase">Administração do Banco</h1>
                        <p className="text-sm text-gray-500">Gerencie todo o conteúdo do aplicativo</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500">
                    <X size={28} />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Menu */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 gap-2 shrink-0">
                    <button 
                        onClick={() => setActiveTab('quotes')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'quotes' ? 'bg-brand-pink text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Quote size={18} /> Frases
                    </button>
                    <button 
                        onClick={() => setActiveTab('books')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'books' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BookOpen size={18} /> Livros
                    </button>
                    <button 
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Briefcase size={18} /> Vagas
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-gray-50 p-8 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder={`Buscar ${activeTab === 'quotes' ? 'Frases' : activeTab === 'books' ? 'Livros' : 'Vagas'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none shadow-sm"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* Botão de Importar JSON */}
                            {activeTab !== 'jobs' && (
                                <button 
                                    onClick={handleImportClick}
                                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
                                    title="Importar lista via JSON"
                                >
                                    <FileJson size={18} /> Importar JSON
                                </button>
                            )}

                             {/* Botão Novo Item */}
                             <button 
                                onClick={handleNewClick}
                                className="flex items-center gap-2 px-5 py-3 bg-brand-purple text-white rounded-xl hover:bg-purple-900 transition shadow-md font-bold text-sm uppercase"
                            >
                                <Plus size={18} /> Novo {activeTab === 'quotes' ? 'Frase' : activeTab === 'books' ? 'Livro' : 'Vaga'}
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="animate-spin w-10 h-10 text-brand-purple" />
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-bold tracking-wider shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 border-b">Imagem</th>
                                            <th className="px-6 py-4 border-b w-1/3">Principal</th>
                                            <th className="px-6 py-4 border-b">Detalhes</th>
                                            <th className="px-6 py-4 border-b">Categoria/Setor</th>
                                            <th className="px-6 py-4 border-b text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/80 transition group">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                                                        {getImageSrc(item) ? (
                                                            <img src={getImageSrc(item)} className="w-full h-full object-cover" alt="Thumb" />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full text-gray-300"><ImageIcon size={16} /></div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {activeTab === 'quotes' ? (
                                                        <p className="text-sm text-gray-900 font-medium line-clamp-2">"{item.quote}"</p>
                                                    ) : activeTab === 'books' ? (
                                                        <p className="text-sm text-gray-900 font-bold">{item.bookTitle}</p>
                                                    ) : (
                                                        <p className="text-sm text-gray-900 font-bold">{item.jobTitle}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {activeTab === 'quotes' ? (
                                                        <p className="text-sm text-gray-500">{item.authorName}</p>
                                                    ) : activeTab === 'books' ? (
                                                        <p className="text-sm text-gray-500">{item.bookAuthor}</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{item.jobCode}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase
                                                        ${activeTab === 'quotes' ? 'bg-pink-50 text-brand-pink' : 
                                                          activeTab === 'books' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {activeTab === 'jobs' ? item.sector : item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                                                        <button 
                                                            onClick={() => handleEditClick(item)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" 
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" 
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredItems.length === 0 && (
                                    <div className="p-12 text-center text-gray-400">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhum registro encontrado.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* IMPORT MODAL */}
            {isImporting && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
                                <FileJson size={18} /> Importar {activeTab === 'quotes' ? 'Frases' : 'Livros'} em Massa
                            </h3>
                            <button onClick={() => setIsImporting(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Cole abaixo uma lista em formato <strong>JSON</strong> contendo os itens que deseja adicionar.
                            </p>
                            <textarea 
                                className="w-full h-64 p-4 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs text-gray-700 focus:ring-2 focus:ring-brand-purple outline-none"
                                placeholder={`[\n  {\n    "category": "Motivação",\n    "quote": "Sua frase aqui...",\n    "authorName": "Autor",\n    "caption": "Legenda..."\n  }\n]`}
                                value={importJsonText}
                                onChange={(e) => setImportJsonText(e.target.value)}
                            />
                        </div>
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button 
                                onClick={() => setIsImporting(false)}
                                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executeImport}
                                disabled={isSaving || !importJsonText}
                                className="px-8 py-3 rounded-xl bg-brand-purple text-white font-bold hover:bg-purple-900 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={18} />}
                                {isSaving ? 'Importando...' : 'Processar Importação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT/CREATE MODAL */}
            {editingItem && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
                                <Edit2 size={18} /> {editingItem.id === 'new' ? 'Criar Novo(a)' : 'Editar'} {activeTab === 'quotes' ? 'Frase' : activeTab === 'books' ? 'Livro' : 'Vaga'}
                            </h3>
                            <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Image Upload Area */}
                            <div className="flex gap-6 items-start">
                                <div 
                                    className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-brand-purple hover:bg-purple-50 transition relative overflow-hidden group shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {(editPreviewUrl || getImageSrc(editFormData)) ? (
                                        <img src={editPreviewUrl || getImageSrc(editFormData)} className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="text-gray-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <p className="text-white text-xs font-bold text-center px-2">Trocar Imagem</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Clique na imagem ao lado para fazer upload de um novo arquivo.
                                    </p>
                                    
                                    {/* URL Input Fallback */}
                                    <div>
                                         <label className={labelClass}>Ou cole a URL da imagem aqui</label>
                                         <input 
                                            type="text" 
                                            name={getImageFieldName()} 
                                            value={editFormData[getImageFieldName()] || ''} 
                                            onChange={handleFormChange} 
                                            className={inputClass} 
                                            placeholder="https://exemplo.com/imagem.jpg"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Útil se o upload falhar devido a permissões de servidor.</p>
                                    </div>

                                    {activeTab === 'quotes' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Offset X</label>
                                                <input 
                                                    type="number" 
                                                    value={editFormData.authorImageOffset?.x || 0} 
                                                    onChange={(e) => setEditFormData({...editFormData, authorImageOffset: {...editFormData.authorImageOffset, x: Number(e.target.value)}})}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Offset Y</label>
                                                <input 
                                                    type="number" 
                                                    value={editFormData.authorImageOffset?.y || 0} 
                                                    onChange={(e) => setEditFormData({...editFormData, authorImageOffset: {...editFormData.authorImageOffset, y: Number(e.target.value)}})}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Forms based on Type */}
                            <div className="space-y-4">
                                
                                {/* Common Caption Field */}
                                <div className="mb-4">
                                    <label className={labelClass}>Legenda do Post (Caption)</label>
                                    <textarea 
                                        name="caption" 
                                        value={editFormData.caption || ''} 
                                        onChange={handleFormChange} 
                                        className={`${inputClass} min-h-[80px]`}
                                        placeholder="Legenda que será carregada automaticamente no editor..."
                                    />
                                </div>

                                {activeTab === 'quotes' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Categoria</label>
                                            <select name="category" value={editFormData.category || 'Inspiração'} onChange={handleFormChange} className={inputClass}>
                                                {QUOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Frase</label>
                                            <textarea name="quote" value={editFormData.quote || ''} onChange={handleFormChange} className={`${inputClass} min-h-[100px]`} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Autor</label>
                                                <input type="text" name="authorName" value={editFormData.authorName || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Cargo/Papel</label>
                                                <input type="text" name="authorRole" value={editFormData.authorRole || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Social Handle</label>
                                                <input type="text" name="socialHandle" value={editFormData.socialHandle || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Website</label>
                                                <input type="text" name="websiteUrl" value={editFormData.websiteUrl || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'books' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Categoria</label>
                                                <select name="category" value={editFormData.category || 'Desenvolvimento'} onChange={handleFormChange} className={inputClass}>
                                                    {BOOK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Autor</label>
                                                <input type="text" name="bookAuthor" value={editFormData.bookAuthor || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Título</label>
                                            <input type="text" name="bookTitle" value={editFormData.bookTitle || ''} onChange={handleFormChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Review</label>
                                            <textarea name="review" value={editFormData.review || ''} onChange={handleFormChange} className={`${inputClass} min-h-[100px]`} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Social Handle</label>
                                                <input type="text" name="socialHandle" value={editFormData.socialHandle || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Logo URL (Opcional)</label>
                                                <input type="text" name="footerLogoUrl" value={editFormData.footerLogoUrl || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'jobs' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Título da Vaga</label>
                                            <input type="text" name="jobTitle" value={editFormData.jobTitle || ''} onChange={handleFormChange} className={inputClass} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Código</label>
                                                <input type="text" name="jobCode" value={editFormData.jobCode || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Setor</label>
                                                <input type="text" name="sector" value={editFormData.sector || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Local</label>
                                                <input type="text" name="location" value={editFormData.location || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Tagline</label>
                                                <input type="text" name="tagline" value={editFormData.tagline || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Contrato</label>
                                                <input type="text" name="contractType" value={editFormData.contractType || ''} onChange={handleFormChange} className={inputClass} placeholder="ex: CLT" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Modalidade</label>
                                                <input type="text" name="modality" value={editFormData.modality || ''} onChange={handleFormChange} className={inputClass} placeholder="ex: Híbrido" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Website Link</label>
                                                <input type="text" name="websiteUrl" value={editFormData.websiteUrl || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Logo URL (Opcional)</label>
                                                <input type="text" name="footerLogoUrl" value={editFormData.footerLogoUrl || ''} onChange={handleFormChange} className={inputClass} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setEditingItem(null)}
                                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 rounded-xl bg-brand-purple text-white font-bold hover:bg-purple-900 transition flex items-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
