import { Pinecone } from "@pinecone-database/pinecone";

export const pincone = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY!,
});

export const pineconeIndex = pincone.index("codefox-custom-text-embedding");
