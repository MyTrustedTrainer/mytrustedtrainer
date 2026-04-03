'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientDashboard() {
      const supabase = createClient()
      const router = useRouter()
      const [user, setUser] = useState<any>(null)
      const [profile, setProfile] = useState<any>(null)
      const [savedTrainers, setSavedTrainers] = useState<any[]>([])
      const [loading, setLoading] = useState(true)
      const [saving, setSaving] = useState(false)
      const [message, setMessage] = useState('')
      const [form, setForm] = useState({
              full_name: '',
              phone: '',
              fitness_goals: '',
              age: '',
              gender: '',
              experience_level: '',
      })

  useEffect(() => {
          async function load() {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) { router.push('/login'); return }
                    setUser(user)
                    setForm(f => ({ ...f, full_name: user.user_metadata?.full_name || '' }))

            const { data: p } = await supabase
                      .from('client_profiles')
                      .select('*')
                      .eq('user_id', user.id)
                      .single()

            if (p) {
                        setProfile(p)
                        setForm({
                                      full_name: p.full_name || user.user_metadata?.full_name || '',
                                      phone: p.phone || '',
                                      fitness_goals: p.fitness_goals || '',
                                      age: p.age ? String(p.age) : '',
                                      gender: p.gender || '',
                                      experience_level: p.experience_level || '',
                        })
            }

            const { data: saved } = await supabase
                      .from('saved_trainers')
                      .select('*, trainer_profiles(full_name, slug, tagline, plan)')
                      .eq('client_id', user.id)
                    setSavedTrainers(saved || [])
                    setLoading(false)
          }
          load()
  }, [])

  async function handleSave(e: React.FormEvent) {
          e.preventDefault()
          setSaving(true)
          setMessage('')
          try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) return
                    const payload = {
                                user_id: user.id,
                                full_name: form.full_name,
                                phone: form.phone,
                                fitness_goals: form.fitness_goals,
                                age: form.age ? parseInt(form.age) : null,
                                gender: form.gender,
                                experience_level: form.experience_level,
                    }
                    if (profile) {
                                await supabase.from('client_profiles').update(payload).eq('user_id', user.id)
                    } else {
                                await supabase.from('client_profiles').insert(payload)
                                setProfile(payload)
                    }
                    setMessage('Profile saved!')
          } catch (err: any) {
                    setMessage('Error: ' + err.message)
          }
          setSaving(false)
  }

  if (loading) return (
          <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>div>
          </div>div>
        )
      
        return (
                <div className="min-h-screen bg-gray-50">
                      <header className="bg-[#03243F] text-white">
                              <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                                    <Link href="/" className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}>
                                                                  <span className="text-[#18A96B]">My</span>span>TrustedTrainer
                                                    </Link>Link>
                                                    <span className="text-gray-400 text-sm">My Account</span>span>
                                        </div>div>
                                        <div className="flex items-center gap-4">
                                                    <Link href="/search" className="text-sm text-[#18A96B] hover:underline">Find Trainers →</Link>Link>
                                                    <button
                                                                      onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                                                                      className="text-sm text-gray-300 hover:text-white"
                                                                    >Sign Out</button>button>
                                        </div>div>
                              </div>div>
                      </header>header>
                
                      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Profile Form */}
                              <div className="lg:col-span-2">
                                        <div className="bg-white rounded-2xl shadow-sm p-6">
                                                    <h2 className="text-2xl font-bold text-[#03243F] mb-6" style={{fontFamily:'Playfair Display'}}>
                                                                  My Profile
                                                    </h2>h2>
                                                    <form onSubmit={handleSave} className="space-y-4">
                                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                  <div>
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>label>
                                                                                                    <input
                                                                                                                            type="text"
                                                                                                                            value={form.full_name}
                                                                                                                            onChange={e => setForm({...form, full_name: e.target.value})}
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                                                                                                          />
                                                                                  </div>div>
                                                                                  <div>
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>label>
                                                                                                    <input
                                                                                                                            type="tel"
                                                                                                                            value={form.phone}
                                                                                                                            onChange={e => setForm({...form, phone: e.target.value})}
                                                                                                                            placeholder="(555) 123-4567"
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                                                                                                          />
                                                                                  </div>div>
                                                                                  <div>
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>label>
                                                                                                    <input
                                                                                                                            type="number"
                                                                                                                            value={form.age}
                                                                                                                            onChange={e => setForm({...form, age: e.target.value})}
                                                                                                                            placeholder="25"
                                                                                                                            min="13"
                                                                                                                            max="100"
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                                                                                                          />
                                                                                  </div>div>
                                                                                  <div>
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>label>
                                                                                                    <select
                                                                                                                            value={form.gender}
                                                                                                                            onChange={e => setForm({...form, gender: e.target.value})}
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                                                                                                          >
                                                                                                                        <option value="">Prefer not to say</option>option>
                                                                                                                        <option value="male">Male</option>option>
                                                                                                                        <option value="female">Female</option>option>
                                                                                                                        <option value="non-binary">Non-binary</option>option>
                                                                                                                        <option value="other">Other</option>option>
                                                                                                        </select>select>
                                                                                  </div>div>
                                                                                  <div>
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>label>
                                                                                                    <select
                                                                                                                            value={form.experience_level}
                                                                                                                            onChange={e => setForm({...form, experience_level: e.target.value})}
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                                                                                                          >
                                                                                                                        <option value="">Select level</option>option>
                                                                                                                        <option value="beginner">Beginner (new to fitness)</option>option>
                                                                                                                        <option value="intermediate">Intermediate (some experience)</option>option>
                                                                                                                        <option value="advanced">Advanced (consistent training)</option>option>
                                                                                                                        <option value="athlete">Athlete (competitive)</option>option>
                                                                                                        </select>select>
                                                                                  </div>div>
                                                                                  <div className="md:col-span-2">
                                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goals</label>label>
                                                                                                    <textarea
                                                                                                                            value={form.fitness_goals}
                                                                                                                            onChange={e => setForm({...form, fitness_goals: e.target.value})}
                                                                                                                            rows={3}
                                                                                                                            placeholder="What are you looking to achieve? (e.g. lose 20 lbs, train for a marathon, build muscle...)"
                                                                                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none"
                                                                                                                          />
                                                                                  </div>div>
                                                                  </div>div>
                                                    
                                                        {message && (
                                    <div className={`p-3 rounded-xl text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                        {message}
                                    </div>div>
                                                                  )}
                                                    
                                                                  <button
                                                                                      type="submit"
                                                                                      disabled={saving}
                                                                                      className="w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold hover:bg-[#15906A] disabled:opacity-50 transition-colors"
                                                                                    >
                                                                      {saving ? 'Saving...' : 'Save Profile'}
                                                                  </button>button>
                                                    </form>form>
                                        </div>div>
                              </div>div>
                      
                          {/* Sidebar */}
                              <div className="space-y-6">
                                  {/* Account Info */}
                                        <div className="bg-white rounded-2xl shadow-sm p-6">
                                                    <h3 className="text-lg font-bold text-[#03243F] mb-3" style={{fontFamily:'Playfair Display'}}>Account</h3>h3>
                                                    <p className="text-sm text-gray-600 mb-1">{user?.email}</p>p>
                                                    <p className="text-xs text-gray-400">Free client account</p>p>
                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                                  <Link
                                                                                      href="/search"
                                                                                      className="block w-full text-center bg-[#03243F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors"
                                                                                    >
                                                                                  Find a Trainer →
                                                                  </Link>Link>
                                                    </div>div>
                                        </div>div>
                              
                                  {/* Saved Trainers */}
                                        <div className="bg-white rounded-2xl shadow-sm p-6">
                                                    <h3 className="text-lg font-bold text-[#03243F] mb-3" style={{fontFamily:'Playfair Display'}}>Saved Trainers</h3>h3>
                                            {savedTrainers.length === 0 ? (
                                  <p className="text-sm text-gray-500">No saved trainers yet. Browse trainers and save your favorites.</p>p>
                                ) : (
                                  <div className="space-y-3">
                                      {savedTrainers.map((s: any) => (
                                                        <div key={s.id} className="flex items-center justify-between">
                                                                            <div>
                                                                                                  <p className="font-medium text-[#03243F] text-sm">{s.trainer_profiles?.full_name}</p>p>
                                                                                {s.trainer_profiles?.tagline && (
                                                                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{s.trainer_profiles.tagline}</p>p>
                                                                                                  )}
                                                                            </div>div>
                                                                            <Link href={`/trainers/${s.trainer_profiles?.slug}`} className="text-xs text-[#18A96B] hover:underline">View</Link>Link>
                                                        </div>div>
                                                      ))}
                                  </div>div>
                                                    )}
                                        </div>div>
                              </div>div>
                      </div>div>
                </div>div>
              )
}</div>
