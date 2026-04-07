import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code, Globe, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            alfa<span className="text-primary">comp</span>.uz
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
            Войти
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground mb-6 border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Бесплатный хостинг для ваших сайтов
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Публикуйте сайты
            <br />
            <span className="text-primary">за секунды</span>
          </h2>

          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
            Вставьте HTML, CSS и JavaScript — получите сайт на персональном поддомене.
            Никаких серверов, никаких настроек.
          </p>

          <div className="mt-8 flex gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Начать бесплатно
            </Button>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-card border border-border rounded-lg p-5">
              <Code className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-medium text-sm">Редактор кода</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Вставьте HTML, CSS и JS прямо в браузере
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <Globe className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-medium text-sm">Персональный домен</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ваш сайт на имя.alfacomp.uz
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <Zap className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-medium text-sm">SEO настройки</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Title, Description и Favicon для каждого сайта
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 alfacomp.uz
      </footer>
    </div>
  );
}
