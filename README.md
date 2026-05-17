# AI PDF Chat MVP

This repository contains a 3-day MVP scaffold for an AI PDF chat assistant built with Next.js, TypeScript, Supabase pgvector, and the Vercel AI SDK.

## Current status

- Architecture scaffolded
- Service boundaries defined
- SQL schema prepared
- UI skeleton prepared
- Feature implementations pending

## Target MVP

- Upload one text-based PDF
- Extract text by page
- Chunk and embed the document
- Store vectors in Supabase
- Generate summary, key concepts, and suggested questions
- Ask questions grounded in the uploaded PDF
- Show source-backed answers

## Environment setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy [.env.example](/C:/Users/Louis/Desktop/pdf_chatbot/.env.example) to `.env.local`.
4. Set your Supabase values and choose an AI provider.
5. Apply [sql/schema.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/schema.sql) in Supabase SQL Editor.

If you already created the database with the older fixed-size `vector(1536)` schema and now switch to a provider like Zhipu whose embeddings use a different dimension, also run [sql/migrations/20260517_relax_embedding_dimensions.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/migrations/20260517_relax_embedding_dimensions.sql).

### Provider configuration

The project is intentionally not locked to one provider. These variables define the provider contract:

```env
AI_PROVIDER=zhipu
AI_CHAT_PROVIDER=zhipu
AI_EMBEDDING_PROVIDER=zhipu
AI_CHAT_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_EMBEDDING_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_CHAT_MODEL=glm-4.7-flash
AI_EMBEDDING_MODEL=embedding-3
```

Supported provider ids in the scaffold:

- `openai`
- `zhipu`
- `deepseek`
- `dashscope`
- `anthropic`
- `google`
- `openrouter`

`AI_PROVIDER` remains the legacy default. If you want to split chat and embedding providers, use:

```env
AI_CHAT_PROVIDER=dashscope
AI_EMBEDDING_PROVIDER=deepseek
```

If you need to route requests through an OpenAI-compatible gateway, also set:

```env
AI_CHAT_BASE_URL=https://your-gateway.example/v1
AI_EMBEDDING_BASE_URL=https://your-gateway.example/v1
```

Current implementation detail:

- Chat generation is implemented through OpenAI-compatible HTTP endpoints
- Embedding generation is implemented for `openai`, `zhipu`, `deepseek`, and `dashscope`
- `zhipu`, `deepseek`, and `dashscope` use their OpenAI-compatible HTTP APIs in this project

### 智谱 BigModel / GLM-4.7-Flash

According to Zhipu's official docs:

- Chat completions endpoint: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- Embeddings endpoint: `https://open.bigmodel.cn/api/paas/v4/embeddings`
- Free chat model: `glm-4.7-flash`
- Official embedding model example: `embedding-3`
- Important: `glm-4.7-flash` can help you avoid chat cost at first, but this app still needs embeddings for retrieval, so the end-to-end RAG flow is not fully free.

You can use this config directly:

```env
AI_PROVIDER=zhipu
AI_CHAT_PROVIDER=zhipu
AI_EMBEDDING_PROVIDER=zhipu
AI_CHAT_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_EMBEDDING_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_CHAT_MODEL=glm-4.7-flash
AI_EMBEDDING_MODEL=embedding-3
ZHIPU_API_KEY=your_zhipu_api_key
```

### Ready-to-use examples

#### DeepSeek

```env
AI_PROVIDER=deepseek
AI_CHAT_PROVIDER=deepseek
AI_EMBEDDING_PROVIDER=deepseek
AI_CHAT_BASE_URL=https://api.deepseek.com
AI_EMBEDDING_BASE_URL=https://api.deepseek.com
AI_CHAT_MODEL=deepseek-chat
AI_EMBEDDING_MODEL=text-embedding-3-small
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### 通义千问 / DashScope

```env
AI_PROVIDER=dashscope
AI_CHAT_PROVIDER=dashscope
AI_EMBEDDING_PROVIDER=dashscope
AI_CHAT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_CHAT_MODEL=qwen-plus
AI_EMBEDDING_MODEL=text-embedding-v4
DASHSCOPE_API_KEY=your_dashscope_api_key
```

## Current scaffolded modules

- Environment and provider config
- App Router pages and API entry points
- Shared types and constants
- SQL schema and vector search RPC
- UI skeleton for upload and chat

## Local run

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run test:unit
npm run typecheck
```

## Railway deploy

If you want to put this MVP online quickly, Railway is the recommended host for the current architecture.

Deployment guide:

- [docs/railway-deploy.md](/C:/Users/Louis/Desktop/pdf_chatbot/docs/railway-deploy.md)

## Deployment checklist

1. Create a Supabase project and run [sql/schema.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/schema.sql).
2. Create a storage bucket matching `SUPABASE_STORAGE_BUCKET` such as `pdf-files`.
3. Add all environment variables from [.env.example](/C:/Users/Louis/Desktop/pdf_chatbot/.env.example) to your deployment platform.
4. Confirm the selected chat and embedding providers both have valid API keys.
5. Upload one small text-based PDF locally before deployment to verify the full ingestion path.
6. Deploy the Next.js app to Vercel or another Node-compatible host.

## Known MVP limits

- Text-based PDFs only
- No OCR for scanned documents
- No multi-document chat yet
- No streaming chat response yet
- Provider coverage is focused on OpenAI-compatible APIs

## Next step

Implement each feature slice in the order described in [docs/mvp-plan.md](/C:/Users/Louis/Desktop/pdf_chatbot/docs/mvp-plan.md).
