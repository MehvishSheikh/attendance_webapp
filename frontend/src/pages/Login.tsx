import AuthForm from '@/components/AuthForm'

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-primary"
            >
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
              <path d="M12 6v6l4 4" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold">Welcome to Senslyze</h1>
          <p className="mt-2 text-gray-600">
            Sign in to track your attendance and tasks
          </p>
        </div>
        
        <AuthForm type="login" />
      </div>
    </div>
  )
}
