import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <Link href="/signup" className="text-gray-300 hover:text-white text-sm">New here? Sign up free</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#03243F] font-[Playfair_Display,serif] mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Sign in to your MyTrustedTrainer account</p>
          <div className="space-y-4">
            <input type="email" placeholder="Email Address" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            <input type="password" placeholder="Password" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            <button className="w-full bg-[#18A96B] hover:bg-[#13875A] text-white font-bold py-3 rounded-xl transition-all">Sign In</button>
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">
            <Link href="/forgot-password" className="text-[#18A96B]">Forgot password?</Link> · <Link href="/signup" className="text-[#18A96B]">Create account</Link>
          </p>
        </div>
      </div>
    </main>
  )
}