# Railway Deployment Guide

This project is ready to deploy to Railway as a standard Node-hosted Next.js app.

## Why Railway fits this MVP

- The app keeps running as a Node server after the HTTP response is returned.
- The current upload flow starts ingestion work after the upload request resolves.
- Railway is a better fit for this MVP than a serverless-first platform that expects explicit background job primitives.

## Before you deploy

1. Push the project to a Git repository such as GitHub.
2. Create a Supabase project.
3. Run [sql/schema.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/schema.sql) in Supabase SQL Editor.
4. If you previously created the older fixed-dimension vector schema, also run [sql/migrations/20260517_relax_embedding_dimensions.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/migrations/20260517_relax_embedding_dimensions.sql).
5. Create a storage bucket named `pdf-files` or match your chosen `SUPABASE_STORAGE_BUCKET`.
6. Make sure your selected AI provider keys are valid.

## Required Railway environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=pdf-files

AI_PROVIDER=zhipu
AI_CHAT_PROVIDER=zhipu
AI_EMBEDDING_PROVIDER=zhipu
AI_CHAT_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_EMBEDDING_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_CHAT_MODEL=glm-4.7-flash
AI_EMBEDDING_MODEL=embedding-3

ZHIPU_API_KEY=your_zhipu_api_key
```

You can swap providers as long as:

- `AI_CHAT_PROVIDER` uses an implemented OpenAI-compatible chat provider
- `AI_EMBEDDING_PROVIDER` uses an implemented embedding provider

## Railway steps

1. Go to Railway and create a new project from your GitHub repository.
2. Let Railway detect the app as a Node / Next.js service.
3. Add the environment variables listed above.
4. Trigger the first deploy.
5. Open the generated Railway domain and upload a small text-based PDF.

## Build and runtime behavior

- Build command: `npm run build`
- Start command: `npm run start`
- Config file: [railway.json](/C:/Users/Louis/Desktop/pdf_chatbot/railway.json)

## Recommended pre-deploy checks

Run these locally before pushing:

```bash
npm run test:unit
npm run typecheck
npm run build
```

## Common issues

### Upload succeeds but processing fails

Check:

- AI provider keys
- Provider base URLs
- Supabase bucket name
- Whether the PDF is text-based instead of scanned

### Embedding dimension mismatch

Run:

- [sql/migrations/20260517_relax_embedding_dimensions.sql](/C:/Users/Louis/Desktop/pdf_chatbot/sql/migrations/20260517_relax_embedding_dimensions.sql)

### Summary or QA provider not supported

Use one of:

- `openai`
- `zhipu`
- `deepseek`
- `dashscope`
- `openrouter`

for `AI_CHAT_PROVIDER`.
