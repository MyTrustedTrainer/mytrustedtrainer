'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import Link from 'next/link'

export default function AccountSettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    })
  }, [])

  async function handleDeleteAccount() {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.')
      return
    }
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete account. Please try again.')
        setDeleting(false)
        return
      }
      // Sign out and redirect to home
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch {
      setError('Network error. Please try again.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#03243F]" style={{fontFamily:'Playfair Display'}}>Account Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account preferences and data</p>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-[#03243F] mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email address</p>
              <p className="text-[#03243F] font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account created</p>
              <p className="text-[#03243F] font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-[#03243F] mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/dashboard/trainer" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-[#03243F] transition-colors">
              <span>📊</span>
              <span className="font-medium">Go to Dashboard</span>
            </Link>
            <Link href="/dashboard/trainer/edit" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-[#03243F] transition-colors">
              <span>✏️</span>
              <span className="font-medium">Edit Profile</span>
            </Link>
            <Link href="/for-trainers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-[#03243F] transition-colors">
              <span>⬆️</span>
              <span className="font-medium">Upgrade Plan</span>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">
            Once you delete your account, there is no going back. All your data, including your profile, conversations, and reviews, will be permanently removed.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-2">⚠️ This action is permanent and cannot be undone.</p>
                <p className="text-sm text-red-600">Type <strong>DELETE</strong> below to confirm you want to permanently delete your account and all associated data.</p>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full border border-red-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmText !== 'DELETE'}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button
                  onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
