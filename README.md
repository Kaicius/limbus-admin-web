# Limbus Admin Web

Painel administrativo (Angular 22) para gerenciar o catálogo do gacha: **Identities**, **E.G.O.** e **Banners**. Consome a `limbus-admin-api`.

## Páginas

| Rota | O que faz |
| --- | --- |
| `/identities` | CRUD de identities (raridade 0 / 00 / 000, artes de Uptie I e III, cutscene, vídeo de obtenção, quote e tempo do reveal) |
| `/egos` | CRUD de E.G.O. (arte e vídeo de obtenção) |
| `/banners` | CRUD de banners: thumbnail, ativo/inativo e seleção de identities por raridade + E.G.O. |

Identities **0** só pedem a arte; o nome é gerado automaticamente (`LCB Sinner X`).
Os campos de mídia sobem direto para o **Cloudinary** (cloud `kaicius`, preset unsigned `limbus`) e mostram preview. Nos vídeos, o botão **"Usar tempo atual"** preenche o `revealAt`.

## Rodando local

```bash
npm install
npm start        # ng serve → http://localhost:4200
```

Precisa da `limbus-admin-api` rodando em `http://localhost:8080`.

A URL da API é escolhida em `src/app/services/api.ts`:

- `localhost` → `http://localhost:8080`
- qualquer outro host → `https://limbus-admin-api.onrender.com`

## Deploy (Vercel)

1. Importe o repositório na Vercel (framework: Angular).
2. Build: `npm run build` · Output: `dist/limbus-admin-web/browser`.
3. O `vercel.json` já redireciona todas as rotas para o `index.html`.
4. Adicione a URL da Vercel na variável `CORS_ORIGINS` da admin-api no Render.

## Estrutura

```
src/app/
├── services/      api.ts (tipos + chamadas HTTP), upload.ts (Cloudinary)
├── shared/        media-field (upload com preview)
├── pages/         identities, egos, banners (listas e formulários)
├── app.routes.ts
└── app.html       navegação
```
