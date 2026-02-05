import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { LoadingProvider } from "./contexts/loadingContext";
import { ViewModeProvider } from "./contexts/ViewModeContext";
import { useLoading } from "./contexts/loadingContext";
import AppRoutes from "./routes/routes";
import "./App.css";

const AppContent = () => {
  const { isLoading, successMessage, showSuccess } = useLoading();

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{successMessage}</span>
          <button
            onClick={() => showSuccess(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <LoadingProvider>
          <ViewModeProvider>
            <AppContent />
          </ViewModeProvider>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
};

// Health check endpoint
export const healthCheck = () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: import.meta.env.NODE_ENV,
    version: import.meta.env.VITE_APP_VERSION,
    name: import.meta.env.VITE_APP_NAME
  };
};

export default App;
