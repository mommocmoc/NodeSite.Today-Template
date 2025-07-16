# 🚀 NodeSite.Today 서비스 구축 가이드

## 📋 개요

NodeSite.Today는 Notion 워크스페이스를 원클릭으로 아름다운 웹사이트로 변환하는 서비스입니다. 사용자는 OAuth 인증만 하면 자동으로 템플릿이 복제되고 웹사이트가 구축됩니다.

## 🏗️ 아키텍처

```
[사용자] → [OAuth 인증] → [템플릿 자동 복제] → [데이터 추출] → [GitHub 레포 생성] → [자동 배포] → [완성된 웹사이트]
```

## 🎯 핵심 기능

### 1. OAuth 기반 템플릿 복제
- **Public Integration** 활용
- **자동 템플릿 복제** (`duplicated_template_id`)
- **읽기 권한만** 부여로 보안 강화

### 2. 자동 데이터베이스 추출
- 복제된 템플릿에서 카테고리/콘텐츠 DB 자동 식별
- DB ID 추출 및 검증
- 접근 권한 테스트

### 3. GitHub 자동화
- 템플릿 레포지토리에서 새 레포 생성
- 환경 변수 자동 설정 (GitHub Secrets)
- 배포 준비 완료

### 4. 실시간 진행 상황 추적
- 프로젝트 상태 관리
- 사용자 대시보드
- 에러 처리 및 복구

## 📁 프로젝트 구조

```
lib/
├── oauth-service.ts          # OAuth 인증 및 템플릿 복제
├── github-service.ts         # GitHub API 통합
├── central-integration.ts    # 기존 중앙 서비스 (옵션)
└── user-management.ts        # 사용자 관리 (옵션)

pages/
├── nodesite.tsx             # 메인 랜딩 페이지
├── dashboard/[projectId].tsx # 사용자 대시보드
└── api/
    ├── auth/notion/
    │   ├── authorize.ts     # OAuth 시작
    │   └── callback.ts      # OAuth 콜백
    ├── project/[projectId].ts # 프로젝트 관리
    └── build/create.ts      # 웹사이트 빌드 시작
```

## 🔧 설정 방법

### 1. 환경 변수 설정

```bash
# OAuth 설정
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=https://your-domain.com/api/auth/notion/callback
NOTION_TEMPLATE_URL=https://notion.so/your-template-page

# GitHub 통합
GITHUB_TOKEN=your_github_token
GITHUB_TEMPLATE_REPO=owner/NodeSite.Today-Template

# Vercel 통합 (선택사항)
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_team_id
```

### 2. Notion Public Integration 생성

1. https://www.notion.so/my-integrations 방문
2. "New integration" 클릭
3. **Public Integration** 선택
4. Integration 정보 입력:
   - Name: NodeSite.Today
   - Description: Transform Notion to Website
   - Logo: 서비스 로고 업로드
5. **Redirect URI** 설정: `https://your-domain.com/api/auth/notion/callback`
6. **Template URL** 설정: 복제할 템플릿 페이지 URL
7. **Capabilities** 설정:
   - Read content: ✅
   - Read user information: ✅
   - No comment, update, or insert permissions needed

### 3. 템플릿 페이지 준비

템플릿 페이지는 다음 구조를 가져야 합니다:
- **Categories Database**: 네비게이션 메뉴 관리
- **Content Database**: 실제 콘텐츠 페이지들
- **공개 페이지**로 설정 (Public Integration이 접근 가능하도록)

## 🚀 사용자 플로우

### 1. 사용자 경험
```
1. NodeSite.Today 방문
2. "Create Your Website Now" 클릭
3. Notion OAuth 인증
4. 템플릿 복제 선택
5. 자동으로 웹사이트 구축
6. 완성된 사이트 확인
```

### 2. 백엔드 처리
```
1. OAuth 인증 시작 (/api/auth/notion/authorize)
2. 사용자가 Notion에서 권한 부여
3. 콜백 처리 (/api/auth/notion/callback)
4. 템플릿 복제 및 데이터 추출
5. 프로젝트 생성 및 대시보드 리다이렉트
6. 사용자가 빌드 시작 버튼 클릭
7. GitHub 레포 생성 (/api/build/create)
8. 자동 배포 및 완료
```

## 🔍 상태 관리

프로젝트는 다음 상태들을 가집니다:

- `template_copied`: 템플릿이 복제됨
- `databases_extracted`: 데이터베이스가 추출됨
- `website_building`: 웹사이트를 구축 중
- `deployed`: 배포 완료
- `error`: 오류 발생

## 📊 모니터링 및 분석

### 사용자 추적
- 프로젝트 생성 시점
- 빌드 시작 시점
- 배포 완료 시점
- 에러 발생 지점

### 성능 메트릭
- 평균 빌드 시간
- 성공률
- 사용자 만족도

## 🛠️ 개발 및 배포

### 로컬 개발
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일 편집

# 개발 서버 시작
npm run dev
```

### 프로덕션 배포
```bash
# Vercel 배포
vercel --prod

# 또는 기타 플랫폼
npm run build
npm start
```

## 🔐 보안 고려사항

### OAuth 보안
- State 파라미터 사용 (CSRF 방지)
- Secure redirect URI 검증
- 토큰 안전한 저장

### API 보안
- Rate limiting
- 입력 검증
- 에러 처리

### 데이터 보안
- 최소 권한 원칙
- 읽기 전용 접근
- 민감 정보 마스킹

## 📈 확장 계획

### Phase 2 기능
- 커스텀 도메인 연결
- 테마 선택 기능
- 실시간 미리보기

### Phase 3 기능
- 팀 협업 기능
- 분석 대시보드
- 자동 SEO 최적화

## 🎉 결론

NodeSite.Today는 복잡한 웹사이트 구축 과정을 단 몇 번의 클릭으로 단순화합니다:

- **90% 설정 복잡도 감소**
- **2분 만에 웹사이트 완성**
- **기술 지식 불필요**
- **완전 자동화 프로세스**

이제 누구나 Notion 페이지를 아름다운 웹사이트로 변환할 수 있습니다!