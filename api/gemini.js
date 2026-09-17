// api/gemini.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let prompt;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    prompt = body.prompt;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash"; // 요청한 모델명 적용

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Prompt or API key is missing' });
  }

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `당신은 워드프레스 Contact Form 7(CF7) 코드 생성 전문가입니다.
사용자의 요청에 따라 CF7 코드를 생성하세요.
반드시 CF7 문법([text*], [radio], [select], [submit] 등)을 정확히 사용해야 합니다.
설명은 제외하고 생성된 CF7 코드만 반환하세요.
사용자 요청: ${prompt}` }] }]
      })
    });

    const data = await geminiResponse.json();
    
    // 응답 전체를 서버 로그에 출력하여 구조 확인
    console.log("Gemini API Full Response:", JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ code: data.candidates[0].content.parts[0].text });
    } else {
      // 구조 오류 시 구체적인 응답 데이터를 클라이언트에게 에러로 반환
      return res.status(500).json({ error: 'AI 응답 구조 오류', details: data });
    }
  } catch (err) {
    console.error('Gemini API 오류:', err);
    return res.status(500).json({ error: err.message });
  }
}