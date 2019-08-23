# 프로그램 개요
이 프로그램은 React Native 여행일지 어플리케이션에 서버를 제공하는 프로그램입니다. Tour API에서 제공하는 정보를 Mongo db저장하고 활용해서 API 서버를 구축합니다.

# 목차
- React Native 여행일지 어플 깃헙주소
- 제공하는 기능
- 실행방법
- API 사용

# React Native 여행일지 어플 깃헙주소
https://github.com/luvehayoung/react-native-tour-app

# 제공하는 기능
- 사용자 정보를 저장/조회
- Tour API에서 정보를 저장
- Tour 정보 조회
- 여행일지를 저장/조회
등의 기능을 제공합니다.

# 실행방법

먼저 프로젝트를 clone합니다
~~~
git clone ...
~~~
### Tour API 신청
활용신청 방법 : https://api.visitkorea.or.kr/openAPI/applicationGuide.do
사용 방법 : https://roongstar.tistory.com/11

발급받은 API키를 config/api.json에 추가한다
~~~
{
  "tourapi":{
    "key": 발급받은키
  }
}
~~~

### MongoDB Atlas

* 무료계정 가입하고 Cluster 생성
https://cloud.mongodb.com/

* user생성

![mongodb_유저](./image/mongodb_유저.JPG)

* 현재 IP등록

![mongodb_connect](./image/mongodb_connect.JPG)

![mongodb_ip](./image/mongodb_ip.JPG)

![mongodb_current](./image/mongodb_current.JPG)

여기서 현제 IP를 추가합니다

* connect

![mongodb_connect_app](./image/mongodb_connect_app.JPG)

![mongodb_exam](./image/mongodb_exam.JPG)


이 정보를
config/db.json 에 추가한다
~~~
{
	"mongodb":{
		"host":"mongodb+srv://user아이디:user비밀번호@cluster-nx8u6.mongodb.net/test?retryWrites=true&w=majority",
		"collection" :[]
	}
}
~~~

### npm module 설치
~~~
npm install
npm start
~~~

# API 사용
## 여행일지 저장(record)
### Get : localhost/record/:id
레코드 ID로 정보 요청
### Post : localhost/record/
레코드 저장

## 국내 여행지 검색(tour)
### Get : localhost/tour/
모든 tour정보 요청
### Get : localhost/tour/:cnt
cnt개수만큼 tour정보 요청
### Get : localhost/tour/area/:name/:page
지역명으로 tour정보 요청,page는 pagination하기 위함
### Get : localhost/tour/content/:id
content id로 tour정보 요청
### Get : localhost/tour/title/:name/:page
키워드로 검색된 정보 요청
## 사용자 정보 (users)
### Get : localhost/users
사용자 정보 요청
### Get : localhost/users/email
email주소로 사용자정보 요청
### Post : localhost/users
사용자 가입 요청
