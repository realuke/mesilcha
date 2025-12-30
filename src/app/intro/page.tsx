"use client"

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from "@/components/navbar";

const markdownContent = `
# 매실차 프로젝트 소개

매실차, "매일의 실천이 만드는 차이" 프로젝트는 무엇인가요?
매실차 프로젝트는 하루하루 작은 습관을 실천하고, 실천 기록을 확인하고 친구들과 공유하면서 성장해 나가는 것을 목적으로 하는 어플리케이션입니다. 



## 프로젝트의 목적

*   **습관 형성 촉진**: 사용자들이 자신만의 목표를 설정하고 매일의 실천을 기록할 수 있도록 지원합니다.
*   **긍정적인 커뮤니티**: 선생님과 친구들이 서로의 노력을 응원하고, 성과를 공유하며 함께 성장하는 환경을 조성합니다.
*   **동기 부여**: 선생님의 '실천 완료!' 도장과 통계 페이지를 통해 사용자들에게 지속적인 동기를 부여합니다.

## 주요 기능

*   **구글 로그인**: 간편하게 구글 계정으로 로그인하여 서비스를 이용할 수 있습니다.
*   **습관 설정 및 기록**: 자신만의 목표(습관)를 설정하고 매일매일 실천 내용을 게시물로 기록합니다.
*   **게시판**: 다른 사용자들의 실천 기록을 보고 댓글로 소통할 수 있습니다.
*   **선생님 승인**: 선생님은 학생들의 실천 게시물을 확인하고 '실천 완료!' 도장을 찍어줄 수 있습니다.
*   **통계 페이지**: 모든 사용자의 실천 완료 횟수를 한눈에 볼 수 있는 리더보드를 제공합니다.

## 기술 스택

*   **프레임워크**: Next.js
*   **언어**: TypeScript
*   **UI 라이브러리**: React, shadcn/ui
*   **스타일링**: Tailwind CSS, Lucide React (아이콘)
*   **백엔드/데이터베이스**: Firebase (Firestore, Authentication)

---

저희 매실차 프로젝트와 함께 매일의 작은 실천으로 큰 변화를 만들어가세요!
감사합니다.
`;

export default function IntroPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="prose max-w-none p-2 text-white">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
