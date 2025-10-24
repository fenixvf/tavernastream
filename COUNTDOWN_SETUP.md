# 📅 Como Configurar o Cronômetro de Lançamento

O TavernaStream possui um sistema de cronômetro integrado que permite configurar contagens regressivas para novos conteúdos.

## 🔧 Configuração

Para ativar e configurar o cronômetro, edite o arquivo `client/src/lib/releaseConfig.ts`:

```typescript
export const releaseConfig: ReleaseConfig = {
  enabled: true, // Ativar ou desativar o cronômetro
  targetTmdbId: 123456, // ID do TMDB do filme/série
  targetMediaType: 'movie', // 'movie' ou 'tv'
  targetTitle: 'Nome do Filme/Série', // Nome que aparecerá
  releaseTimestamp: Date.now() + (24 * 60 * 60 * 1000), // Timestamp de lançamento
  backdropPath: '/path/to/backdrop.jpg', // Caminho da imagem (opcional)
};
```

## 📝 Exemplo Prático

### Lançar um filme em 7 dias:

```typescript
export const releaseConfig: ReleaseConfig = {
  enabled: true,
  targetTmdbId: 533535,
  targetMediaType: 'movie',
  targetTitle: 'Deadpool & Wolverine',
  releaseTimestamp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 dias
  backdropPath: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
};
```

### Lançar uma série em 3 horas:

```typescript
export const releaseConfig: ReleaseConfig = {
  enabled: true,
  targetTmdbId: 94605,
  targetMediaType: 'tv',
  targetTitle: 'Arcane: League of Legends',
  releaseTimestamp: Date.now() + (3 * 60 * 60 * 1000), // 3 horas
  backdropPath: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
};
```

## 🕐 Calculando Timestamps

### Usar data específica:
```typescript
const targetDate = new Date('2025-12-25 18:00:00');
releaseTimestamp: targetDate.getTime()
```

### Calcular a partir de agora:
```typescript
// Minutos
releaseTimestamp: Date.now() + (30 * 60 * 1000) // 30 minutos

// Horas  
releaseTimestamp: Date.now() + (5 * 60 * 60 * 1000) // 5 horas

// Dias
releaseTimestamp: Date.now() + (10 * 24 * 60 * 60 * 1000) // 10 dias
```

## 🎨 Funcionalidades

### Popup Expansível
- **Minimizado**: Mostra apenas o tempo restante
- **Expandido**: Exibe poster, título, e contagem detalhada (dias, horas, minutos)

### Notificação de Lançamento
Quando o conteúdo é liberado, aparece automaticamente:
- Toast: "Novo conteúdo chegou!"
- Mensagem: "{Nome do Título} já está disponível!"
- Duração: 10 segundos

### Auto-Ocultar
O cronômetro desaparece automaticamente quando o conteúdo é liberado.

## 🎯 Onde Obter o Backdrop Path

O `backdropPath` é obtido da API do TMDB. Exemplo para filmes:

```
GET https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}&language=pt-BR
```

Na resposta, procure por `backdrop_path`:
```json
{
  "backdrop_path": "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
  ...
}
```

## ⚠️ Importante

- Para **desativar** o cronômetro, defina `enabled: false`
- O cronômetro aparece no canto inferior direito da tela (acima da navegação mobile)
- O timestamp deve estar em **milissegundos** (use `.getTime()` ou `Date.now()`)
