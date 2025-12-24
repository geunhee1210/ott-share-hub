# MailFlow - 스마트 이메일 자동 발송 시스템

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/PM2-5.x-2B037A?style=for-the-badge&logo=pm2" />
  <img src="https://img.shields.io/badge/Gmail-SMTP-EA4335?style=for-the-badge&logo=gmail" />
</p>

## 📌 소개

MailFlow는 Gmail SMTP를 활용한 세련된 이메일 자동 발송 시스템입니다. 대기업 수준의 UI/UX와 안정적인 백엔드로 구성되어 있습니다.

## ✨ 주요 기능

- 🚀 **즉시 발송** - 작성 즉시 이메일 발송
- ⏰ **예약 발송** - 원하는 날짜와 시간에 자동 발송
- 🔐 **보안 연결** - Gmail 앱 비밀번호를 통한 안전한 인증
- 📧 **실시간 미리보기** - 작성 중인 이메일 미리보기
- 📋 **발송 히스토리** - 최근 발송한 이메일 목록 확인
- 🎨 **모던 UI** - 다크 테마 기반의 세련된 인터페이스

## 🛠️ 기술 스택

### Frontend
- React 18 + Vite
- Framer Motion (애니메이션)
- Lucide React (아이콘)
- Axios (HTTP 클라이언트)

### Backend
- Node.js + Express
- Nodemailer (이메일 발송)
- CORS (크로스 도메인)
- Dotenv (환경 변수)

### DevOps
- PM2 (프로세스 관리)

## 📦 설치 방법

### 1. 의존성 설치

```bash
# 백엔드 의존성 설치
cd backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

### 2. 환경 변수 설정 (선택사항)

```bash
# backend/.env 파일 생성
PORT=3001
```

## 🚀 실행 방법

### 개발 모드

```bash
# 터미널 1: 백엔드 서버 실행
cd backend
npm run dev

# 터미널 2: 프론트엔드 개발 서버 실행
cd frontend
npm run dev
```

### PM2로 프로덕션 실행

```bash
# 프로젝트 루트 디렉토리에서
pm2 start ecosystem.config.js

# 프론트엔드 빌드 후 정적 파일 서빙
cd frontend
npm run build
```

### PM2 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs mail-sender-backend

# 재시작
pm2 restart mail-sender-backend

# 중지
pm2 stop mail-sender-backend

# 삭제
pm2 delete mail-sender-backend
```

## 📧 Gmail 앱 비밀번호 설정

Gmail로 이메일을 발송하려면 **앱 비밀번호**가 필요합니다.

### 설정 방법

1. [Google 계정](https://myaccount.google.com/)에 로그인
2. **보안** 탭으로 이동
3. **2단계 인증** 활성화 (아직 안했다면)
4. **앱 비밀번호** 선택
5. 앱: **메일**, 기기: **기타(맞춤 이름)** 선택
6. 생성된 **16자리 비밀번호**를 복사하여 앱에서 사용

> ⚠️ **주의**: 일반 Gmail 비밀번호가 아닌 **앱 비밀번호**를 사용해야 합니다.

## 📁 프로젝트 구조

```
test/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx          # 메인 컴포넌트
│   │   ├── App.css          # 컴포넌트 스타일
│   │   ├── index.css        # 글로벌 스타일
│   │   └── main.jsx         # 엔트리 포인트
│   ├── vite.config.js       # Vite 설정
│   └── package.json
├── backend/                  # Express 백엔드
│   ├── server.js            # 메인 서버
│   └── package.json
├── ecosystem.config.js       # PM2 설정
└── README.md
```

## 🔌 API 엔드포인트

### POST /api/send-email
이메일 발송

```json
{
  "senderEmail": "your-email@gmail.com",
  "appPassword": "xxxx xxxx xxxx xxxx",
  "recipientEmail": "recipient@example.com",
  "subject": "이메일 제목",
  "content": "이메일 내용",
  "scheduleTime": "2024-12-25T09:00:00.000Z" // 선택사항
}
```

### POST /api/test-connection
Gmail 연결 테스트

```json
{
  "senderEmail": "your-email@gmail.com",
  "appPassword": "xxxx xxxx xxxx xxxx"
}
```

### GET /api/health
서버 상태 확인

## 🎨 UI 특징

- **다크 테마**: 눈의 피로를 줄이는 세련된 다크 모드
- **그라디언트 액센트**: 틸/시안 컬러의 프리미엄 그라디언트
- **글래스모피즘**: 투명 효과와 블러로 깊이감 표현
- **부드러운 애니메이션**: Framer Motion 기반 인터랙션
- **반응형 디자인**: 모바일부터 데스크탑까지 지원

## 📝 라이선스

MIT License

---

<p align="center">
  Made with ❤️ by MailFlow Team
</p>

