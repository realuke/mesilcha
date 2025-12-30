"use client"

import React from 'react';
import Navbar from "@/components/navbar";

export default function IntroPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10 text-white">
        <div className="bg-black/20 rounded-lg p-6 md:p-8 shadow-xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            매실차 프로젝트 소개
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-6">
            <strong className="font-bold">매실차, &quot;매일의 실천이 만드는 차이&quot; 프로젝트</strong>는 무엇인가요?
            매실차 프로젝트는 하루하루 작은 습관을 실천하고, 실천 기록을 확인하고 친구들과 공유하면서 성장해 나가는 것을 목적으로 하는 웹 어플리케이션입니다.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-6">
            목표를 설정하고, 그것을 달성하기 위해 매일 노력하는 것은 결코 쉬운 일이 아닙니다. 많은 이들이 목표와 계획을 세우지만, 포기하곤 합니다.
            그렇기 때문에, 매실차 프로젝트에서는 아주 작은 목표부터 매일 실천하는 것을 목표로 합니다.
            목표를 실천해나가는 과정을 기록하고, 친구들 및 선생님과 공유하며, 함께 목표를 향해 나아가는 즐거움을 우리 모두가 느낄 수 있기를 바랍니다.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-6">
            아래 영상은 매실차 프로젝트의 제작 계기가 된, 한 어르신의 이야기를 담고 있습니다.
          </p>
          <div className="relative w-full overflow-hidden rounded-lg shadow-md mb-6" style={{paddingTop: '56.25%'}}> {/* 16:9 Aspect Ratio */}
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/rLtFCm_MJJE"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mt-8 mb-4">
            주요 기능
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base md:text-lg mb-6">
            <li><strong className="font-semibold">구글 로그인</strong>: 간편하게 구글 계정으로 로그인하여 서비스를 이용할 수 있습니다.</li>
            <li><strong className="font-semibold">습관 설정 및 기록</strong>: 자신만의 목표(습관)를 설정하고 매일매일 실천 내용을 게시물로 기록합니다.</li>
            <li><strong className="font-semibold">게시판</strong>: 다른 사용자들의 실천 기록을 보고 댓글로 소통할 수 있습니다.</li>
            <li><strong className="font-semibold">선생님 승인</strong>: 선생님은 학생들의 실천 게시물을 확인하고 &apos;실천 완료!&apos; 도장을 찍어줄 수 있습니다.</li>
            <li><strong className="font-semibold">통계 페이지</strong>: 모든 사용자의 실천 완료 횟수를 한눈에 볼 수 있는 리더보드를 제공합니다.</li>
          </ul>

          <p className="text-lg md:text-xl leading-relaxed mb-6 mt-8 border-t pt-6">
            &apos;작심삼일&apos;도 100번 하면 300일이 된다는 말이 있습니다.
            여러분 모두가 끝까지 포기하지 않고, 계속해서 작은 변화를 통해 발전해 나가는 과정을 매실차 프로젝트가 함께할 수 있기를 바랍니다.
          </p>
        </div>
      </main>
    </div>
  );
}
