const regions = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충남",
  "세종",
  "대전",
  "충북",
  "경북",
  "대구",
  "전북",
  "광주",
  "전남",
  "경남",
  "울산",
  "부산",
  "제주",
]; // 지역 데이터

const regionsDiv = document.getElementById("map"); // #map 부분에서 버튼을 생성
regions.forEach((region) => {
  const button = document.createElement("button"); // button 요소 생성
  button.textContent = region;
  button.className = "region-button";
  button.addEventListener("click", () => fetchStations(region)); // 클릭을 했을 때 fetchStations 비동기 함수 호출
  regionsDiv.appendChild(button);
});

// 측정소 정보 가져오기
async function fetchStations(region) {
  const response = await fetch(`/${region}`); // Get/지역 요청을 서버로 보냄
  if (response.ok) {
    const stationData = await response.json(); // 서버로 부터 해당 지역 측정소 데이터를 StaionData에 저장
    const middleDiv = document.getElementById("middle"); // #middle 부분에 측정소 데이터를 띄운다
    middleDiv.innerHTML = `
      <h2>${region} 측정소</h2>
      <ul>
        ${stationData
          .map(
            // map 함수를 이용해서 측정소 데이터를 하나씩 불러온다
            (station) =>
              `<li onclick="handleStationClick('${station}')">${station}</li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    // 측정소 데이터를 찾을 수 없을 때
    document.getElementById("middle").innerHTML = `
      <h2>${region} 측정소</h2>
      <p>측정소 데이터를 찾을 수 없습니다.</p>
    `;
  }
}

