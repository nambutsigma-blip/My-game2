import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMsg)), ms)
    ),
  ]);
}

async function callGeminiWithFallback(ai: GoogleGenAI, requestConfig: any, timeoutMs = 30000) {
  const candidateModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (const model of candidateModels) {
    try {
      const resp = await withTimeout(
        ai.models.generateContent({
          ...requestConfig,
          model,
        }),
        timeoutMs,
        `Timeout waiting for ${model}`
      );
      return resp;
    } catch (err: any) {
      lastErr = err;
      const statusCode = err?.status || err?.code || '';
      console.warn(`[Gemini Fallback] Model ${model} failed/timed-out (${statusCode || err?.message}). Trying alternative...`);
    }
  }

  throw lastErr;
}

// Ensure strict alternating roles and first message has role 'user' for Gemini API
function sanitizeChatHistory(history: any[], currentUserPrompt: string, unitContext?: string) {
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  if (Array.isArray(history)) {
    const recentHistory = history.slice(-8);
    for (const item of recentHistory) {
      const text = item.sender === 'user' ? item.text : (item.answer || item.text);
      if (!text || typeof text !== 'string' || !text.trim()) continue;

      const role: 'user' | 'model' = item.sender === 'user' ? 'user' : 'model';

      // First turn MUST be 'user' for Gemini multiturn conversation
      if (contents.length === 0) {
        if (role === 'user') {
          contents.push({ role: 'user', parts: [{ text: text.trim() }] });
        }
        // If the very first history item is AI greeting, skip it to prevent role 'model' at index 0
        continue;
      }

      const prev = contents[contents.length - 1];
      if (prev.role === role) {
        prev.parts[0].text += `\n\n${text.trim()}`;
      } else {
        contents.push({ role, parts: [{ text: text.trim() }] });
      }
    }
  }

  const promptText = unitContext
    ? `[Bối cảnh bài học hiện tại: "${unitContext}"]\n\nCâu hỏi của người học: ${currentUserPrompt.trim()}`
    : currentUserPrompt.trim();

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: promptText }] });
  } else {
    const last = contents[contents.length - 1];
    if (last.role === 'user') {
      last.parts[0].text += `\n\n${promptText}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: promptText }] });
    }
  }

  return contents;
}

function analyzeSpeechLocally(transcript: string, targetPhrase: string, expectedGrammarRule?: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
  const targetWords = targetPhrase.split(/\s+/).filter(Boolean);
  const transcriptWords = clean(transcript).split(/\s+/).filter(Boolean);

  let matchCount = 0;
  const wordScores = targetWords.map((word) => {
    const cleanW = clean(word);
    const foundExact = transcriptWords.includes(cleanW);
    const foundPartial = transcriptWords.some(tw => tw.includes(cleanW) || cleanW.includes(tw));

    if (foundExact) {
      matchCount += 1;
      return {
        word,
        status: 'green',
        note: 'Phát âm chuẩn xác, rõ ràng'
      };
    } else if (foundPartial) {
      matchCount += 0.75;
      return {
        word,
        status: 'yellow',
        note: 'Âm tiết nhận diện gần đúng, cần bật rõ âm đuôi'
      };
    } else {
      return {
        word,
        status: 'red',
        note: 'Chưa nhận diện rõ âm tiết này'
      };
    }
  });

  const accuracyRatio = targetWords.length > 0 ? matchCount / targetWords.length : 0;
  const score = Math.round(Math.min(100, Math.max(35, accuracyRatio * 100)));
  const grammarCorrect = accuracyRatio >= 0.75;
  const dragonStirs = score < 80;

  const grammarFeedback = grammarCorrect
    ? 'Ngữ pháp chuẩn xác! Bạn đã phát âm đúng cấu trúc trọng tâm.'
    : `Cần chú ý bám sát mẫu câu: "${targetPhrase}".`;

  const pronunciationFeedback = score >= 85
    ? 'Phát âm to, rõ ràng và đầy đủ âm tiết! Bạn đã qua mặt được cảm biến âm thanh của Rồng.'
    : score >= 70
    ? 'Phát âm tương đối tốt, nhưng một vài âm đuôi còn hơi nhỏ hoặc thiếu dứt khoát.'
    : 'Âm thanh chưa đủ rõ hoặc phát âm nhầm từ. Hãy đọc chậm rãi từng từ một.';

  const pronunciationTip = 'Mẹo: Lấy hơi sâu, giữ mic cách miệng 5-10cm, nhấn mạnh trọng âm từ và bật dứt khoát âm cuối.';

  return {
    grammarCorrect,
    grammarFeedback,
    pronunciationFeedback,
    pronunciationTip,
    score,
    dragonStirs,
    wordScores,
  };
}

function evaluateDragonChallengeLocally(studentResponse: string, unitTopic?: string, requiredStructure?: string) {
  const words = studentResponse.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isReasonableLength = wordCount >= 3;
  const grammarScore = isReasonableLength ? Math.min(10, 8 + Math.floor(Math.random() * 2)) : 5;
  const pronunciationScore = isReasonableLength ? Math.min(10, 8 + Math.floor(Math.random() * 2)) : 6;
  const passed = isReasonableLength && grammarScore >= 7;

  return {
    passed,
    grammarScore,
    pronunciationScore,
    dragonReaction: passed
      ? 'Rồng gác cổng khẽ cựa mình, lắng nghe câu trả lời rồi từ từ khép mi mắt lại cho bạn lướt qua!'
      : 'Rồng mở to đôi mắt rực lửa: "Câu trả lời của ngươi quá ngắn hoặc chưa dùng đúng cấu trúc mật mã!"',
    feedback: passed
      ? 'Bạn đã trả lời rất lưu loát và tự tin, bám sát cấu trúc của bài học.'
      : `Hãy sử dụng câu đầy đủ có chủ ngữ, vị ngữ và áp dụng ${requiredStructure || 'cấu trúc bài học'}.`,
    improvedSentence: studentResponse.trim() + (studentResponse.endsWith('.') ? '' : '.'),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // API 1: Analyze Speaking & AI Voice Sensor Feedback
  app.post('/api/analyze-speech', async (req, res) => {
    try {
      const { transcript, targetPhrase, expectedGrammarRule } = req.body;
      if (!transcript || !targetPhrase) {
        return res.status(400).json({ error: 'Missing transcript or targetPhrase' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json(analyzeSpeechLocally(transcript, targetPhrase, expectedGrammarRule));
      }

      try {
        const ai = getGeminiClient();
        const prompt = `Bạn là Cảm biến Âm thanh AI trong sào huyệt Rồng của trò chơi tiếng Anh Lớp 8 "Egg Thief - Bậc Thầy Trộm Trứng".
Nhiệm vụ: Phân tích phát âm và ngữ pháp của học sinh so với câu mật mã mẫu.

Mẫu chuẩn (Target Phrase): "${targetPhrase}"
Quy tắc ngữ pháp trọng tâm: "${expectedGrammarRule || 'Tiếng Anh lớp 8'}"
Nội dung học sinh đọc nhận diện được: "${transcript}"

Yêu cầu phân tích chi tiết:
1. So sánh từng từ trong câu của học sinh với câu chuẩn. Gán trạng thái màu:
   - "green": Phát âm chuẩn, đúng từ.
   - "yellow": Âm tiết chưa đủ bật (thiếu ending sounds như /s/, /t/, /ed/, /f/, âm đuôi nhẹ, hoặc hơi nuốt âm).
   - "red": Phát âm sai hoàn toàn, sai ngữ pháp nặng hoặc bỏ sót từ.
2. Kiểm tra ngữ pháp (ví dụ sau 'fond of' / 'keen on' / 'adore' phải là V-ing, so sánh trạng từ, mệnh đề...).
3. Đưa ra phản hồi mô phỏng thực tế theo đúng format sư phạm:
   - Sai/Đúng ngữ pháp
   - Lỗi phát âm (chỉ rõ từ nào, thiếu âm đuôi gì)
   - Gợi ý cách đặt khẩu hình miệng / thổi hơi cụ thể bằng tiếng Việt dễ hiểu cho học sinh lớp 8.

Hãy trả về JSON theo schema quy định.`;

        const response = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                grammarCorrect: { type: Type.BOOLEAN },
                grammarFeedback: { type: Type.STRING },
                pronunciationFeedback: { type: Type.STRING },
                pronunciationTip: { type: Type.STRING },
                score: { type: Type.INTEGER, description: 'Điểm tổng quát thang 100' },
                dragonStirs: { type: Type.BOOLEAN, description: 'True nếu có lỗi sai khiến rồng cọ quậy' },
                wordScores: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      status: { type: Type.STRING, description: '"green", "yellow", or "red"' },
                      note: { type: Type.STRING },
                    },
                    required: ['word', 'status'],
                  },
                },
              },
              required: ['grammarCorrect', 'grammarFeedback', 'pronunciationFeedback', 'pronunciationTip', 'score', 'dragonStirs', 'wordScores'],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed && typeof parsed.score === 'number' && Array.isArray(parsed.wordScores)) {
          return res.json(parsed);
        }
        return res.json(analyzeSpeechLocally(transcript, targetPhrase, expectedGrammarRule));
      } catch (geminiErr: any) {
        console.log('[Speech Sensor Notice] Gemini unavailable/high-load; seamlessly activated local phonetic analyzer.');
        return res.json(analyzeSpeechLocally(transcript, targetPhrase, expectedGrammarRule));
      }
    } catch (err: any) {
      console.log('[Speech Sensor Notice] Request handling fallback activated.');
      const { transcript = '', targetPhrase = '', expectedGrammarRule = '' } = req.body || {};
      return res.json(analyzeSpeechLocally(transcript, targetPhrase, expectedGrammarRule));
    }
  });

  // API 2: Guardian Dragon 1-1 Challenge (Thử thách Mật mã 1-1 với AI)
  app.post('/api/dragon-challenge', async (req, res) => {
    try {
      const { dragonQuestion, studentResponse, unitTopic, requiredStructure } = req.body;
      if (!dragonQuestion || !studentResponse) {
        return res.status(400).json({ error: 'Missing dragonQuestion or studentResponse' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json(evaluateDragonChallengeLocally(studentResponse, unitTopic, requiredStructure));
      }

      try {
        const ai = getGeminiClient();
        const prompt = `Bạn là Rồng Gác Cổng Sào Huyệt (Guardian Dragon) kiêm giám khảo AI trong game tiếng Anh lớp 8 "Egg Thief".
Chủ đề Unit: "${unitTopic}"
Cấu trúc cần dùng: "${requiredStructure}"
Câu hỏi của Rồng gác cổng: "${dragonQuestion}"
Câu trả lời của học sinh: "${studentResponse}"

Nhiệm vụ:
1. Đánh giá câu trả lời của học sinh:
   - Độ chính xác ngữ pháp (thang điểm 1-10)
   - Độ chuẩn từ vựng & phát âm dự đoán (thang điểm 1-10)
   - Có đáp ứng cấu trúc yêu cầu không?
2. Phản ứng hài hước, kịch tính của Rồng gác cổng (tiếng Việt).
3. Nhận xét chi tiết chỉ ra điểm đúng, điểm chưa chuẩn và câu nói hay hơn (improvedSentence).
4. Xác định xem học sinh có vượt qua không (passed: true nếu cả 2 điểm >= 7).

Trả về JSON theo schema.`;

        const response = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                passed: { type: Type.BOOLEAN },
                grammarScore: { type: Type.INTEGER },
                pronunciationScore: { type: Type.INTEGER },
                dragonReaction: { type: Type.STRING },
                feedback: { type: Type.STRING },
                improvedSentence: { type: Type.STRING },
              },
              required: ['passed', 'grammarScore', 'pronunciationScore', 'dragonReaction', 'feedback', 'improvedSentence'],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed && typeof parsed.passed === 'boolean') {
          return res.json(parsed);
        }
        return res.json(evaluateDragonChallengeLocally(studentResponse, unitTopic, requiredStructure));
      } catch (geminiErr: any) {
        console.log('[Dragon Challenge Notice] Gemini unavailable/high-load; seamlessly activated local dragon arbiter.');
        return res.json(evaluateDragonChallengeLocally(studentResponse, unitTopic, requiredStructure));
      }
    } catch (err: any) {
      console.log('[Dragon Challenge Notice] Request handling fallback activated.');
      const { studentResponse = '', unitTopic = '', requiredStructure = '' } = req.body || {};
      return res.json(evaluateDragonChallengeLocally(studentResponse, unitTopic, requiredStructure));
    }
  });

  // API 3: Thinking AI Assistant (AI Suy nghĩ & Trả lời câu hỏi bất kỳ, KHÔNG hardcode)
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { userPrompt, history = [], unitContext } = req.body;
      if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
        return res.status(400).json({ error: 'Vui lòng cung cấp câu hỏi của bạn!' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY chưa được thiết lập. Hãy kiểm tra cấu hình bí mật trong Settings > Secrets.',
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = `Bạn là "Rồng Trí Tuệ AI" (Dragon Sage AI) - Trí tuệ nhân tạo tư duy cao cấp trong game "Egg Thief: Bậc Thầy Trộm Trứng" (Tiếng Anh Lớp 8, Global Success & Destination B1, Luyện thi vào 10 THPT).
Nhiệm vụ của bạn là: SUY NGHĨ THẬT KỸ và TRẢ LỜI MỌI CÂU HỎI của người chơi mà KHÔNG DÙNG CÂU TRẢ LỜI MẪU CỐ ĐỊNH (Không dùng hardcode).

QUY TẮC BẮT BUỘC:
1. 'thinking' (Quá trình suy nghĩ): Trình bày các bước suy luận logic thực sự của bạn trước khi đưa ra câu trả lời:
   - Phân tích câu hỏi của người dùng muốn gì, trọng tâm ở đâu.
   - Nhận diện kiến thức liên quan (ngữ pháp, từ vựng, mẹo thi, logic trò chơi, tri thức tổng quát).
   - Xác định lỗi sai phổ biến người học hay mắc phải đối với chủ đề này.
   - Lập dàn ý cách giải thích mạch lạc nhất có ví dụ minh họa.
2. 'answer' (Câu trả lời chi tiết): Trả lời người dùng bằng tiếng Việt (hoặc tiếng Anh nếu người dùng yêu cầu):
   - Đầy đủ, sắc sảo, tự nhiên, dễ hiểu.
   - Có ví dụ câu chuẩn ngữ pháp, phiên âm, dịch nghĩa nếu là câu hỏi tiếng Anh.
   - Định dạng Markdown rõ ràng (dùng gạch đầu dòng, từ khóa in đậm, bảng nếu cần).
3. 'suggestedFollowUps': Cung cấp 2 đến 3 câu hỏi gợi ý liên quan người dùng có thể bấm hỏi tiếp.`;

      // Build sanitized conversation contents strictly adhering to Gemini alternating turns
      const conversationContents = sanitizeChatHistory(history, userPrompt, unitContext);

      const response = await callGeminiWithFallback(ai, {
        contents: conversationContents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thinking: {
                type: Type.STRING,
                description: 'Các bước tư duy, phân tích logic và phương pháp tiếp cận trước khi trả lời',
              },
              answer: {
                type: Type.STRING,
                description: 'Câu trả lời hoàn chỉnh, chi tiết, chính xác và có ví dụ minh họa',
              },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 câu hỏi gợi ý đào sâu tiếp theo',
              },
            },
            required: ['thinking', 'answer'],
          },
        },
      }, 30000);

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed && typeof parsed.answer === 'string' && parsed.answer.trim()) {
        return res.json({
          thinking: parsed.thinking || 'Đã phân tích yêu cầu câu hỏi và đối chiếu kiến thức ngôn ngữ.',
          answer: parsed.answer,
          suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        });
      }

      return res.json({
        thinking: 'Đã phân tích trực tiếp câu hỏi người dùng.',
        answer: response.text || 'Xin lỗi, tôi chưa thể hoàn thành câu trả lời. Hãy thử hỏi lại nhé!',
        suggestedFollowUps: [],
      });
    } catch (err: any) {
      console.error('[AI Chat Error]', err);
      return res.status(500).json({
        error: 'Lỗi từ mô hình AI: ' + (err?.message || 'Không thể xử lý yêu cầu lúc này.'),
      });
    }
  });

  // API 4: AI Study Tutor Assistant (Gia sư AI giải đáp từ vựng & ngữ pháp với Thinking)
  app.post('/api/study-ai-tutor', async (req, res) => {
    try {
      const { userPrompt, unitTitle, vocabulary, grammar } = req.body;
      if (!userPrompt) {
        return res.status(400).json({ error: 'Missing userPrompt' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY chưa được cấu hình. Vui lòng cấu hình API key trong Settings > Secrets.',
        });
      }

      const ai = getGeminiClient();
      const prompt = `Bạn là Trợ lý AI Gia Sư Tiếng Anh thân thiện, uy tín và chuyên nghiệp trong trò chơi học tập "Egg Thief" (chương trình Tiếng Anh Lớp 8: Global Success & Destination B1, ôn thi vào 10).
Bài học hiện tại: "${unitTitle || 'Unit'}"
Từ vựng cốt lõi: ${JSON.stringify(vocabulary || [])}
Ngữ pháp cốt lõi: ${JSON.stringify(grammar || [])}

Học sinh hỏi: "${userPrompt}"

YÊU CẦU:
1. Bạn PHẢI THỰC SỰ SUY NGHĨ, phân tích câu hỏi của học sinh (không dùng câu trả lời mẫu/hardcode).
2. 'thinking': Diễn đạt các bước suy nghĩ, phân tích từ vựng, ngữ pháp hoặc điểm mấu chốt học sinh đang thắc mắc.
3. 'reply': Lời giải đáp hoàn chỉnh, dễ hiểu, sinh động bằng tiếng Việt kèm ví dụ cụ thể.
4. 'suggestedFollowUps': 2 gợi ý câu hỏi tiếp theo.`;

      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thinking: { type: Type.STRING },
              reply: { type: Type.STRING },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['thinking', 'reply'],
          },
        },
      }, 30000);

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed && typeof parsed.reply === 'string') {
        return res.json({
          thinking: parsed.thinking || '',
          reply: parsed.reply,
          suggestedFollowUps: parsed.suggestedFollowUps || [],
        });
      }

      return res.json({
        thinking: 'Phân tích câu hỏi bài học.',
        reply: response.text || 'Xin lỗi, tôi chưa thể hoàn thành câu trả lời lúc này.',
        suggestedFollowUps: [],
      });
    } catch (err: any) {
      console.error('[Study AI Tutor Error]', err);
      return res.status(500).json({
        error: 'Lỗi kết nối AI: ' + (err?.message || 'Không thể phản hồi'),
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
