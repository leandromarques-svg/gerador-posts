

import { QuoteData, BookData } from '../types';

export const SEED_QUOTES: Partial<QuoteData>[] = [
    // --- Liderança e Gestão ---
    {
        category: 'Liderança',
        quote: 'Liderança não é sobre ser o melhor. É sobre fazer *os outros serem melhores*.',
        authorName: 'Bill Gates',
        authorRole: 'Fundador da Microsoft',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Liderança',
        quote: 'Bons líderes assumem a responsabilidade quando as coisas dão errado e *dão crédito* quando as coisas dão certo.',
        authorName: 'Simon Sinek',
        authorRole: 'Autor e Palestrante',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Gestão',
        quote: 'Gerenciamento é fazer as coisas direito. Liderança é fazer *a coisa certa*.',
        authorName: 'Peter Drucker',
        authorRole: 'Pai da Administração Moderna',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Trabalho em Equipe',
        quote: 'O talento vence jogos, mas só o *trabalho em equipe* ganha campeonatos.',
        authorName: 'Michael Jordan',
        authorRole: 'Lenda do Basquete',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Liderança',
        quote: 'Um líder é um vendedor de *esperança*.',
        authorName: 'Napoleão Bonaparte',
        authorRole: 'Líder Militar',
        socialHandle: '@metarhconsultoria'
    },

    // --- Motivação e Ação ---
    {
        category: 'Motivação',
        quote: 'A única maneira de fazer um *excelente trabalho* é amar o que você faz.',
        authorName: 'Steve Jobs',
        authorRole: 'Co-fundador da Apple',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Ação',
        quote: 'Você não precisa ser ótimo para começar, mas precisa *começar para ser ótimo*.',
        authorName: 'Zig Ziglar',
        authorRole: 'Vendedor e Palestrante',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Determinação',
        quote: 'Daqui a um ano, você vai desejar ter *começado hoje*.',
        authorName: 'Karen Lamb',
        authorRole: 'Escritora',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Ação',
        quote: 'Feito é melhor que *perfeito*.',
        authorName: 'Sheryl Sandberg',
        authorRole: 'Executiva do Facebook',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Coragem',
        quote: 'Tudo o que você sempre quis está do *outro lado do medo*.',
        authorName: 'George Addair',
        authorRole: 'Orador',
        socialHandle: '@metarhconsultoria'
    },

    // --- Sucesso e Persistência ---
    {
        category: 'Persistência',
        quote: 'Não falhei. Apenas encontrei 10.000 maneiras que *não funcionam*.',
        authorName: 'Thomas Edison',
        authorRole: 'Inventor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Sucesso',
        quote: 'O sucesso é a soma de *pequenos esforços* repetidos dia após dia.',
        authorName: 'Robert Collier',
        authorRole: 'Escritor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Resiliência',
        quote: 'A glória não reside em nunca cair, mas em *levantar-se sempre*.',
        authorName: 'Confúcio',
        authorRole: 'Filósofo Chinês',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Sucesso',
        quote: 'O sucesso geralmente vem para quem está *ocupado demais* para procurar por ele.',
        authorName: 'Henry David Thoreau',
        authorRole: 'Filósofo',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Persistência',
        quote: 'É difícil vencer uma pessoa que *nunca desiste*.',
        authorName: 'Babe Ruth',
        authorRole: 'Lenda do Beisebol',
        socialHandle: '@metarhconsultoria'
    },

    // --- Inovação e Criatividade ---
    {
        category: 'Inovação',
        quote: 'A melhor maneira de prever o futuro é *criá-lo*.',
        authorName: 'Peter Drucker',
        authorRole: 'Consultor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Criatividade',
        quote: 'A criatividade é a inteligência *se divertindo*.',
        authorName: 'Albert Einstein',
        authorRole: 'Físico Teórico',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Inovação',
        quote: 'Se você não está disposto a arriscar o habitual, terá que se contentar com o *comum*.',
        authorName: 'Jim Rohn',
        authorRole: 'Empreendedor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Visão',
        quote: 'Inovação distingue um *líder* de um seguidor.',
        authorName: 'Steve Jobs',
        authorRole: 'Visionário',
        socialHandle: '@metarhconsultoria'
    },

    // --- Autoconhecimento e Desenvolvimento ---
    {
        category: 'Autoconhecimento',
        quote: 'Conhece-te a ti mesmo e conhecerás o universo e os deuses.',
        authorName: 'Sócrates',
        authorRole: 'Filósofo',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Desenvolvimento',
        quote: 'Investir em conhecimento rende sempre os *melhores juros*.',
        authorName: 'Benjamin Franklin',
        authorRole: 'Polímata',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Aprendizado',
        quote: 'Viva como se fosse morrer amanhã. Aprenda como se fosse *viver para sempre*.',
        authorName: 'Mahatma Gandhi',
        authorRole: 'Líder Pacifista',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Crescimento',
        quote: 'A zona de conforto é um lugar lindo, mas *nada cresce lá*.',
        authorName: 'Desconhecido',
        authorRole: 'Sabedoria Popular',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Mudança',
        quote: 'Seja a mudança que você quer ver no mundo.',
        authorName: 'Mahatma Gandhi',
        authorRole: 'Líder',
        socialHandle: '@metarhconsultoria'
    },

    // --- Foco e Disciplina ---
    {
        category: 'Foco',
        quote: 'Foco é dizer *não*.',
        authorName: 'Steve Jobs',
        authorRole: 'Co-fundador da Apple',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Disciplina',
        quote: 'A disciplina é a ponte entre *metas e realizações*.',
        authorName: 'Jim Rohn',
        authorRole: 'Empreendedor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Planejamento',
        quote: 'Se você falha em planejar, está *planejando falhar*.',
        authorName: 'Benjamin Franklin',
        authorRole: 'Estadista',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Tempo',
        quote: 'Não conte os dias, faça *os dias contarem*.',
        authorName: 'Muhammad Ali',
        authorRole: 'Boxeador',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Foco',
        quote: 'A falta de direção, não a falta de tempo, é o problema. Todos têm dias de *24 horas*.',
        authorName: 'Zig Ziglar',
        authorRole: 'Autor',
        socialHandle: '@metarhconsultoria'
    },

    // --- Soft Skills e Humanidade ---
    {
        category: 'Empatia',
        quote: 'As pessoas esquecerão o que você disse, mas nunca esquecerão como você as fez *sentir*.',
        authorName: 'Maya Angelou',
        authorRole: 'Poetisa',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Excelência',
        quote: 'Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um *hábito*.',
        authorName: 'Aristóteles',
        authorRole: 'Filósofo Grego',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Propósito',
        quote: 'Quem tem um *porquê* enfrenta qualquer como.',
        authorName: 'Viktor Frankl',
        authorRole: 'Psiquiatra',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Atitude',
        quote: 'A vida é 10% o que acontece comigo e 90% de *como eu reajo a isso*.',
        authorName: 'Charles Swindoll',
        authorRole: 'Educador',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Comunicação',
        quote: 'O mais importante na comunicação é ouvir o que *não foi dito*.',
        authorName: 'Peter Drucker',
        authorRole: 'Consultor',
        socialHandle: '@metarhconsultoria'
    },

    // --- Mais Negócios e Estratégia ---
    {
        category: 'Estratégia',
        quote: 'A essência da estratégia é escolher o que *não fazer*.',
        authorName: 'Michael Porter',
        authorRole: 'Economista',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Vendas',
        quote: 'Não venda produtos, venda *soluções*.',
        authorName: 'Desconhecido',
        authorRole: 'Máxima de Vendas',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Vendas',
        quote: 'Seus clientes mais insatisfeitos são sua maior fonte de *aprendizado*.',
        authorName: 'Bill Gates',
        authorRole: 'Fundador da Microsoft',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Oportunidade',
        quote: 'A sorte favorece a *mente preparada*.',
        authorName: 'Louis Pasteur',
        authorRole: 'Cientista',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Sabedoria',
        quote: 'O único verdadeiro erro é aquele a partir do qual *nada aprendemos*.',
        authorName: 'Henry Ford',
        authorRole: 'Industrial',
        socialHandle: '@metarhconsultoria'
    },
    // Completando até ~45-50 frases e expandindo com mais algumas variadas
    {
        category: 'Reflexão',
        quote: 'A mente que se abre a uma nova ideia jamais voltará ao seu *tamanho original*.',
        authorName: 'Albert Einstein',
        authorRole: 'Físico',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Motivação',
        quote: 'Não espere. O tempo nunca será o *ideal*.',
        authorName: 'Napoleon Hill',
        authorRole: 'Autor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Inspiração',
        quote: 'Você perde 100% dos tiros que *não dá*.',
        authorName: 'Wayne Gretzky',
        authorRole: 'Lenda do Hóquei',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Liderança',
        quote: 'Gerir é fazer as coisas corretamente; liderar é fazer a *coisa certa*.',
        authorName: 'Peter Drucker',
        authorRole: 'Consultor',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Carreira',
        quote: 'Escolha um trabalho que você ama e não terá que trabalhar *um único dia* em sua vida.',
        authorName: 'Confúcio',
        authorRole: 'Filósofo',
        socialHandle: '@metarhconsultoria'
    }
];

