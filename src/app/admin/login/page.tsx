import { LoginForm } from './LoginForm';

export default function AdminLogin() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Admin sign in</h1>
      <LoginForm />
    </div>
  );
}
