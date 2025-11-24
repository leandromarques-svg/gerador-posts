
import React, { forwardRef, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { BookData } from '../types';

interface BookCardProps {
  data: BookData;
  scale?: number;
}

const useBase64Image = (url: string | null) => {
  const [dataSrc, setDataSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setDataSrc(undefined);
      return;
    }
    if (url.startsWith('data:')) {
      setDataSrc(url);
      return;
    }
    let isMounted = true;
    const loadImage = async () => {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Network error');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) setDataSrc(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        if (isMounted) setDataSrc(url);
      }
    };
    loadImage();
    return () => { isMounted = false; };
  }, [url]);

  return dataSrc;
};

// Componente auxiliar para renderizar texto com negrito (igual ao QuoteCard)
interface RenderRichTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}

const RenderRichText = ({ text, className, style }: RenderRichTextProps) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  
  return (
    <p className={className} style={style}>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <span key={index} className="font-bold">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

export const BookCard = forwardRef<HTMLDivElement, BookCardProps>(({ data, scale = 1 }, ref) => {
  const backgroundSrc = useBase64Image("https://metarh.com.br/wp-content/uploads/2025/11/Dica-de-Livro-.jpg"); 
  const coverSrc = useBase64Image(data.coverImage);
  const footerLogoSrc = useBase64Image(data.footerLogoUrl || null);
  
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Lógica de Auto-Resize para o Título
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const MAX_FONT_SIZE = 67; 
    const LINE_HEIGHT = 1.1; 
    const MAX_HEIGHT = (MAX_FONT_SIZE * LINE_HEIGHT * 2) + 20; 

    let currentSize = MAX_FONT_SIZE;
    el.style.fontSize = `${currentSize}px`;

    while (el.scrollHeight > MAX_HEIGHT && currentSize > 30) {
        currentSize -= 1;
        el.style.fontSize = `${currentSize}px`;
    }
  }, [data.bookTitle]);

  return (
    <div 
      ref={ref}
      className="relative overflow-hidden bg-white flex flex-col font-sans items-center"
      style={{
        width: '1080px',
        height: '1350px',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        flexShrink: 0,
      }}
    >
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full z-0">
        {backgroundSrc && (
            <img src={backgroundSrc} alt="Background" className="w-full h-full object-cover" />
        )}
      </div>

      {/* --- SAFE AREA CONTAINER (140px MARGINS) --- */}
      <div className="relative z-10 w-full h-full flex flex-col pt-[140px] pb-[140px] px-[90px]">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col items-center w-full mb-8">
            <h2 className="text-[#53178e] text-[55px] font-normal tracking-wide leading-none mb-4">
                Dica de <span className="font-bold">Leitura</span>
            </h2>
            <div className="w-[400px] h-[4px] bg-[#ed2bf4]"></div>
        </div>

        {/* 2. TITLE SECTION */}
        <div className="w-full flex justify-center mb-8">
            <h1 
                ref={titleRef}
                className="font-bold text-black text-center leading-[1.1] break-words"
                style={{ maxWidth: '900px', fontSize: '67px' }}
            >
                {data.bookTitle}
            </h1>
        </div>

        {/* 3. AUTHOR SECTION */}
        <div className="w-full flex justify-center mb-12">
            <div className="bg-[#ed2bf4] px-8 py-2 rounded-full shadow-md">
                <span className="text-white font-bold text-[38px] uppercase tracking-wide block leading-none">
                    {data.bookAuthor}
                </span>
            </div>
        </div>

        {/* 4. MAIN CONTENT (BOOK + REVIEW BOX) */}
        <div className="flex-1 flex flex-row items-center justify-center w-full px-2 mt-2 relative">
            
            {/* ESQUERDA: Livro 3D */}
            <div className="relative flex-shrink-0 transform -rotate-3 perspective-[2000px] z-20 mr-16">
                <div className="relative w-[400px] h-[600px]" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Sombra no chão */}
                    <div className="absolute -bottom-[30px] left-[20px] w-[90%] h-[30px] bg-black/40 blur-[20px] rounded-[50%] transform rotate-x-[80deg]"></div>

                    {/* CAPA */}
                    <div className="absolute inset-0 z-20 bg-white rounded-r-[4px] shadow-2xl">
                        {coverSrc ? (
                            <img 
                                src={coverSrc} 
                                alt="Capa" 
                                className="w-full h-full object-cover rounded-r-[4px]"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                CAPA
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/10 to-transparent pointer-events-none rounded-r-[4px]"></div>
                        <div className="absolute left-[12px] top-0 bottom-0 w-[1px] bg-black/15 mix-blend-multiply"></div>
                    </div>

                     {/* LOMBADA */}
                    <div 
                        className="absolute top-[0px] left-0 w-[35px] h-full bg-gray-900 origin-left z-10"
                        style={{ transform: 'rotateY(-90deg)' }} 
                    ></div>

                    {/* FOLHAS */}
                    <div 
                        className="absolute top-[2px] right-[0px] w-[30px] h-[99%] bg-white z-0 border-l border-gray-200"
                        style={{ 
                            transform: 'rotateY(90deg) translateZ(-1px)',
                            transformOrigin: 'right',
                            background: 'linear-gradient(to right, #f5f5f5 1px, #fff 1px)',
                            backgroundSize: '2px 100%'
                        }}
                    ></div>
                </div>
            </div>

            {/* DIREITA: Review Box */}
            <div className="relative z-10 -ml-40 pl-40 pr-8 py-10 bg-white/85 rounded-[40px] backdrop-blur-sm shadow-lg w-[580px] min-h-[350px] flex flex-col justify-center mt-8">
                <h3 className="font-bold text-[#53178e] text-[46px] mb-3 leading-none">
                    Por que a leitura?
                </h3>
                
                {/* Usando RenderRichText para suportar negrito */}
                <RenderRichText 
                    text={data.review}
                    className="font-medium text-gray-900 text-[28px] leading-[1.3] text-left"
                />
            </div>
        </div>

        {/* 5. FOOTER */}
        <div className="w-full flex items-center justify-between pt-8 shrink-0 mt-auto border-t border-gray-200/0">
            <div className="flex items-center gap-3 ml-[20px]">
                <span className="text-[#53178e] font-sans text-[18px] font-bold">
                    {data.socialHandle}
                </span>
            </div>

            {footerLogoSrc && (
                <img 
                    src={footerLogoSrc} 
                    alt="Logo Rodapé" 
                    className="h-[80px] w-auto object-contain" 
                    style={{ filter: 'brightness(0.2)' }}
                />
            )}
        </div>

      </div>
    </div>
  );
});

BookCard.displayName = 'BookCard';
