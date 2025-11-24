
import React, { forwardRef, useEffect, useState, useLayoutEffect, useRef } from 'react';
import { QuoteData } from '../types';

interface QuoteCardProps {
  data: QuoteData;
  scale?: number;
  onImageDrag?: (deltaX: number, deltaY: number) => void;
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

interface RenderRichTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}

const RenderRichText = forwardRef<HTMLParagraphElement, RenderRichTextProps>(({ text, className, style }, ref) => {
  if (!text) return null;

  const parts = text.split(/(\*[^*]+\*)/g);
  
  return (
    <p ref={ref} className={className} style={style}>
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
});

RenderRichText.displayName = 'RenderRichText';

export const QuoteCard = forwardRef<HTMLDivElement, QuoteCardProps>(({ data, scale = 1, onImageDrag }, ref) => {
  const backgroundSrc = useBase64Image("https://metarh.com.br/wp-content/uploads/2025/11/Fundo-Frases.jpg");
  const authorImageSrc = useBase64Image(data.authorImage);
  
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  // Lógica de redimensionamento automático
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    
    // Configurações ajustadas para permitir fonte maior
    const MAX_FONT_SIZE = 72; // Aumentado para começar grande
    const MIN_FONT_SIZE = 25; // Limite mínimo de segurança
    const LINE_HEIGHT = 1.1; 
    const MAX_LINES = 4; // Limite estrito de linhas

    let currentSize = MAX_FONT_SIZE;
    el.style.fontSize = `${currentSize}px`;
    el.style.lineHeight = `${LINE_HEIGHT}`;

    // Função que calcula a altura permitida para N linhas com a fonte atual
    const getMaxHeight = (fontSize: number) => {
        // Altura = Tamanho * LineHeight * Linhas + Pequena Margem de Segurança (10px)
        return (fontSize * LINE_HEIGHT * MAX_LINES) + 10;
    };

    // Reduz a fonte APENAS se o conteúdo real (scrollHeight) exceder a altura de 4 linhas
    while (
        el.scrollHeight > getMaxHeight(currentSize) && 
        currentSize > MIN_FONT_SIZE
    ) {
        currentSize -= 1;
        el.style.fontSize = `${currentSize}px`;
    }
  }, [data.quote]); 

  // Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
      if (!onImageDrag) return;
      e.preventDefault();
      setIsDragging(true);
      startPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
        if (!onImageDrag) return;
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        
        // Ajustar pela escala para que o movimento do mouse corresponda ao movimento na imagem
        onImageDrag(dx / scale, dy / scale);
        
        startPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onImageDrag, scale]);


  // Posição fixa do Shape (Círculo) no layout
  const BASE_LEFT = 94;
  const BASE_TOP = 750;

  return (
    <div 
      ref={ref}
      className="relative overflow-hidden bg-white flex flex-col font-sans"
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

      {/* --- CONTENT STRUCTURE --- */}
      <div className="relative z-10 w-full h-full">
        
        {/* 1. Top Social Handle (@metarhconsultoria) - Y: 140px */}
        <div className="absolute top-[140px] w-full text-center">
            <span className="font-sans font-medium text-[28px] text-black tracking-wide">
                {data.socialHandle}
            </span>
        </div>

        {/* 2. Foto Redonda (Draggable) */}
        <div 
            onMouseDown={handleMouseDown}
            className={`absolute rounded-full overflow-hidden bg-gray-200 z-20 shadow-lg ${onImageDrag ? 'cursor-move' : ''} group`}
            style={{ 
                width: '287px', 
                height: '287px',
                left: `${BASE_LEFT}px`,
                top: `${BASE_TOP}px`
            }}
            title={onImageDrag ? "Clique e arraste para ajustar a foto" : ""}
        >
            {/* Overlay hint */}
            {onImageDrag && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-30 transition-colors pointer-events-none flex items-center justify-center">
                   {/* Opcional: ícone de move */}
                </div>
            )}

            {authorImageSrc ? (
                <img 
                    src={authorImageSrc} 
                    alt="Autor" 
                    className="w-full h-full object-cover transition-transform duration-75 ease-out select-none"
                    style={{
                        transform: `translate(${data.authorImageOffset?.x || 0}px, ${data.authorImageOffset?.y || 0}px) scale(1.15)`
                    }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl bg-gray-100">?</div>
            )}
        </div>

        {/* 3. Conteúdo de Texto (Frase + Nome) */}
        <div 
            className="absolute flex flex-col items-center z-30"
            style={{
                top: '306px',
                width: '900px', // Aumentado para 900px para permitir mais texto por linha
                left: '50%',
                transform: 'translateX(-50%)'
            }}
        >
             <RenderRichText 
                ref={textRef}
                text={data.quote} 
                className="font-sans font-normal text-black text-center transition-all duration-200 w-full break-words"
                style={{ fontSize: '72px', lineHeight: '1.1' }}
             />
             
             <div className="mt-[50px] bg-brand-pink rounded-full px-8 py-3 shadow-md inline-block transform hover:scale-105 transition-transform">
                <span className="font-sans font-bold text-white text-[24px] uppercase tracking-wide">
                    {data.authorName}
                </span>
            </div>
        </div>

      </div>
    </div>
  );
});

QuoteCard.displayName = 'QuoteCard';
