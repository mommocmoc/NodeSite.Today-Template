# 🚀 Integration 토큰 공유 방식 완전 가이드

## 📋 개요

이 가이드는 중앙 집중식 Notion Integration 서비스를 통해 **토큰 없이도** 사이트를 설정할 수 있는 방법을 설명합니다.

## 🏗️ 아키텍처

```
[Template Provider] → [Central Integration Service] → [User's Databases]
      ↓                        ↓                          ↓
  - Manages token         - Rate limiting             - User content
  - User management       - Request routing           - Database access
  - Security             - Analytics                 - Shared with integration
```

## 🎯 두 가지 설정 방법

### Method 1: 중앙 Integration 서비스 (추천)

**장점:**
- ✅ Integration 토큰 불필요
- ✅ 3개 환경변수만 설정
- ✅ 즉시 배포 가능
- ✅ 자동 rate limiting
- ✅ 사용량 모니터링

**필요한 것:**
1. User ID (템플릿 제공자가 할당)
2. Category Database ID
3. Content Database ID

**설정 방법:**
```bash
# .env.local
USER_ID=user_12345
NOTION_CATEGORY_DB_ID=abc123...
NOTION_CONTENT_DB_ID=def456...
```

### Method 2: 개별 Integration (기존 방식)

**필요한 것:**
1. 개인 Notion Integration 생성
2. Integration 토큰 발급
3. 데이터베이스 권한 설정

**설정 방법:**
```bash
# .env.local
NOTION_API_KEY=secret_xxx
NOTION_CATEGORY_DB_ID=abc123...
NOTION_CONTENT_DB_ID=def456...
```

## 🔧 템플릿 제공자 설정 (관리자용)

### 1. 중앙 Integration 생성

1. Notion에서 새 Integration 생성
2. 모든 필요한 데이터베이스에 권한 부여
3. 토큰을 환경변수로 설정

```bash
# 템플릿 제공자 환경변수
CENTRAL_NOTION_TOKEN=secret_central_token
SERVICE_ID=notion-template-service
```

### 2. 사용자 관리 API 엔드포인트

- `/api/central-navigation` - 네비게이션 데이터
- `/api/central-gallery` - 갤러리 데이터
- `/api/user-register` - 사용자 등록
- `/api/user-stats` - 사용량 통계

### 3. 보안 기능

**Rate Limiting:**
- Free: 100 requests/hour, 1,000 requests/day
- Premium: 500 requests/hour, 5,000 requests/day
- Enterprise: 2,000 requests/hour, 20,000 requests/day

**사용자 관리:**
- 자동 사용자 등록
- 요청 추적
- 데이터베이스 접근 검증

## 🎯 사용자 온보딩 프로세스

### 1. 게스트 초대
```
템플릿 제공자 → Notion 워크스페이스 → 게스트 초대
```

### 2. 사용자 등록
```javascript
// 자동 등록 프로세스
POST /api/user-register
{
  "userId": "user_12345",
  "categoryDbId": "abc123...",
  "contentDbId": "def456...",
  "email": "user@example.com"
}
```

### 3. 즉시 배포
```bash
# 3개 변수만 설정하고 배포
USER_ID=user_12345
NOTION_CATEGORY_DB_ID=abc123...
NOTION_CONTENT_DB_ID=def456...
```

## 📊 모니터링 및 분석

### 사용자 통계 확인
```javascript
GET /api/user-stats?userId=user_12345
{
  "totalRequests": 245,
  "lastActive": "2024-01-15T10:30:00Z",
  "tier": "free",
  "remainingRequests": 755
}
```

### 관리자 대시보드
```javascript
GET /api/admin/users
// 모든 활성 사용자 목록
```

## 🔐 보안 고려사항

### 1. 토큰 보안
- 중앙 토큰은 서버 환경에서만 사용
- 클라이언트 노출 방지
- 정기적인 토큰 교체

### 2. 사용자 격리
- 각 사용자는 자신의 데이터베이스만 접근
- 교차 접근 방지
- 요청 추적 및 로깅

### 3. Rate Limiting
- 남용 방지
- 공정한 리소스 사용
- 자동 차단 기능

## 🚀 배포 가이드

### 1. Vercel 배포
```bash
# 환경변수 설정
vercel env add USER_ID
vercel env add NOTION_CATEGORY_DB_ID
vercel env add NOTION_CONTENT_DB_ID

# 배포
vercel --prod
```

### 2. Netlify 배포
```bash
# netlify.toml
[build.environment]
  USER_ID = "user_12345"
  NOTION_CATEGORY_DB_ID = "abc123..."
  NOTION_CONTENT_DB_ID = "def456..."
```

## 🎉 결론

중앙 집중식 Integration 서비스를 통해:
- **90% 설정 복잡도 감소**
- **토큰 관리 불필요**
- **즉시 배포 가능**
- **자동 보안 및 모니터링**

사용자는 이제 단 3개의 환경변수만 설정하면 즉시 사이트를 배포할 수 있습니다!