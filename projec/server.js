const express = require("express"); // express 모듈 사용
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.static(path.join(__dirname))); // 정적파일을 서빙한다

app.get("/", (req, res) => {
  // 브라우저에 처음 접속했을 때 화면
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/:region", (req, res) => {
  // Get/지역 서버
  const region = req.params.region;
  const data = JSON.parse(fs.readFileSync("data.json", "utf8")); // 측정소 데이터 값을 읽는다 (data.json)

  if (data[region]) {
    // 데이터 값이 있을 때
    const sortedData = data[region].sort(
      // 측정소 데이터를 가나다 순으로 정렬
      (a, b) => a.localeCompare(b, "ko", { sensitivity: "base" })
    );
    res.json(sortedData); // 정렬된 데이터를 fetchStation 함수의 StationData로 보낸다
  } else {
    // 측정소 데이터 값이 없을 때
    res.status(404).send("해당 지역의 측정소 데이터를 찾을 수 없습니다.");
  }
});

const PORT = 3000; // 포트번호
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`); // 예시
});
