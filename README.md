# melody2midi
오디오 파일의 주요 멜로디를 MIDI로 추출해주는 프로그램입니다.

[Essentia.js](https://www.npmjs.com/package/essentia.js) 라이브러리에서 주요 멜로디 추출 메소드인 '[PredominantPitchMelodia](PredominantPitchMelodia )'을 사용하여,
오디오 파일의 주요한 멜로디(보컬 멜로디 등)를 인식하여 midi 파일로 저장해줍니다.

고등학교 과학과제연구 프로젝트에서 진행 중인 '[표절 체커(pyojeol checker)](https://github.com/Craft374/Scientific_Task_Study)' 프로그램의 모듈로써 사용됩니다.
많은 관심 부탁드립니다.

## 사용 예시
터미널에 ```npm install git+https://github.com/WooyeongCho/melody2midi.git```를 입력하여 패키지를 설치합니다.
그 이후 아래와 같이 코드를 작성하여 실행해보세요.
```js
const m2m = require('melody2midi');
const fs = require('fs');
m2m.extract('song.mp3')
  .then((midiBinaryData) => {
    console.log('midi binary data:', midiBinaryData);
    fs.writeFileSync('out.midi', midiBinaryData, 'binary');
  })
  .catch((error) => {
    console.error("error: ", error);
  })
  ```

### 메소드
#### extract("오디오 파일 경로")
해당 경로의 오디오 파일의 주요 멜로디를 추출하여 MIDI 데이터로 만들고, Binary 형태로 반환합니다.
비동기 함수이기 때문에, extract 함수 뒤에 .then() 함수를 사용해서 코드를 작성해주세요.
