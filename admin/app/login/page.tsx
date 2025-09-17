import AuthGuard from '@/components/auth/AuthGuard';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginForm />
    </AuthGuard>
  );
}
