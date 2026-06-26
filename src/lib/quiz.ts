/**
 * Quiz "Descubra seu superpoder de IA" (Isca B).
 * 6 perguntas → perfil. Q1/Q4 definem o perfil; Q3/Q5/Q6 puxam pro "Construtor" (power-user).
 * Lógica isomórfica (roda no client e no server p/ a página de entrega).
 */

export type Segment = 'conteudo' | 'closer' | 'atendente' | 'organizador' | 'construtor';

export type Opcao = { label: string; w: Partial<Record<Segment, number>> };
export type Pergunta = { id: string; pergunta: string; opcoes: Opcao[] };

export const QUESTIONS: Pergunta[] = [
  {
    id: 'area',
    pergunta: 'Qual a sua área?',
    opcoes: [
      { label: 'Marketing / Conteúdo', w: { conteudo: 2 } },
      { label: 'Vendas / Comercial', w: { closer: 2 } },
      { label: 'Atendimento / Suporte', w: { atendente: 2 } },
      { label: 'Dono de negócio / Gestão', w: { organizador: 2 } },
      { label: 'Freelancer / Serviços', w: { closer: 1, conteudo: 1 } },
    ],
  },
  {
    id: 'gargalo',
    pergunta: 'Qual seu maior gargalo hoje?',
    opcoes: [
      { label: 'Falta tempo pra tudo', w: { organizador: 1, conteudo: 1 } },
      { label: 'Falta ideia / conteúdo', w: { conteudo: 2 } },
      { label: 'Perco venda por demora', w: { closer: 1, atendente: 1 } },
      { label: 'Tá tudo desorganizado', w: { organizador: 2 } },
      { label: 'Não sei nem por onde começar', w: { conteudo: 1 } },
    ],
  },
  {
    id: 'nivel',
    pergunta: 'Com IA, você é…',
    opcoes: [
      { label: 'Nunca usei pra valer', w: {} },
      { label: 'Uso o ChatGPT às vezes', w: {} },
      { label: 'Uso direto, mas raso', w: { construtor: 1 } },
      { label: 'Já tentei coisa avançada', w: { construtor: 3 } },
    ],
  },
  {
    id: 'destrava',
    pergunta: 'O que você quer destravar primeiro?',
    opcoes: [
      { label: 'Produzir conteúdo', w: { conteudo: 2 } },
      { label: 'Vender mais', w: { closer: 2 } },
      { label: 'Responder mais rápido', w: { atendente: 2 } },
      { label: 'Organizar e lembrar tudo', w: { organizador: 2 } },
      { label: 'Automatizar tarefa repetida', w: { construtor: 2 } },
    ],
  },
  {
    id: 'estilo',
    pergunta: 'Você prefere…',
    opcoes: [
      { label: 'Copiar e colar pronto', w: {} },
      { label: 'Montar do meu jeito', w: { construtor: 2 } },
    ],
  },
  {
    id: 'tempo',
    pergunta: 'Quanto tempo por dia pra IA?',
    opcoes: [
      { label: 'Menos de 15 min', w: {} },
      { label: '15 a 30 min', w: {} },
      { label: '30 min ou mais', w: { construtor: 1 } },
    ],
  },
];

// ordem de desempate: "construtor" por último (só vence com sinal claro)
const TIE_ORDER: Segment[] = ['closer', 'conteudo', 'atendente', 'organizador', 'construtor'];

/** answers = índice da opção escolhida por pergunta (na ordem de QUESTIONS). */
export function score(answers: number[]): Segment {
  const tally: Record<Segment, number> = { conteudo: 0, closer: 0, atendente: 0, organizador: 0, construtor: 0 };
  QUESTIONS.forEach((q, i) => {
    const opt = q.opcoes[answers[i]];
    if (!opt) return;
    for (const [seg, pts] of Object.entries(opt.w)) tally[seg as Segment] += pts as number;
  });
  let best: Segment = 'conteudo';
  let bestScore = -1;
  for (const seg of TIE_ORDER) {
    if (tally[seg] > bestScore) { best = seg; bestScore = tally[seg]; }
  }
  return best;
}

