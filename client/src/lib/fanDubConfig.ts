/**
 * Configuração de Fã Dublagem
 * 
 * Para adicionar uma nova obra de fã dublagem:
 * 1. Encontre o ID do TMDB da obra (exemplo: https://www.themoviedb.org/movie/12345)
 * 2. Adicione o link direto do Google Drive (Player 2)
 * 3. Adicione as informações do estúdio que fez a dublagem
 * 
 * O sistema automaticamente:
 * - Busca as informações da obra no TMDB (poster, sinopse, etc)
 * - Adiciona a categoria "Fã Dublagem" no navegar
 * - Exibe o botão "Estúdio" com link para a rede social
 */

export interface FanDubItem {
  tmdbId: number;                // ID da obra no TMDB
  mediaType: 'movie' | 'tv';     // Tipo: 'movie' para filmes, 'tv' para séries
  title: string;                 // Título da obra (opcional, será buscado do TMDB)
  driveUrl: string;              // Link direto do Google Drive
  studioName: string;            // Nome do estúdio de fãs
  studioSocialUrl: string;       // Link da rede social do estúdio (Instagram, Twitter, etc)
}

export const fanDubConfig: FanDubItem[] = [
  // Adicione suas obras de fã dublagem aqui seguindo o exemplo abaixo:
  
  // Exemplo:
  // {
  //   tmdbId: 12345,
  //   mediaType: 'movie',
  //   title: 'Nome do Filme',
  //   driveUrl: 'https://drive.google.com/file/d/ID_DO_ARQUIVO/view',
  //   studioName: 'Estúdio Fã Dubladores',
  //   studioSocialUrl: 'https://instagram.com/estudiofans',
  // },
];
