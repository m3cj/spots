import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from '@/App';
import { AuthPromptProvider } from '@/context/AuthPromptContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { settle } from '@/utils/motion';
import '@/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* reducedMotion="user" drops transform animation but keeps opacity cross-fades. */}
          <MotionConfig reducedMotion="user" transition={settle}>
            <ToastProvider>
              <AuthPromptProvider>
                <App />
              </AuthPromptProvider>
            </ToastProvider>
          </MotionConfig>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
