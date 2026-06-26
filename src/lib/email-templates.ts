/**
 * Conteúdo dos e-mails de ENTREGA da isca (transacionais, disparados no opt-in).
 * Copy real, storytelling leve, 1 CTA. Sem exigir nome (forms não coletam) — saudação calorosa.
 * A régua de nutrição/carrinho/pós-compra (N/C/P) é desenhada à parte (Fase 3).
 */
import { SITE, unsubUrlFor, type EmailParts } from './email';
import { SUPERPODER_LABEL, type Segment } from './quiz';

const enc = encodeURIComponent;

export type DeliveryLead = {
  email: string;
  profissao?: string | null;
  isca: string;
  quiz_result?: string | null;
};

export type BuiltEmail = {
  subject: string;
  parts: EmailParts;
  tags: { name: string; value: string }[];
};

function linkEntrega(path: string, qs: Record<string, string>, content: string) {
  const params = new URLSearchParams({
    ...qs,
    utm_source: 'email',
    utm_medium: 'crm',
    utm_campaign: 'arsenal_entrega',
    utm_content: content,
  });
  return `${SITE}/entrega/${path}?${params.toString()}`;
}

/** Monta o e-mail de entrega conforme a isca. Retorna null se a isca for desconhecida. */
export function buildDeliveryEmail(lead: DeliveryLead): BuiltEmail | null {
  const unsubUrl = unsubUrlFor(lead.email);
  const prof = (lead.profissao || '').trim();

  switch (lead.isca) {
    case 'arsenal-7': {
      const link = linkEntrega('arsenal-7', prof ? { p: prof } : {}, 'ea1');
      return {
        subject: 'Seus 7 superpoderes de IA tão aqui (sem codar)',
        tags: [{ name: 'fluxo', value: 'entrega' }, { name: 'email_id', value: 'ea1' }],
        parts: {
          preheader: 'Link no topo. Mas lê 20 segundos antes — começa pelos da sua área.',
          heroTitulo: 'Seus 7 superpoderes tão liberados.',
          corpoHtml: `
            <p>Fala! Aqui é o Moisés.</p>
            <p>Seus <strong>7 superpoderes de IA</strong> estão liberados — clica no botão abaixo e pega.</p>
            <p>Salva este e-mail. Você vai querer voltar nele.</p>
            <p>Agora, 20 segundos do que você tem em mãos.</p>
            <p>Isso não é um PDF de "100 prompts mágicos" que ninguém abre.</p>
            <p>São 7 peças que funcionam — você copia, cola e roda <strong>hoje</strong>.</p>
            <p>Tem templates da sua área, fluxos que encadeiam uma IA na outra, uma skill avançada e uma página do Método P.R.O.© pra você adaptar tudo.</p>
            <p>Faz assim: começa pelos da sua área.</p>
            <p>Pega aquela tarefa que você sempre faz na mão e roda o template nela.</p>
            <p>A diferença não é a IA ficar mais inteligente. É você parar de começar do zero.</p>
            <p>Essas 7 são uma amostra fixa e suas pra sempre — o arsenal completo tem dezenas, e cresce toda semana.</p>
            <p>Mas isso é papo pros próximos dias. Por hoje: <strong>baixa e testa</strong>.</p>`,
          ctaLabel: 'PEGAR MEUS 7 SUPERPODERES',
          ctaUrl: link,
          psHtml: 'P.S. — me responde uma coisa: qual das peças te economizou mais tempo? (eu leio)',
          unsubUrl,
        },
      };
    }

    case 'quiz': {
      const segKey = (lead.quiz_result || '') as Segment;
      const sp = SUPERPODER_LABEL[segKey] || 'seu superpoder';
      const link = linkEntrega('quiz', lead.quiz_result ? { seg: lead.quiz_result } : {}, 'eb1');
      return {
        subject: `Seu superpoder de IA é: ${sp}`,
        tags: [{ name: 'fluxo', value: 'entrega' }, { name: 'email_id', value: 'eb1' }],
        parts: {
          preheader: 'O que ele faz por você — e como ativar nos próximos 2 minutos.',
          heroTitulo: 'Saiu o seu resultado.',
          corpoHtml: `
            <p>Seu superpoder de IA é o <strong>${sp}</strong>.</p>
            <p>Em gente normal: é o jeito de usar IA que mais combina com como você já trabalha — e onde você vai sentir resultado mais rápido.</p>
            <p>Ele está aqui, pronto pra ativar — e junto liberei mais 6 peças do arsenal pra você não ficar só com uma:</p>
            <p>A maioria abre a IA e pede tudo do mesmo jeito morno.</p>
            <p>Aí recebe resposta morna e conclui que "IA é superestimada".</p>
            <p>Não é. Faltava a ferramenta certa pro seu perfil.</p>
            <p>Faz o teste hoje: ativa o ${sp} numa tarefa real e vê o que muda.</p>`,
          ctaLabel: 'ATIVAR MEU SUPERPODER',
          ctaUrl: link,
          psHtml: 'P.S. — depois me responde contando se bateu com você. (eu leio de verdade)',
          unsubUrl,
        },
      };
    }

    case 'guia-memoria': {
      const link = linkEntrega('guia-memoria', {}, 'ec1');
      return {
        subject: 'Seu mini-guia: dê memória à sua IA (passo a passo)',
        tags: [{ name: 'fluxo', value: 'entrega' }, { name: 'email_id', value: 'ec1' }],
        parts: {
          preheader: 'O passo a passo + os arquivos prontos. Sem ser programador.',
          heroTitulo: 'Sua 1ª memória de IA, liberada.',
          corpoHtml: `
            <p>Fala! Aqui é o Moisés.</p>
            <p>Seu mini-guia pra dar <strong>memória</strong> à IA (com SQLite, sem ser programador) está liberado.</p>
            <p>Vem com o passo a passo, o esquema pronto e os comandos pra copiar.</p>
            <p>É a peça que mais muda o jogo: a IA para de esquecer seu contexto a cada conversa.</p>
            <p>Reserva uma tarde, segue o guia, e no fim você tem uma base que é sua.</p>`,
          ctaLabel: 'ABRIR MEU MINI-GUIA',
          ctaUrl: link,
          psHtml: 'P.S. — isso é uma peça. O conector (MCP), o RAG dos seus PDFs e a orquestração estão no Arsenal completo.',
          unsubUrl,
        },
      };
    }

    case 'starter-mcp': {
      const link = linkEntrega('starter-mcp', {}, 'ed1');
      return {
        subject: 'Seu Starter MCP/CLI tá liberado (instala em 10 min)',
        tags: [{ name: 'fluxo', value: 'entrega' }, { name: 'email_id', value: 'ed1' }],
        parts: {
          preheader: 'Um conector + 5 comandos que automatizam seu dia. Com prints.',
          heroTitulo: 'Seu Starter MCP/CLI, liberado.',
          corpoHtml: `
            <p>Fala! Aqui é o Moisés.</p>
            <p>Seu <strong>Starter MCP/CLI</strong> está liberado: 1 conector pronto + 5 comandos que automatizam tarefa repetida.</p>
            <p>Vem com README e prints — você cola, aponta e roda.</p>
            <p>Em 10 minutos a IA deixa de só "falar" e passa a <strong>fazer</strong> coisa de verdade no seu setup.</p>`,
          ctaLabel: 'PEGAR MEU STARTER',
          ctaUrl: link,
          psHtml: 'P.S. — esse é 1 conector. A biblioteca de conectores, memória e hooks está no Arsenal completo.',
          unsubUrl,
        },
      };
    }

    default:
      return null;
  }
}

