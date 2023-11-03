# feature
영어대본 로커스토리지 사용
공부핸 내용 로컬스트로지 사용 & 다운로드

# git
npx create-react-app js-react-eng --template typescript
git init
git remote add origin https://github.com/nacamp/js-react-eng.git
git push origin main

https://www.pluralsight.com/guides/fetch-data-from-a-json-file-in-a-react-app



  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
     "deploy": "aws s3 sync ./build s3://jimmye.moozee.io --profile=default"
  },