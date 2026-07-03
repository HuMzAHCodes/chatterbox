import { AuthProvider } from '../context/AuthContext.jsx';
import './globals.css';

export const metadata = {
  title: 'ChatterBox',
  description: 'Real-time chat application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}