function handleStationClick(station) {
  // handleStationClick 함수를 호출하면 openAPI를 사용한다
  const xhr = new XMLHttpRequest();
  const url =
    "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
  let queryParams =
    "?" +
    encodeURIComponent("serviceKey") +
    "=" +
    "aGGVWlsiSGIMw3Exr5QVKXZm4pwegDpIPjoBRMTYwrjZJqxytuxTbzO5l3KjBBcCGwv0//xAYK2g4GauUP39pQ==";
  queryParams +=
    "&" + encodeURIComponent("returnType") + "=" + encodeURIComponent("json");
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("100");
  queryParams +=
    "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1");
  queryParams +=
    "&" + encodeURIComponent("stationName") + "=" + encodeURIComponent(station);
  queryParams +=
    "&" + encodeURIComponent("dataTerm") + "=" + encodeURIComponent("DAILY");
  queryParams +=
    "&" + encodeURIComponent("ver") + "=" + encodeURIComponent("1.0");

  xhr.open("GET", url + queryParams);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // openAPI 접속 성공
      const responseData = JSON.parse(this.responseText);

      if (
        responseData.response.body.items &&
        responseData.response.body.items.length > 0
      ) {
        const latestData = responseData.response.body.items[0]; // openAPI 가장 최신 데이터 (첫 번째 데이터)

        const getAirQualityStatusPM10 = (pm10Value) => {
          // 미세먼지(PM10) 상태 계산하는 함수
          if (pm10Value <= 30) {
            return { status: "좋음", className: "good" };
          } else if (pm10Value <= 80) {
            return { status: "보통", className: "moderate" };
          } else if (pm10Value <= 150) {
            return { status: "나쁨", className: "bad" };
          } else {
            return { status: "매우나쁨", className: "worst" };
          }
        };

        const getAirQualityStatusPM25 = (pm25Value) => {
          // 초미세먼지(PM2.5) 상태 계산하는 함수
          if (pm25Value <= 15) {
            return { status: "좋음", className: "good" };
          } else if (pm25Value <= 35) {
            return { status: "보통", className: "moderate" };
          } else if (pm25Value <= 75) {
            return { status: "나쁨", className: "bad" };
          } else {
            return { status: "매우나쁨", className: "worst" };
          }
        };

        const getAirQualityStatusO3 = (o3Value) => {
          // 오존(O3) 상태 계산하는 함수
          if (o3Value <= 0.03) {
            return { status: "좋음", className: "good" };
          } else if (o3Value <= 0.09) {
            return { status: "보통", className: "moderate" };
          } else if (o3Value <= 0.15) {
            return { status: "나쁨", className: "bad" };
          } else {
            return { status: "매우나쁨", className: "worst" };
          }
        };

        const pm10Value = latestData.pm10Value; // openAPI 최신데이터 - 미세먼지 수치
        const pm25Value = latestData.pm25Value; // openAPI 최신데이터 - 초미세먼지 수치
        const o3Value = latestData.o3Value; // openAPI 최신데이터 - 오존 수치

        const getDisplayValue = (
          value // 미세먼지 수치, 초미세먼지 수치, 오존 수치가 존재하지 않는 경우
        ) => (value === "-" ? "데이터 없음" : value);

        // 수치 계산 (데이터가 있을 경우에만 수치를 계산한다)
        const airQualityPM10 =
          pm10Value !== "-" ? getAirQualityStatusPM10(pm10Value) : null;
        const airQualityPM25 =
          pm25Value !== "-" ? getAirQualityStatusPM25(pm25Value) : null;
        const airQualityO3 =
          o3Value !== "-" ? getAirQualityStatusO3(o3Value) : null;

        const contentDiv = document.getElementById("content"); // content 부분에서 대기오염 수치 데이터를 띄운다
        contentDiv.innerHTML = `
  <h2>${station} 실시간 대기정보</h2>
  <ul>
    <li><span>시간</span> ${latestData.dataTime}</li> 
    <li>
  <span>미세먼지(PM10)</span>
  ${getDisplayValue(pm10Value)} μg/m³
</li>

    <li>
      <span>초미세먼지(PM2.5)</span>
      ${getDisplayValue(pm25Value)} μg/m³
    </li>
    <li>
      <span>오존(O3)</span>
      ${getDisplayValue(o3Value)} ppm
    </li>
  </ul>
  <br>

  <!-- 미세먼지 상태 -->
  <h3 style="text-align: center;">미세먼지(PM10)</h3>
  <div class="status-bar">
    <div class="level good ${
      airQualityPM10 && airQualityPM10.className === "good" ? "active" : ""
    }">좋음<br>(0~30)</div>
    <div class="level moderate ${
      airQualityPM10 && airQualityPM10.className === "moderate" ? "active" : ""
    }">보통<br>(31~80)</div>
    <div class="level bad ${
      airQualityPM10 && airQualityPM10.className === "bad" ? "active" : ""
    }">나쁨<br>(81~150)</div>
    <div class="level worst ${
      airQualityPM10 && airQualityPM10.className === "worst" ? "active" : ""
    }">매우나쁨<br>(151~ )</div>
  </div><br>

  <!-- 초미세먼지 상태 -->
  <h3 style="text-align: center;">초미세먼지(PM2.5)</h3>
  <div class="status-bar">
    <div class="level good ${
      airQualityPM25 && airQualityPM25.className === "good" ? "active" : ""
    }">좋음<br>(0~15)</div>
    <div class="level moderate ${
      airQualityPM25 && airQualityPM25.className === "moderate" ? "active" : ""
    }">보통<br>(16~35)</div>
    <div class="level bad ${
      airQualityPM25 && airQualityPM25.className === "bad" ? "active" : ""
    }">나쁨<br>(36~75)</div>
    <div class="level worst ${
      airQualityPM25 && airQualityPM25.className === "worst" ? "active" : ""
    }">매우나쁨<br>(76~ )</div>
  </div><br>

  <!-- 오존 상태 -->
  <h3 style="text-align: center;">오존(O3)</h3>
  <div class="status-bar">
    <div class="level good ${
      airQualityO3 && airQualityO3.className === "good" ? "active" : ""
    }">좋음<br>(0~0.030)</div>
    <div class="level moderate ${
      airQualityO3 && airQualityO3.className === "moderate" ? "active" : ""
    }">보통<br>(0.031~0.090)</div>
    <div class="level bad ${
      airQualityO3 && airQualityO3.className === "bad" ? "active" : ""
    }">나쁨<br>(0.091~0.150)</div>
    <div class="level worst ${
      airQualityO3 && airQualityO3.className === "worst" ? "active" : ""
    }">매우나쁨<br>(0.151~ )</div>
  </div>
`;
      } else {
        // 대기오염 농도 데이터를 불러올 수 없을 때
        document.getElementById(
          "content"
        ).innerHTML = `<p>데이터를 불러올 수 없습니다.</p>`;
      }
    }
  };

  xhr.send("");
}
