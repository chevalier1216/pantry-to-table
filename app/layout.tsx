import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'今晚煮什麼 · Pantry to Table',description:'依現有食材、用餐人數、忌口、廚具與時間安排家庭料理。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
