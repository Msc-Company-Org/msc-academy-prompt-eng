/**
 * Conteúdo dos superpoderes da Isca A (subconjunto N1) — fonte única,
 * usada pela página de entrega da isca A e pelo resultado do Quiz (isca B).
 */

export type Peca = {
  id: string;
  tag: string;
  titulo: string;
  oque: string;
  comoUsar: string;
  prompt: string;
};

export const PECAS: Peca[] = [
  {
    id: 'copywriter',
    tag: 'Template 1 de 3',
    titulo: 'Copywriter de Ofertas',
    oque: 'Você responde 4 perguntas e ele devolve título, subtítulo, bullets, quebra de objeção e CTA.',
    comoUsar: 'Cola no ChatGPT ou Claude. Preenche os [colchetes]. Pronto.',
    prompt: `Você é um copywriter direto ao ponto, especialista em ofertas que vendem sem enrolar.

Vou te dar 4 informações. Com elas, escreva uma oferta completa.

1) O que eu vendo: [DESCREVA seu produto/serviço]
2) Pra quem: [SEU cliente ideal — quem é, o que sofre]
3) A maior dor que eu resolvo: [a dor nº 1]
4) Por que confiar em mim: [1 prova, número ou diferencial]

Entregue, nesta ordem:
- 3 opções de TÍTULO (uma linha, foco na transformação)
- 1 SUBTÍTULO que explica como funciona
- 5 BULLETS de benefício (resultado, não característica)
- 1 quebra da objeção mais comum (a desculpa + a resposta)
- 1 CHAMADA PRA AÇÃO clara

Tom: claro, humano, brasileiro. Sem palavra difícil. Sem promessa que eu não possa cumprir.`,
  },
  {
    id: 'reaproveita',
    tag: 'Template 2 de 3',
    titulo: 'Reaproveitador de Conteúdo (1 → 10)',
    oque: 'Pega 1 conteúdo (texto, vídeo ou áudio) e devolve 10 peças, mantendo sua mensagem.',
    comoUsar: 'Cola seu conteúdo no lugar indicado e roda. Use no fim de toda gravação.',
    prompt: `Você transforma 1 conteúdo em 10 peças, mantendo minha mensagem central.

Conteúdo de origem (texto, transcrição de vídeo ou áudio):
[COLE AQUI]

Meu público: [quem é]
Meu objetivo: [educar / vender / engajar]

Gere, a partir do MESMO conteúdo:
1) 1 carrossel (5 cards, com o título de cada card)
2) 3 legendas curtas, com 1 gancho cada
3) 1 roteiro de Reels/Short de 30s (fala + sugestão de corte)
4) 1 e-mail curto (assunto + corpo)
5) 3 ideias de título pro próximo conteúdo

Mantenha minha ideia central em todas. Não invente dado que não esteja no original.`,
  },
  {
    id: 'atendente',
    tag: 'Template 3 de 3',
    titulo: 'Atendente que não perde venda',
    oque: 'Responde o cliente de um jeito que aproxima a venda — sem robótico, sem agressivo.',
    comoUsar: 'Preenche as informações fixas 1 vez. Depois é só colar a mensagem do cliente.',
    prompt: `Você é meu atendente comercial. Seu trabalho: responder o cliente de forma que aproxime a venda, sem ser robótico nem agressivo.

Minha empresa: [o que você faz]
Meu tom: [ex.: caloroso e direto]
Informações fixas (preço, prazo, garantia, formas de pagamento): [liste aqui]

Quando eu colar a mensagem do cliente, você:
1) Responde a dúvida de forma clara e curta
2) Devolve com 1 pergunta que avança a conversa
3) Se for objeção (preço, tempo, "vou pensar"): responde com empatia + 1 motivo real pra decidir agora
4) NUNCA promete o que não está nas informações fixas

Mensagem do cliente:
[COLE AQUI]`,
  },
  {
    id: 'pesquisa-oferta',
    tag: 'Fluxo 1 de 2',
    titulo: 'Pesquisa → Oferta',
    oque: 'Duas etapas encadeadas: primeiro a IA pesquisa seu público, depois usa a pesquisa pra escrever a oferta.',
    comoUsar: 'Roda a Etapa 1, cola o resultado na Etapa 2. A oferta sai na linguagem do cliente.',
    prompt: `ETAPA 1 — Pesquisa de público
Você é pesquisador de mercado. Sobre o público [descreva], me entregue:
- As 3 maiores dores
- Os 3 desejos por trás dessas dores
- As 3 objeções pra comprar
- As palavras que essas pessoas usam (as delas, não as do "marketing")

———

ETAPA 2 — Oferta (cole aqui o resultado da Etapa 1)
Agora, usando a pesquisa acima, escreva uma oferta pra [seu produto]:
- Título que fala da dor nº 1
- 5 bullets que respondem aos 3 desejos
- Quebra das 3 objeções
- CTA
Use as palavras do público, não as minhas.`,
  },
  {
    id: 'conteudo-semana',
    tag: 'Fluxo 2 de 2',
    titulo: 'Conteúdo da Semana',
    oque: 'Três etapas: temas da semana → roteiro do escolhido → multiplica em legenda/carrossel/Reels.',
    comoUsar: 'Roda toda segunda. Cada etapa puxa a anterior. Sua semana de conteúdo em minutos.',
    prompt: `ETAPA 1 — Temas
Me dê 5 temas de conteúdo desta semana pra [público], conectados a [meu produto/serviço].
Pra cada tema, diga o ângulo: dor, desejo, erro comum, bastidor ou prova.

———

ETAPA 2 — Roteiro
Escolho o tema [X]. Escreva um roteiro de post/vídeo:
gancho (primeiros 3s) + desenvolvimento (3 pontos) + fechamento com CTA suave.

———

ETAPA 3 — Multiplicar
Transforme esse roteiro em: 1 legenda, 1 carrossel de 5 cards e 1 ideia de Reels.`,
  },
  {
    id: 'revisor',
    tag: 'Skill avançada',
    titulo: 'Revisor de Marca (seu tom de voz)',
    oque: 'Reescreve qualquer texto no SEU tom. Você define o perfil 1 vez e reusa pra sempre.',
    comoUsar: 'Preenche o "perfil de voz" uma vez e salva. Depois é só colar o texto a revisar.',
    prompt: `# Skill: Revisor de Marca

Você reescreve qualquer texto no MEU tom de voz, definido pelo perfil abaixo.
Preencho o perfil uma vez e reuso sempre.

## Meu perfil de voz
- Como eu falo: [ex.: direto, caloroso, sem jargão]
- 3 palavras que são a minha cara: [____, ____, ____]
- 3 palavras que eu NUNCA uso: [____, ____, ____]
- Com quem eu falo: [meu público]
- O que eu nunca faço: [ex.: prometer resultado, usar "garantido"]

## O que você faz
Quando eu colar um texto, devolva:
1) A versão reescrita no meu tom
2) O que você mudou e por quê (2 linhas)
Não invente fato novo. Mantenha o sentido.

Texto:
[COLE AQUI]`,
  },
];

