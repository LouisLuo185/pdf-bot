# AI PDF Chat MVP / AI PDF 学习助手 MVP

## Current status / 当前状态

- Online demo / 线上演示: [https://pdf-bot-production-8bdc.up.railway.app/](https://pdf-bot-production-8bdc.up.railway.app/)
- This project is currently an MVP and still has many limitations.
- 该项目目前仅为 MVP 版本，仍有较多不足。
- It currently supports only text-based PDFs within 5 pages.
- 当前仅支持 5 页以内的纯文字 PDF。
- The current deployment uses the domestic free model `Zhipu GLM-4.7-Flash`.
- 当前线上版本使用国内免费模型 `智谱 GLM-4.7-Flash`。
- Due to heavy traffic and service instability on the free model, upload and chat requests may fail sometimes. Retrying the request usually works.
- 由于免费模型访问量较大且服务不稳定，上传和对话可能出现失败，需要重复提交重试。
- A later version will switch to a more stable model/provider to improve reliability.
- 后续版本会更换为更稳定的模型或服务，以提升可用性。

## Target MVP / MVP 目标

- Upload one small text-based PDF and build a lightweight document knowledge workspace.
- 上传单个小型纯文字 PDF，并将其转化为轻量级文档知识空间。
- Extract text by page, split the document into chunks, and generate embeddings for retrieval.
- 按页提取文本、完成文档切块，并生成向量用于检索。
- Automatically generate a brief summary, key concepts, and suggested questions after upload.
- 上传后自动生成文档摘要、关键概念和推荐问题。
- Support PDF-grounded question answering with source-backed citations.
- 支持基于 PDF 内容的问答，并返回带来源引用的回答。
