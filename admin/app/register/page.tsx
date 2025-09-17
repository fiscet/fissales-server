import AuthGuard from '@/components/auth/AuthGuard';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <RegisterForm />
    </AuthGuard>
  );
}