export const METODO = {
  titulo: 'Método P.R.O.© — a página que te deixa independente',
  intro: 'Os superpoderes resolvem hoje. Esta página te ensina a consertar e criar os seus quando a IA mudar.',
  itens: [
    { letra: 'P', nome: 'Papel & Padrão', txt: 'Todo superpoder começa definindo o papel da IA (quem ela é, o contexto) e o formato fixo da resposta. Salve isso como um padrão — é o que faz funcionar sempre.' },
    { letra: 'R', nome: 'Refino em ciclo', txt: 'A 1ª resposta quase nunca é a final. Rode → avalie com um critério → ajuste uma coisa por vez. O erro do iniciante é desistir na primeira tentativa morna.' },
    { letra: 'O', nome: 'Orquestração', txt: 'Encadeie superpoderes (como nos 2 fluxos): um puxa o outro e o trabalho anda quase sozinho. É aqui que a IA vira um "funcionário".' },
  ],
};

export const byId = (id: string): Peca | undefined => PECAS.find((p) => p.id === id);

/** Superpoderes AVANÇADOS (N2/N3) — "sem programar, mas com passo a passo guiado". Só na área de membros. */
export type PecaAvancada = {
  id: string;
  nivel: 'N2 — Conecta' | 'N3 — Orquestra';
  titulo: string;
  oque: string;
  passos: string[];
  codigo?: { label: string; texto: string };
};

