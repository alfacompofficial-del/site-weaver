import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast.error(error.message);
    } else if (isLogin) {
      navigate('/dashboard');
    } else {
      toast.success('Аккаунт создан! Проверьте почту для подтверждения.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            alfa<span className="text-primary">comp</span>.uz
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}
