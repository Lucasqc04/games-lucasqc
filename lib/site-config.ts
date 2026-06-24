export const siteConfig = {
  siteName: "LucasQC Games",
  shortName: "Games",
  tagline: "Jogos clássicos completos direto no navegador",
  description:
    "games.lucasqc.com reúne jogos clássicos em versões jogáveis no navegador, com controles para desktop e celular, estatísticas locais e foco em privacidade.",
  url: "https://games.lucasqc.com",
  contactEmail: "contato@games.lucasqc.com",
};

export const makeAbsoluteUrl = (path: string): string =>
  path.startsWith("/") ? `${siteConfig.url}${path}` : `${siteConfig.url}/${path}`;