export const SEED_BOOKS: Partial<BookData>[] = [
    // --- Produtividade e Hábitos ---
    {
        category: 'Produtividade',
        bookTitle: 'Essencialismo',
        bookAuthor: 'Greg McKeown',
        coverImage: 'https://m.media-amazon.com/images/I/71e76RzC7eL._AC_UF1000,1000_QL80_.jpg',
        review: 'Menos, porém melhor. Um guia para focar no que realmente importa e eliminar o ruído.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Produtividade',
        bookTitle: 'Hábitos Atômicos',
        bookAuthor: 'James Clear',
        coverImage: 'https://m.media-amazon.com/images/I/713mzPe255L._AC_UF1000,1000_QL80_.jpg',
        review: 'Pequenas mudanças, resultados impressionantes. Um método fácil e comprovado de criar bons hábitos.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Desenvolvimento',
        bookTitle: 'O Poder do Hábito',
        bookAuthor: 'Charles Duhigg',
        coverImage: 'https://m.media-amazon.com/images/I/81ibfYk4qZL._AC_UF1000,1000_QL80_.jpg',
        review: 'Por que fazemos o que fazemos. Entenda o "Loop do Hábito" para transformar sua rotina.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Produtividade',
        bookTitle: 'Trabalho Focado',
        bookAuthor: 'Cal Newport',
        coverImage: 'https://m.media-amazon.com/images/I/71q03+E+OUL._AC_UF1000,1000_QL80_.jpg',
        review: 'Como ter sucesso em um mundo distraído. O valor inestimável do *Deep Work*.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Bem-estar',
        bookTitle: 'O Milagre da Manhã',
        bookAuthor: 'Hal Elrod',
        coverImage: 'https://m.media-amazon.com/images/I/61s60H4+QOL._AC_UF1000,1000_QL80_.jpg',
        review: '6 hábitos matinais para transformar sua vida antes das 8 horas da manhã.',
        socialHandle: '@metarhconsultoria'
    },

    // --- Mentalidade e Psicologia ---
    {
        category: 'Mentalidade',
        bookTitle: 'Mindset',
        bookAuthor: 'Carol S. Dweck',
        coverImage: 'https://m.media-amazon.com/images/I/71+vQyk44IL._AC_UF1000,1000_QL80_.jpg',
        review: 'A nova psicologia do sucesso. A diferença crucial entre mindset fixo e de *crescimento*.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Autoconhecimento',
        bookTitle: 'Inteligência Emocional',
        bookAuthor: 'Daniel Goleman',
        coverImage: 'https://m.media-amazon.com/images/I/81h2gWPTYJL._AC_UF1000,1000_QL80_.jpg',
        review: 'Por que o QE pode ser mais importante que o QI para o sucesso na vida e no trabalho.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Filosofia',
        bookTitle: 'Meditações',
        bookAuthor: 'Marco Aurélio',
        coverImage: 'https://m.media-amazon.com/images/I/81t-IstP9XL._AC_UF1000,1000_QL80_.jpg',
        review: 'O diário do imperador estóico. Lições atemporais sobre controle emocional, virtude e dever.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Autoconhecimento',
        bookTitle: 'O Poder do Agora',
        bookAuthor: 'Eckhart Tolle',
        coverImage: 'https://m.media-amazon.com/images/I/71uX1oP1p+L._AC_UF1000,1000_QL80_.jpg',
        review: 'Um guia para a iluminação espiritual. A importância de viver o momento presente.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Mentalidade',
        bookTitle: 'Rápido e Devagar',
        bookAuthor: 'Daniel Kahneman',
        coverImage: 'https://m.media-amazon.com/images/I/71f743sOPoL._AC_UF1000,1000_QL80_.jpg',
        review: 'Duas formas de pensar. Entenda como seu cérebro toma decisões e evita vieses.',
        socialHandle: '@metarhconsultoria'
    },

    // --- Liderança e Negócios ---
    {
        category: 'Liderança',
        bookTitle: 'Comece pelo Porquê',
        bookAuthor: 'Simon Sinek',
        coverImage: 'https://m.media-amazon.com/images/I/81sh2Kq+xAL._AC_UF1000,1000_QL80_.jpg',
        review: 'Como grandes líderes inspiram ação. O conceito do Círculo Dourado.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Inovação',
        bookTitle: 'De Zero a Um',
        bookAuthor: 'Peter Thiel',
        coverImage: 'https://m.media-amazon.com/images/I/71uAI28kJuL._AC_UF1000,1000_QL80_.jpg',
        review: 'O que aprender sobre empreendedorismo para construir o futuro e criar monopólios criativos.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Estratégia',
        bookTitle: 'A Arte da Guerra',
        bookAuthor: 'Sun Tzu',
        coverImage: 'https://m.media-amazon.com/images/I/71Xq+KkQGEL._AC_UF1000,1000_QL80_.jpg',
        review: 'Estratégias milenares para vencer conflitos, aplicáveis perfeitamente ao mundo dos negócios.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Liderança',
        bookTitle: 'O Gestor Eficaz',
        bookAuthor: 'Peter Drucker',
        coverImage: 'https://m.media-amazon.com/images/I/71j0F+O+OUL._AC_UF1000,1000_QL80_.jpg',
        review: 'O guia definitivo para fazer as coisas certas acontecerem nas organizações.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Negócios',
        bookTitle: 'A Startup Enxuta',
        bookAuthor: 'Eric Ries',
        coverImage: 'https://m.media-amazon.com/images/I/81-QB7nDh4L._AC_UF1000,1000_QL80_.jpg',
        review: 'Como usar a inovação contínua para criar empresas radicalmente bem-sucedidas.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Negócios',
        bookTitle: 'Empresas Feitas para Vencer',
        bookAuthor: 'Jim Collins',
        coverImage: 'https://m.media-amazon.com/images/I/71n9p5A+0LL._AC_UF1000,1000_QL80_.jpg',
        review: 'Por que algumas empresas alcançam a excelência e outras não (Good to Great).',
        socialHandle: '@metarhconsultoria'
    },

    // --- Finanças e Carreira ---
    {
        category: 'Finanças',
        bookTitle: 'Pai Rico, Pai Pobre',
        bookAuthor: 'Robert Kiyosaki',
        coverImage: 'https://m.media-amazon.com/images/I/81bsw6fnUiL._AC_UF1000,1000_QL80_.jpg',
        review: 'O que os ricos ensinam a seus filhos sobre dinheiro que os pobres e a classe média não fazem.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Finanças',
        bookTitle: 'O Homem Mais Rico da Babilônia',
        bookAuthor: 'George S. Clason',
        coverImage: 'https://m.media-amazon.com/images/I/81be+4+94+L._AC_UF1000,1000_QL80_.jpg',
        review: 'Soluções sábias e antigas para problemas financeiros modernos.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Finanças',
        bookTitle: 'Psicologia Financeira',
        bookAuthor: 'Morgan Housel',
        coverImage: 'https://m.media-amazon.com/images/I/71E8VncD3lS._AC_UF1000,1000_QL80_.jpg',
        review: 'Lições atemporais sobre riqueza, ganância e felicidade.',
        socialHandle: '@metarhconsultoria'
    },

    // --- Comunicação e Criatividade ---
    {
        category: 'Comunicação',
        bookTitle: 'Como Fazer Amigos',
        bookAuthor: 'Dale Carnegie',
        coverImage: 'https://m.media-amazon.com/images/I/713X2a+O+OUL._AC_UF1000,1000_QL80_.jpg',
        review: 'Princípios fundamentais para lidar com pessoas e influenciar positivamente.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Comunicação',
        bookTitle: 'Comunicação Não-Violenta',
        bookAuthor: 'Marshall B. Rosenberg',
        coverImage: 'https://m.media-amazon.com/images/I/81N7Fmjh4bL._AC_UF1000,1000_QL80_.jpg',
        review: 'Técnicas para aprimorar relacionamentos pessoais e profissionais.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Criatividade',
        bookTitle: 'Roube como um Artista',
        bookAuthor: 'Austin Kleon',
        coverImage: 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
        review: '10 dicas sobre criatividade. Nada é original, tudo é remix.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Criatividade',
        bookTitle: 'Grande Magia',
        bookAuthor: 'Elizabeth Gilbert',
        coverImage: 'https://m.media-amazon.com/images/I/81M+M4+eC4L._AC_UF1000,1000_QL80_.jpg',
        review: 'Vida criativa sem medo. Uma visão inspiradora sobre o processo criativo.',
        socialHandle: '@metarhconsultoria'
    },

    // --- Biografias e Histórias ---
    {
        category: 'Biografia',
        bookTitle: 'Steve Jobs',
        bookAuthor: 'Walter Isaacson',
        coverImage: 'https://m.media-amazon.com/images/I/61s60H4+QOL._AC_UF1000,1000_QL80_.jpg', // Placeholder image reused logic
        review: 'A biografia exclusiva do cofundador da Apple. Lições sobre inovação, caráter e liderança.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Biografia',
        bookTitle: 'A Marca da Vitória',
        bookAuthor: 'Phil Knight',
        coverImage: 'https://m.media-amazon.com/images/I/81i8L-4+x+L._AC_UF1000,1000_QL80_.jpg',
        review: 'A autobiografia do criador da Nike. Uma história sobre persistência, riscos e sucesso.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Vendas',
        bookTitle: 'As Armas da Persuasão',
        bookAuthor: 'Robert Cialdini',
        coverImage: 'https://m.media-amazon.com/images/I/51E7+I4gEUL._AC_UF1000,1000_QL80_.jpg',
        review: 'Como influenciar e não se deixar influenciar. Os gatilhos mentais explicados.',
        socialHandle: '@metarhconsultoria'
    },
    {
        category: 'Marketing',
        bookTitle: 'Isso é Marketing',
        bookAuthor: 'Seth Godin',
        coverImage: 'https://m.media-amazon.com/images/I/81s+X1+X2+L._AC_UF1000,1000_QL80_.jpg',
        review: 'Para ser visto é preciso aprender a enxergar. O marketing focado na empatia.',
        socialHandle: '@metarhconsultoria'
    }
];
