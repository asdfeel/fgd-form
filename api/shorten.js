export default async function handler(req, res) {
  const longUrl = req.query.url;

  if (!longUrl) {
    return res.status(400).json({ error: "url 파라미터가 필요합니다." });
  }

  try {
    // v.gd API 호출
    const response = await fetch(
      `https://v.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`
    );

    if (!response.ok) {
      throw new Error(`v.gd 응답 오류: ${response.status}`);
    }

    const shortUrl = (await response.text()).trim();

    if (!shortUrl.startsWith("http")) {
      throw new Error("v.gd 응답 형식 오류: " + shortUrl);
    }

    return res.status(200).json({ shortUrl });
  } catch (err) {
    console.error("단축 URL 생성 실패:", err);
    return res.status(500).json({ error: err.message });
  }
}