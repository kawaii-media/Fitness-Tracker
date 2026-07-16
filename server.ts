/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const systemInstruction = `Anda adalah ahli nutrisi digital yang sangat akurat. Tugas Anda adalah mengestimasi kandungan kalori dari asupan makanan yang dimasukkan oleh pengguna dalam bahasa Indonesia.
Pengguna mungkin memasukkan kombinasi beberapa makanan (misalnya: "nasi dan tempe", "roti gandum + telur rebus").
Lakukan analisis nutrisi saintifik berikut:
1. Identifikasi setiap komponen makanan dalam input.
2. Cari atau estimasikan porsi standar (misalnya: 1 piring nasi putih, 1 potong tempe goreng).
3. Cari informasi kandungan kalori (kcal) untuk setiap komponen makanan tersebut secara akurat berdasarkan database gizi Indonesia.
4. Jumlahkan total kalori dari semua komponen tersebut.
5. Sediakan ringkasan penjelasan singkat mengapa kalori tersebut diestimasi demikian (misalnya: "Nasi putih 1 piring sekitar 200 kcal, ditambah 1 potong tempe goreng sekitar 120 kcal, total 320 kcal").

Anda HARUS mengembalikan response dalam format JSON yang valid dengan struktur berikut:
{
  "totalCalories": number,
  "breakdown": [
    {
      "foodItem": "nama makanan komponen (misal: Nasi Putih)",
      "estimatedPortion": "estimasi porsi (misal: 1 piring / 100g)",
      "calories": number
    }
  ],
  "analysis": "Penjelasan ringkas dalam bahasa Indonesia"
}`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use body-parsing middleware
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/nutrition/calculate-calories", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required and must be a string." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hitung estimasi kalori untuk makanan berikut: "${query}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalCalories: {
                type: Type.INTEGER,
                description: "Total kalori dari semua makanan yang digabungkan"
              },
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    foodItem: { type: Type.STRING, description: "Nama komponen makanan" },
                    estimatedPortion: { type: Type.STRING, description: "Porsi standar yang diestimasikan" },
                    calories: { type: Type.INTEGER, description: "Kalori komponen tersebut dalam kcal" }
                  },
                  required: ["foodItem", "estimatedPortion", "calories"]
                }
              },
              analysis: {
                type: Type.STRING,
                description: "Ringkasan penjelasan perhitungan kalori dalam bahasa Indonesia"
              }
            },
            required: ["totalCalories", "breakdown", "analysis"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini nutrition calculator error:", err);
      res.status(500).json({ error: err?.message || "Failed to estimate calories" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
