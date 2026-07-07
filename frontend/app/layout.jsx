import { Unbounded, Onest, Familjen_Grotesk, Gabarito } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext.jsx';
import './globals.css';

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const onest = Onest({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ui',
  display: 'swap',
});

const gabarito = Gabarito({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-badge',
  display: 'swap',
});

export const metadata = {
  title: 'ChatterBox',
  description: 'Real-time chat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${onest.variable} ${familjenGrotesk.variable} ${gabarito.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}