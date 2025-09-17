import AuthGuard from '@/components/auth/AuthGuard';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthGuard requireAuth={false}>
      <ForgotPasswordForm />
    </AuthGuard>
  );
}
