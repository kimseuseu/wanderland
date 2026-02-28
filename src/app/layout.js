import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'WANDERLAND — 프로젝트 낙원',
  description: 'Once Human 프로젝트 낙원 공식 웹사이트. 장비 빌드 공유, 게임 지도, 멤버 관리, 블랙리스트.',
  icons: {
    icon: '/images/pabicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