export const PECAS_AVANCADAS: PecaAvancada[] = [
  {
    id: 'memoria-sqlite',
    nivel: 'N2 — Conecta',
    titulo: 'Cérebro do Negócio — Memória SQLite',
    oque: 'Dá à IA uma memória que ela controla: clientes, produtos, decisões — num arquivo .db que é seu. Ela para de esquecer seu contexto a cada conversa.',
    passos: [
      'Instala o Claude Desktop (claude.ai/download) — é grátis e roda no seu computador.',
      'Cria uma pasta "arsenal-memoria" e salva o arquivo de esquema abaixo como schema.sql.',
      'Abre o terminal nessa pasta e roda o comando de criação (cola, não precisa entender).',
      'Pronto: você tem um banco memoria.db. No próximo superpoder você liga ele ao Claude.',
    ],
    codigo: {
      label: 'schema.sql + comando de criação',
      texto: `-- salva como schema.sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT, contato TEXT, notas TEXT);
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, preco TEXT, detalhes TEXT);
CREATE TABLE decisoes (id INTEGER PRIMARY KEY, data TEXT, assunto TEXT, decisao TEXT);
CREATE TABLE fatos   (id INTEGER PRIMARY KEY, chave TEXT, valor TEXT);

# no terminal, dentro da pasta (Windows/Mac):
sqlite3 memoria.db < schema.sql`,
    },
  },
  {
    id: 'mcp-sqlite',
    nivel: 'N2 — Conecta',
    titulo: 'MCP de SQLite — o fio da memória',
    oque: 'Liga a memória do superpoder anterior ao Claude. A partir daqui, é só pedir em português: "guarda esse cliente", "o que eu decidi semana passada?".',
    passos: [
      'Abre o Claude Desktop → Configurações → Developer → Editar config.',
      'Cola o bloco abaixo, trocando CAMINHO pela pasta onde está seu memoria.db.',
      'Fecha e reabre o Claude. Vai aparecer o "martelo" (ferramentas) — sinal de que conectou.',
      'Testa: "Guarda na memória que o cliente João prefere contato por WhatsApp." Depois: "O que você sabe do João?"',
    ],
    codigo: {
      label: 'claude_desktop_config.json',
      texto: `{
  "mcpServers": {
    "memoria": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "CAMINHO/memoria.db"]
    }
  }
}`,
    },
  },
  {
    id: 'mcp-arquivos',
    nivel: 'N2 — Conecta',
    titulo: 'Conector de Arquivos & Planilhas — MCP',
    oque: 'Deixa a IA ler e organizar seus arquivos e planilhas locais. Em vez de copiar e colar, ela trabalha direto nos seus documentos.',
    passos: [
      'No mesmo arquivo de config do Claude, adiciona o bloco "arquivos" abaixo.',
      'Troca CAMINHO_DA_PASTA pela pasta que você quer liberar (ex.: sua pasta de trabalho).',
      'Reabre o Claude. Agora peça: "Resume os 3 últimos arquivos dessa pasta."',
      'Dica de segurança: libere só a pasta que precisa, não o computador inteiro.',
    ],
    codigo: {
      label: 'bloco a adicionar em mcpServers',
      texto: `"arquivos": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "CAMINHO_DA_PASTA"]
}`,
    },
  },
  {
    id: 'cli-lote',
    nivel: 'N2 — Conecta',
    titulo: 'Operações em Lote — Receitas de CLI',
    oque: 'Tarefas repetidas (renomear, organizar, extrair texto de muitos arquivos) viram 1 comando. Você não precisa entender — precisa colar e trocar a pasta.',
    passos: [
      'Abre o terminal (Windows: PowerShell · Mac: Terminal).',
      'Escolhe a receita abaixo, cola e troca o que está EM_MAIUSCULO.',
      'Roda primeiro numa pasta de teste, pra ver o efeito sem risco.',
    ],
    codigo: {
      label: 'receitas (PowerShell / Terminal)',
      texto: `# Renomear todos os .jpg de uma pasta com prefixo (PowerShell):
Get-ChildItem *.jpg | ForEach-Object -Begin {$i=1} -Process { Rename-Item $_ ("PREFIXO-{0:D3}.jpg" -f $i); $i++ }

# Juntar todos os .txt de uma pasta num só (Mac/Linux):
cat *.txt > tudo-junto.txt

# Listar os 20 arquivos mais pesados de uma pasta (Mac/Linux):
du -ah . | sort -rh | head -20`,
    },
  },
  {
    id: 'hook-guardiao',
    nivel: 'N3 — Orquestra',
    titulo: 'Guardião de Qualidade — Hook',
    oque: 'Um gatilho que roda ANTES de você publicar/enviar: passa o texto pelo Revisor de Marca e checa erros — automaticamente, toda vez. Você não esquece a revisão porque ela vira automática.',
    passos: [
      'Pensa no seu "ponto de saída": onde você publica/envia (post, e-mail, proposta).',
      'Cola o protocolo abaixo no topo do seu projeto/agente (ou no Claude Code como instrução fixa).',
      'A partir daí, todo texto passa pelo guardião antes de sair. É a orquestração do Revisor (peça N1) virando processo.',
    ],
    codigo: {
      label: 'protocolo do hook (cola como instrução fixa)',
      texto: `REGRA FIXA — Guardião de Qualidade:
Antes de me entregar QUALQUER texto pronto pra publicar ou enviar, você SEMPRE:
1) Passa pelo meu perfil de voz (Revisor de Marca) e ajusta o tom.
2) Checa: erro de português? promessa que eu não posso cumprir? número sem fonte?
3) Me devolve com um selo no fim: "✅ Pronto pra publicar" ou "⚠️ revisar: <o quê>".
Nunca me entregue texto final sem passar por essas 3 etapas.`,
    },
  },
  {
    id: 'rag-pdfs',
    nivel: 'N3 — Orquestra',
    titulo: 'Consultor dos seus PDFs — Starter de RAG',
    oque: 'Joga seus manuais/PDFs numa pasta e pergunta em português; a IA responde com base nos SEUS documentos (não no chute). É um starter local — pra uso pessoal, não sistema de empresa.',
    passos: [
      'Junta seus PDFs/manuais numa pasta (ex.: "base-conhecimento").',
      'Liga o conector de arquivos (superpoder do MCP de Arquivos) nessa pasta.',
      'Cola o protocolo abaixo no Claude. Agora pergunte: "Com base nos arquivos da pasta, qual é a política de troca?"',
      'A IA vai ler os documentos antes de responder e citar de onde tirou.',
    ],
    codigo: {
      label: 'protocolo "responda só com base nos meus arquivos"',
      texto: `REGRA — Consultor de Documentos:
Quando eu perguntar algo sobre meus materiais, você:
1) Procura a resposta NOS arquivos da pasta liberada (não inventa).
2) Responde de forma curta e cita o nome do arquivo de onde tirou.
3) Se a resposta NÃO estiver nos arquivos, diz "não encontrei nos seus documentos" — nunca chuta.`,
    },
  },
];

export const HARNESS = {
  titulo: 'Bônus — Template de Harness "Agente-Funcionário"',
  oque: 'O molde de 1 página que costura tudo: define o papel, as ferramentas (quais superpoderes) e os limites — e a IA passa a operar como um funcionário virtual.',
  codigo: `# Agente-Funcionário — molde (preenche e cola no início do seu agente)

PAPEL: Você é meu [ex.: assistente de conteúdo / pré-vendas].
OBJETIVO: [o resultado que eu espero todo dia].
FERRAMENTAS QUE VOCÊ USA: [memória SQLite / arquivos / os superpoderes X e Y].
COMO TRABALHA: [passo a passo do que faz, na ordem].
LIMITES: [o que NUNCA faz — ex.: nunca promete prazo sem confirmar; nunca apaga arquivo].
QUANDO TRAVAR: [me pergunta em vez de inventar].`,
};