/** E-mail de pós-compra (P1) — entrega o acesso à área de membros. */
export function buildPurchaseEmail(email: string, accessUrl: string, produto = 'arsenal'): BuiltEmail {
  const isTripwire = produto === 'tripwire';
  return {
    subject: isTripwire ? '🎉 Tá liberado! Seu Kit + uma porta que abre agora' : '🎉 Tá liberado! Seu Arsenal completo + como começar',
    tags: [{ name: 'fluxo', value: 'posvenda' }, { name: 'email_id', value: 'p1' }],
    parts: {
      preheader: 'Seu acesso vitalício está aqui. Login no botão + o 1º superpoder pra instalar hoje.',
      heroTitulo: isTripwire ? 'Bem-vindo! Seu Kit tá liberado.' : 'Bem-vindo ao Arsenal completo.',
      corpoHtml: `
        <p>Pagamento confirmado — obrigado pela confiança. 🙏</p>
        <p>Seu acesso é <strong>vitalício</strong>: entra quando quiser, e tudo que entrar de novo na biblioteca já é seu.</p>
        <p>Clica no botão pra abrir sua área de membros:</p>
        <p>Faz o seguinte hoje: abre, escolhe <strong>1 superpoder</strong> e instala numa tarefa real.</p>
        <p>Não tenta ver tudo de uma vez — instala 1, sente o resultado, volta amanhã pro próximo.</p>
        <p>É isso que separa quem usa de quem só comprou.</p>
        ${isTripwire ? '<p>E olha o e-mail de boas-vindas — tem uma oferta de upgrade pro Arsenal completo que só abre agora.</p>' : ''}`,
      ctaLabel: 'ABRIR MINHA ÁREA DE MEMBROS',
      ctaUrl: accessUrl,
      psHtml: 'P.S. — salva este e-mail. O link de acesso é seu, pessoal e vitalício. Qualquer coisa, é só responder aqui.',
      unsubUrl: unsubUrlFor(email),
    },
  };
}
