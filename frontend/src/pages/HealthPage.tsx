import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import '../App.css';

interface HealthResponse {
  status: string;
  db: string;
  timestamp?: string;
}

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido de conexión');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isConnected = health?.status === 'ok' && health?.db === 'connected';

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <Layers size={28} color="#818cf8" />
          <h1>Promo Manager KF</h1>
        </div>
        <div
          className={`badge ${
            loading ? 'loading' : isConnected ? 'connected' : 'disconnected'
          }`}
        >
          <span className={`dot ${loading ? 'pulse' : ''}`} />
          {loading ? 'Verificando...' : isConnected ? 'Sistema Online' : 'Sistema Offline'}
        </div>
      </header>

      <main className="grid">
        {/* Backend & DB Health Check Status Card */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Activity size={20} color="#6366f1" /> Estado de Conexión
            </h2>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="button-primary"
              title="Volver a verificar estado"
            >
              <RefreshCw size={16} className={loading ? 'pulse' : ''} />
              Reintentar
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Prueba de conexión en tiempo real al endpoint <code>GET /health</code>:
          </p>

          <div className="status-box">
            {loading && <p>Consultando {apiUrl}/health ...</p>}
            {!loading && health && (
              <pre>{JSON.stringify(health, null, 2)}</pre>
            )}
            {!loading && error && (
              <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="tech-item">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={16} color="#818cf8" /> Backend API
              </span>
              <span style={{ color: health?.status === 'ok' ? '#34d399' : '#f87171', fontWeight: 600 }}>
                {health?.status === 'ok' ? 'OK (200)' : 'Desconectado'}
              </span>
            </div>

            <div className="tech-item">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} color="#818cf8" /> PostgreSQL + Prisma
              </span>
              <span style={{ color: health?.db === 'connected' ? '#34d399' : '#f87171', fontWeight: 600 }}>
                {health?.db === 'connected' ? 'Conectado (SELECT 1)' : 'Sin conexión'}
              </span>
            </div>
          </div>
        </section>

        {/* Tech Stack Summary Card */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <CheckCircle2 size={20} color="#10b981" /> Arquitectura Monorepo
            </h2>
          </div>

          <ul className="tech-list">
            <li className="tech-item">
              <span className="tech-name">Backend</span>
              <span className="tech-role">Node.js + Express + TypeScript + Zod</span>
            </li>
            <li className="tech-item">
              <span className="tech-name">ORM & Database</span>
              <span className="tech-role">Prisma Client + PostgreSQL 16</span>
            </li>
            <li className="tech-item">
              <span className="tech-name">Frontend</span>
              <span className="tech-role">React 18 + Vite + TypeScript</span>
            </li>
            <li className="tech-item">
              <span className="tech-name">Orquestación</span>
              <span className="tech-role">Docker Compose + Multi-stage Dockerfiles</span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>Prueba Técnica - Gestor de Promociones &bull; Estructura inicial configurada con éxito.</p>
      </footer>
    </div>
  );
};
