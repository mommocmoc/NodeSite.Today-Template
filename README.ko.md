# 노션 포트폴리오 템플릿

> 노션 CMS를 활용한 현대적이고 동적인 포트폴리오 템플릿 (갤러리 + 단일 페이지 뷰)

[**한국어 README**](./README.ko.md) | [**English README**](./README.md)

[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![Notion](https://img.shields.io/badge/Notion-CMS-blue)](https://notion.so)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ 주요 기능

- **🎨 동적 갤러리 레이아웃**: 포트폴리오, 사진, 창작물 전시에 최적화
- **📄 단일 페이지 뷰**: react-notion-x를 활용한 깔끔하고 집중된 콘텐츠 표현
- **🗂️ 동적 네비게이션**: 노션 데이터베이스를 통한 완전한 네비게이션 관리
- **🎯 이중 표시 모드**: 카테고리별로 갤러리/단일 페이지 뷰 선택 가능
- **📱 완전 반응형**: 모든 기기에서 작동하는 모바일 우선 디자인
- **⚡ 성능 최적화**: 지연 로딩, 캐싱, Next.js 최적화 적용
- **🌍 한국어 지원**: 한국어 콘텐츠 및 속성 기본 지원
- **🎬 미디어 지원**: 이미지 및 동영상 자동 타입 감지
- **🚀 간편한 배포**: Vercel 원클릭 배포

## 🚀 빠른 시작

### 1. 템플릿 사용하기

위의 **"Use this template"** 버튼을 클릭하거나 [여기를 클릭](../../generate)하여 새 저장소를 생성하세요.

### 2. 노션 데이터베이스 설정

노션에서 두 개의 데이터베이스를 생성하세요:

#### 메인 콘텐츠 데이터베이스
- **제목** (제목): 타이틀 속성
- **썸네일** (파일 및 미디어): 썸네일 이미지/동영상  
- **Description** (서식 있는 텍스트): 선택적 설명
- **노출 순서** (숫자): 표시 순서 (선택사항)
- **페이지 카테고리** (관계형): 네비게이션 데이터베이스와 연결

#### 네비게이션 데이터베이스  
- **표시명** (제목): 네비게이션에 표시될 이름
- **네비게이션 순서** (숫자): 네비게이션 순서
- **활성화** (체크박스): 네비게이션 항목 활성화/비활성화
- **표시 방식** (선택): "Gallery" 또는 "Single Page" 선택

### 3. 환경 설정

1. 새 저장소를 클론하세요:
```bash
git clone [your-repo-url]
cd [your-repo-name]
npm install
```

2. 환경 템플릿을 복사하세요:
```bash
cp .env.example .env.local
```

3. `.env.local`을 노션 정보로 업데이트하세요:
```bash
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_main_database_id
NOTION_NAVIGATION_DB_ID=your_navigation_database_id
```

4. `site.config.ts`를 사이트 정보로 업데이트하세요:
```typescript
export default siteConfig({
  rootNotionPageId: 'your-notion-page-id',
  name: 'Your Site Name',
  domain: 'yourdomain.com',
  author: 'Your Name',
  description: 'Your site description',
})
```

### 4. 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 📖 작동 원리

### 표시 유형

**갤러리 모드**: 포트폴리오에 최적화, 반응형 그리드로 썸네일 표시
**단일 페이지 모드**: About 페이지, 연락처 정보 등을 위한 깔끔하고 집중된 콘텐츠 표현

### 동적 네비게이션

모든 네비게이션은 노션 네비게이션 데이터베이스에서 관리됩니다:
- 새 행을 만들어 새 카테고리 추가
- "네비게이션 순서" 숫자를 변경하여 순서 조정
- "활성화" 체크박스로 표시 여부 조절
- "표시 방식"으로 갤러리/단일 페이지 뷰 전환

### 콘텐츠 관리

1. **새 콘텐츠 추가**: 메인 콘텐츠 데이터베이스에 새 페이지 생성
2. **카테고리 설정**: 적절한 네비게이션 데이터베이스 항목과 연결
3. **미디어 추가**: "썸네일" 속성에 이미지나 동영상 업로드
4. **순서 조절**: "노출 순서"를 사용하여 표시 순서 조절

## 🛠️ 커스터마이징

### 스타일링
- 전역 스타일은 `/styles/globals.css` 수정
- CSS 커스텀 속성에서 색상 체계 업데이트
- 각 컴포넌트의 `.module.css` 파일에서 컴포넌트 스타일 커스터마이징

### 레이아웃
- 갤러리 그리드 설정: `components/NotionApiGallery.tsx`
- 단일 페이지 레이아웃: `components/SinglePageView.tsx`
- 네비게이션 동작: `components/OverlayNavigation.tsx`

## 📦 기술 스택

- **프레임워크**: Next.js 13+ with App Router
- **CMS**: Notion Official API
- **렌더링**: react-notion-x (리치 노션 콘텐츠)
- **스타일링**: CSS Modules with custom properties
- **TypeScript**: 완전한 타입 안정성
- **배포**: Vercel (권장)

## 🎯 사용 사례

이 템플릿은 다음과 같은 용도에 적합합니다:

- **포트폴리오 사이트**: 디자이너, 사진작가, 개발자
- **크리에이티브 에이전시**: 작업물 쇼케이스
- **개인 블로그**: 갤러리 + 블로그 포스트 조합
- **비즈니스 사이트**: 서비스 소개 + 사례 연구
- **전시 사이트**: 작품, 프로젝트 전시

## 📋 노션 데이터베이스 설정 가이드

### 1단계: 노션 통합 생성
1. [노션 개발자 페이지](https://www.notion.so/my-integrations)로 이동
2. "새 통합" 클릭
3. 통합 이름 입력 및 워크스페이스 선택
4. 생성된 토큰 복사 (`NOTION_API_KEY`로 사용)

### 2단계: 데이터베이스 생성 및 연결
1. 노션에서 메인 콘텐츠 데이터베이스 생성
2. 네비게이션 데이터베이스 생성
3. 각 데이터베이스에 통합 연결 (공유 → 통합 추가)
4. 데이터베이스 URL에서 ID 복사

### 3단계: 속성 설정
메인 콘텐츠 데이터베이스:
```
제목 (Title) - 필수
썸네일 (Files & media) - 선택사항
Description (Rich text) - 선택사항  
노출 순서 (Number) - 선택사항
페이지 카테고리 (Relation to 네비게이션 DB) - 필수
```

네비게이션 데이터베이스:
```
표시명 (Title) - 필수
네비게이션 순서 (Number) - 필수
활성화 (Checkbox) - 필수
표시 방식 (Select: Gallery, Single Page) - 필수
```

## 🤝 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

## 📄 라이선스

MIT 라이선스 - 프로젝트에 자유롭게 사용하세요!

---

**도움이 필요하신가요?** [노션 API 문서](https://developers.notion.com/)를 확인하거나 이슈를 등록해주세요.