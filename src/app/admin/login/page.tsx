import { LoginForm } from './LoginForm';

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
            <p className="text-slate-500 text-sm mt-1">
              Área protegida para administradores
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
