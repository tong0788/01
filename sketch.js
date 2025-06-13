let video;
let handPose;
let hands = [];
let circleX = 320;
let circleY = 240;
let startTime;
let elapsedTime = 0;
let leftHandScore = 0;
let rightHandScore = 0;
let displayText = "";
let isStarted = false; // 控制是否開始互動
let isFinished = false; // 控制是否結束互動

const leftHandWords = ["教", "育", "科", "技"];
const rightHandWords = ["淡", "江", "大", "學"];

function setup() {
  const canvas = createCanvas(640, 480);
  // 置中畫布
  canvas.position(
    (windowWidth - width) / 2,
    (windowHeight - height) / 2
  );
  // 設定邊框顏色
  canvas.style('border', '8px solid #edafb8');
  background(0); // 可依需求設定背景色

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  handPose = ml5.handPose(video, { flipped: true }, () => {
    console.log("HandPose model loaded successfully.");
  });

  handPose.on("predict", (results) => {
    hands = results;
    console.log("Detected hands:", hands);
  });

  startTime = millis(); // 記錄開始時間
}

function draw() {
  background(0); // 每次重繪背景
  // 上方寫上指定文字
  fill(255);
  textSize(28);
  textAlign(CENTER, TOP);
  text("TKUET 413730861", width / 2, 16);

  image(video, 0, 0, width, height);

  if (!isStarted) {
    // 顯示開始按鈕
    fill(0, 0, 255);
    rect(width / 2 - 100, height / 2 - 50, 200, 100, 20);
    fill(255);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("開始", width / 2, height / 2);
    return; // 暫停互動，直到按下開始鍵
  }

  if (isFinished) {
    // 顯示結束後的總時間
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text(`總共時間: ${elapsedTime} 秒`, width / 2, height / 2);
    return;
  }

  // 繪製圓形
  fill(255, 0, 0);
  noStroke();

  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let indexFinger = hand.annotations.indexFinger;
      if (indexFinger) {
        for (let j = 0; j < indexFinger.length; j++) {
          let point = indexFinger[j];
          fill(0, 255, 0);
          ellipse(point[0], point[1], 10, 10); // 顯示食指關鍵點
        }
      }
    }
  }

  ellipse(circleX, circleY, 30, 30);

  // 顯示計時器
  elapsedTime = floor((millis() - startTime) / 1000); // 轉換為秒
  textAlign(RIGHT, TOP);
  text(elapsedTime + " 秒", width - 10, 10);

  // 顯示分數和文字
  textAlign(CENTER, CENTER);
  textSize(30);
  fill(255);
  text(displayText, width / 2, height / 2);
}

function mousePressed() {
  if (!isStarted) {
    // 檢查是否點擊了開始按鈕
    if (
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height / 2 - 50 &&
      mouseY < height / 2 + 50
    ) {
      isStarted = true; // 開始互動
      startTime = millis(); // 重置開始時間
    }
    return;
  }

  if (hands.length > 0) {
    let hand = hands[0]; // 使用第一隻偵測到的手
    let indexFinger = hand.annotations.indexFinger; // 取得食指的關鍵點

    if (indexFinger && indexFinger.length > 0) {
      let tip = indexFinger[3]; // 食指尖端
      let distance = dist(circleX, circleY, tip[0], tip[1]);

      if (distance < 30) {
        if (hand.label === "left") {
          if (leftHandScore < leftHandWords.length) {
            displayText = leftHandWords[leftHandScore];
            leftHandScore++;
          }
        } else if (hand.label === "right") {
          if (rightHandScore < rightHandWords.length) {
            displayText = rightHandWords[rightHandScore];
            rightHandScore++;
          }
        }

        // 檢查是否完成所有文字
        if (
          leftHandScore === leftHandWords.length &&
          rightHandScore === rightHandWords.length
        ) {
          isFinished = true; // 結束互動
        }
      }
    }
  }
}
