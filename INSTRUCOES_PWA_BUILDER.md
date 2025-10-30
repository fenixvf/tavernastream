# 📱 Guia Completo: Como Converter Taverna Stream em APK com PWA Builder

## ✅ Problemas Resolvidos

### 1. **Ícones WebP → PNG**
- ✅ Os ícones foram convertidos de WebP para PNG verdadeiro
- ✅ Agora o PWA Builder aceita os ícones sem erros

### 2. **Package Name Inválido**
- ❌ ERRO: `Package name 'TavernaStream' at position AndroidManifest.xml:23`
- ✅ CORRIGIDO: Configurado como `com.tavernastream.app`

### 3. **Manifest Configurado**
- ✅ `start_url` corrigido de `tavernastream.onrender.com` para `/`
- ✅ Adicionado campo `id: "/"`
- ✅ Ícones com `purpose: "any"` (192x192 e 512x512 PNG)

---

## 🚀 Como Usar o PWA Builder

### Opção 1: Interface Web (Recomendado)

1. **Acesse**: https://www.pwabuilder.com

2. **Digite a URL do seu site**:
   ```
   https://tavernastream.onrender.com
   ```

3. **Clique em "Start"** e aguarde a análise

4. **Configure o Android Package**:
   
   Na seção "Android", configure:
   
   - **Package ID**: `com.tavernastream.app` ⚠️ IMPORTANTE!
   - **App name**: `Taverna Stream`
   - **Launcher name**: `Taverna`
   - **App version**: `1.0.0`
   - **Version code**: `1`
   - **Theme color**: `#dc2626`
   - **Background color**: `#000000`

5. **Opções Avançadas** (opcional):
   - ✅ Enable notifications
   - ✅ Enable site settings shortcut
   - Display: `Standalone`
   - Orientation: `Portrait`

6. **Generate Package**:
   - Escolha "Signing key": **New** (primeira vez)
   - Clique em **"Generate"**

7. **Download**:
   - Baixe o arquivo `.zip` gerado
   - Dentro terá o arquivo `.aab` ou `.apk`

---

### Opção 2: Usando o Arquivo de Configuração

O arquivo `.pwabuilder` já está configurado em `client/public/.pwabuilder` com:

```json
{
  "packageId": "com.tavernastream.app",
  "name": "Taverna Stream",
  "launcherName": "Taverna",
  "host": "https://tavernastream.onrender.com",
  ...
}
```

Este arquivo pode ser:
- Usado para regenerar builds com as mesmas configurações
- Editado para mudar versões e configurações

---

## ⚠️ IMPORTANTE: Package ID

### O que NÃO fazer:
❌ `TavernaStream` (sem pontos, inválido)  
❌ `taverna-stream.app` (hífen não permitido)  
❌ `Taverna.Stream` (letras maiúsculas não recomendadas)  
❌ `com..tavernastream.twa` (ponto duplo inválido)

### O que fazer:
✅ `com.tavernastream.app` (formato correto)  
✅ `app.tavernastream` (alternativa válida)  
✅ `io.github.tavernastream` (se usar GitHub Pages)

**Regras:**
- Pelo menos 2 segmentos separados por `.`
- Letras minúsculas preferidas
- Apenas letras, números, underscores e pontos
- Cada segmento deve começar com letra
- Uma vez publicado no Google Play, **não pode ser alterado**

---

## 📦 Arquivos Importantes

### `manifest.json`
Localização: `client/public/manifest.json`

Campos importantes para PWA:
```json
{
  "id": "/",
  "name": "Taverna Stream",
  "short_name": "Taverna",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

### Ícones
- `icon-192.png` - 192x192 pixels (PNG) ✅
- `icon-512.png` - 512x512 pixels (PNG) ✅
- Originais WebP salvos como backup: `icon-192.webp`, `icon-512.webp`

---

## 🔐 Signing Key (Chave de Assinatura)

### Primeira vez:
- Escolha **"New"** no PWA Builder
- Ele gerará uma chave automaticamente
- **GUARDE O ARQUIVO `.keystore`** que vem no ZIP!

### Atualizações futuras:
- Use a **mesma chave** de assinatura
- Sem a chave original, você não pode atualizar o app na Play Store
- Configure no `.pwabuilder`:
  ```json
  "signing": {
    "file": "path/to/your.keystore",
    "alias": "your-alias",
    "storePassword": "your-store-password",
    "keyPassword": "your-key-password"
  }
  ```

---

## 🎯 Próximos Passos

### Depois de gerar o APK:

1. **Testar localmente**:
   - Instale o APK no seu celular Android
   - Teste todas as funcionalidades

2. **Publicar na Google Play Store**:
   - Crie uma conta de desenvolvedor (taxa única de $25 USD)
   - Acesse: https://play.google.com/console
   - Crie um novo app
   - Faça upload do arquivo `.aab` (Android App Bundle)
   - Preencha as informações obrigatórias
   - Submeta para revisão

3. **Digital Asset Links** (Remove a URL bar):
   - Adicione o arquivo `.well-known/assetlinks.json` no seu servidor
   - PWA Builder fornece este arquivo no ZIP
   - Hospede em: `https://tavernastream.onrender.com/.well-known/assetlinks.json`

---

## 🐛 Troubleshooting

### Erro: "Icon not found"
- Certifique-se que `https://tavernastream.onrender.com/icon-192.png` está acessível
- Verifique que o ícone é PNG real, não WebP

### Erro: "Invalid package name"
- Use apenas `com.tavernastream.app` (sem modificações)
- Não use espaços, hífens ou caracteres especiais

### Erro: "Manifest not valid"
- Verifique que `https://tavernastream.onrender.com/manifest.json` está acessível
- Valide o JSON em: https://www.jsonlint.com

### Build demora muito
- Normal! Pode levar 2-5 minutos
- PWA Builder está compilando o app completo

---

## 📝 Checklist Final

Antes de gerar o APK:

- ✅ Manifest.json configurado corretamente
- ✅ Ícones PNG 192x192 e 512x512 disponíveis
- ✅ Site publicado e acessível (tavernastream.onrender.com)
- ✅ Package ID definido: `com.tavernastream.app`
- ✅ Service Worker funcionando (opcional mas recomendado)
- ✅ HTTPS habilitado (obrigatório)

---

## 🆘 Suporte

Se encontrar problemas:
- GitHub Issues: https://github.com/pwa-builder/PWABuilder/issues
- Documentação: https://docs.pwabuilder.com
- Validador de Manifest: https://www.pwabuilder.com

---

**Boa sorte com a publicação do Taverna Stream! 🎬🍿**