// rótulo curto do superpoder por perfil (usado no assunto do e-mail de entrega)
export const SUPERPODER_LABEL: Record<Segment, string> = {
  conteudo: 'Máquina de Conteúdo',
  closer: 'Copy que Fecha',
  atendente: 'Atendente que não dorme',
  organizador: 'Organizador de IA',
  construtor: 'Construtor de Agentes',
};

export type Profile = {
  key: Segment;
  nome: string;
  tagline: string;
  desc: string;
  destaque: string;      // id da peça-destaque (superpoderes.ts)
  recomendados: string[]; // ids das peças do mini-arsenal
  bridge: string;        // ponte pro Arsenal completo
};

export const PROFILES: Record<Segment, Profile> = {
  conteudo: {
    key: 'conteudo',
    nome: 'O Produtor de Conteúdo',
    tagline: 'Sua IA vira uma máquina de publicar.',
    desc: 'Você vive de aparecer — e o gargalo é manter o ritmo sem secar a cabeça. Seu superpoder transforma 1 ideia numa semana inteira de conteúdo.',
    destaque: 'conteudo-semana',
    recomendados: ['conteudo-semana', 'reaproveita', 'revisor'],
    bridge: 'No Arsenal completo, esse fluxo roda com memória: a IA lembra seus temas e seu tom, e a esteira de conteúdo quase não te dá trabalho.',
  },
  closer: {
    key: 'closer',
    nome: 'O Closer',
    tagline: 'Sua IA fecha mais e perde menos venda.',
    desc: 'Você sabe que venda é conversa — e cada resposta morna custa dinheiro. Seu superpoder escreve oferta e resposta na linguagem do cliente.',
    destaque: 'copywriter',
    recomendados: ['copywriter', 'pesquisa-oferta', 'atendente'],
    bridge: 'No Arsenal completo, o atendente ganha memória dos seus clientes e produtos — e responde como se conhecesse cada um.',
  },
  atendente: {
    key: 'atendente',
    nome: 'O Atendente 24/7',
    tagline: 'Sua IA responde rápido e no seu tom.',
    desc: 'Seu cliente quer resposta agora — e você não pode estar em dois lugares. Seu superpoder responde dúvidas e objeções sem soar robô.',
    destaque: 'atendente',
    recomendados: ['atendente', 'revisor', 'reaproveita'],
    bridge: 'No Arsenal completo, o atendente puxa de uma memória (suas FAQs, preços, histórico) — vira um funcionário que não esquece nada.',
  },
  organizador: {
    key: 'organizador',
    nome: 'O Organizador',
    tagline: 'Sua IA para de esquecer e organiza o caos.',
    desc: 'O problema não é fazer — é não perder o fio. Seu superpoder coloca ordem e te devolve o controle do que importa.',
    destaque: 'revisor',
    recomendados: ['revisor', 'atendente', 'reaproveita'],
    bridge: 'O seu próximo passo é dar memória à IA (SQLite): ela passa a lembrar do seu contexto. Tem um mini-guia grátis disso — e está completo no Arsenal.',
  },
  construtor: {
    key: 'construtor',
    nome: 'O Construtor',
    tagline: 'Você não quer prompt pronto — quer montar o motor.',
    desc: 'Você já passou do ChatGPT raso. Quer encadear, automatizar e dar memória à IA. Seu superpoder é orquestrar peças num agente que trabalha sozinho.',
    destaque: 'pesquisa-oferta',
    recomendados: ['pesquisa-oferta', 'conteudo-semana', 'revisor'],
    bridge: 'Seu terreno é memória (SQLite), conectores (MCP) e RAG. Tem iscas grátis disso — e o Arsenal completo traz a biblioteca inteira + o Método P.R.O.©.',
  },
};
