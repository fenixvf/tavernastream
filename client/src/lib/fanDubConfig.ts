/**
 * Configuração de Fã Dublagem
 * 
 * Para adicionar uma nova obra de fã dublagem:
 * 1. Encontre o ID do TMDB da obra (exemplo: https://www.themoviedb.org/movie/12345)
 * 2. Adicione o ID e o nome do estúdio abaixo
 * 3. Configure os URLs dos repositórios do GitHub (FANDUB_MOVIES_GITHUB_URL e FANDUB_SERIES_GITHUB_URL)
 * 
 * O sistema automaticamente:
 * - Busca o link do Google Drive no GitHub baseado no ID do TMDB
 * - Busca as informações da obra no TMDB (poster, sinopse, etc)
 * - Adiciona a categoria "Fã Dublagem" no navegar e na página inicial
 * - Exibe o botão "Estúdio" com link para a rede social
 */

export interface FanDubItem {
  tmdbId: number;                // ID da obra no TMDB
  mediaType: 'movie' | 'tv';     // Tipo: 'movie' para filmes, 'tv' para séries
  studioName: string;            // Nome do estúdio de fãs
  studioSocialUrl: string;       // Link da rede social do estúdio (Instagram, Twitter, etc)
}

export const fanDubConfig: FanDubItem[] = [
  // Adicione suas obras de fã dublagem aqui seguindo o exemplo abaixo:
  
  // Exemplo:
  // {
  //   tmdbId: 12345,
  //   mediaType: 'movie',
  //   studioName: 'Estúdio Fã Dubladores',
  //   studioSocialUrl: 'https://instagram.com/estudiofans',
  // },

  {
    tmdbId: 12345,
    mediaType: 'tv',
    studioName: 'Estúdio Fã Dubladores',
    studioSocialUrl: 'https://instagram.com/estudiofans'
  }
];

// URLs dos repositórios do GitHub com os links de fandub
// Estes arquivos devem ter a estrutura: { "tmdbId": "url_do_drive", ... }
export const FANDUB_MOVIES_GITHUB_URL = 'https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/filmes.json';
export const FANDUB_SERIES_GITHUB_URL = 'https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/series.json';
