import ChangePassword from '@/components/ChangePassword';

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-widest mb-6">Reset Password</h1>
        <ChangePassword />
      </div>
    </div>
  );
}
