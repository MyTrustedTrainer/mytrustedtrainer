import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ContactForm from './contact-form'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trainer_profiles')
    .select('full_name, tagline, bio')
    .eq('slug', params.id)
    .single()
  if (!data) return { title: 'Trainer Not Found' }
  return {
    title: `${data.full_name} | MyTrustedTrainer`,
    description: data.tagline || data.bio?.substring(0, 160) || ''
  }
}

export default async function TrainerProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select(`*, trainer_scores(*), trainer_specialties(*), certifications(*), packages(*)`)
    .eq('slug', params.id)
    .single()

  if (!trainer) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('review_date', { ascending: false })
    .limit(10)

  const score = trainer.trainer_scores

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-[#03243F] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>
            <span className="text-[#18A96B]">My</span>TrustedTrainer
          </Link>
          <Link href="/search" className="text-gray-300 hover:text-white text-sm">← Back to Search</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#03243F]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#18A96B] flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {trainer.avatar_url
                ? <img src={trainer.avatar_url} alt={trainer.full_name} className="w-full h-full rounded-2xl object-cover" />
                : trainer.full_name.charAt(0)
              }
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily:'Playfair Display'}}>
                  {trainer.full_name}
                </h1>
                {trainer.is_verified && (
                  <span className="bg-[#18A96B] text-white text-xs px-2 py-1 rounded-full">✓ Verified</span>
                )}
              </div>
              {trainer.tagline && <p className="text-gray-300 text-lg mb-3">{trainer.tagline}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span>📍 {trainer.city}, {trainer.state}</span>
                {score?.total_review_count > 0 && (
                  <span>⭐ {score.overall_score?.toFixed(1)} · {score.total_review_count} reviews</span>
                )}
              </div>
            </div>
            {/* Score Badge */}
            {score?.overall_score > 0 && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center flex-shrink-0">
                <div className="text-4xl font-bold text-[#F4A636]">{score.overall_score?.toFixed(1)}</div>
                <div className="text-yellow-400 text-lg">{'★'.repeat(Math.round(score.overall_score))}</div>
                <div className="text-gray-300 text-sm">{score.total_review_count} reviews</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specialties */}
          {trainer.trainer_specialties?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {trainer.trainer_specialties.map((s: any) => (
                  <span key={s.id} className="bg-[#E8F8F2] text-[#18A96B] px-4 py-2 rounded-full text-sm font-medium">
                    {s.specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {trainer.bio && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trainer.bio}</p>
            </div>
          )}

          {/* Review Sources */}
          {score && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Review Scores</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {label:'Google', score: score.google_score, count: score.google_count, color:'#4285F4'},
                  {label:'Yelp', score: score.yelp_score, count: score.yelp_count, color:'#D32323'},
                  {label:'Facebook', score: score.facebook_score, count: score.facebook_count, color:'#1877F2'},
                  {label:'Platform', score: score.platform_score, count: score.platform_count, color:'#18A96B'},
                ].filter(s => s.count > 0).map(s => (
                  <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold" style={{color: s.color}}>{s.score?.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.count} reviews</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>
                Reviews ({score?.total_review_count || 0})
              </h2>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#03243F]">{review.reviewer_name || 'Anonymous'}</p>
                        <div className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{review.platform}</span>
                        {review.review_date && (
                          <p className="text-xs text-gray-400 mt-1">{new Date(review.review_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    {review.body && <p className="text-gray-600 text-sm">{review.body}</p>}
                    {review.trainer_response && (
                      <div className="mt-2 pl-4 border-l-2 border-[#18A96B]">
                        <p className="text-xs text-gray-500 mb-1">Trainer Response:</p>
                        <p className="text-sm text-gray-600">{review.trainer_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {trainer.packages?.filter((p: any) => p.is_active).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Training Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainer.packages.filter((p: any) => p.is_active).map((pkg: any) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-[#03243F] mb-1">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#18A96B]">
                        ${(pkg.price_cents / 100).toFixed(0)}
                      </span>
                      {pkg.sessions && <span className="text-sm text-gray-500">{pkg.sessions} sessions</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Form */}
          <ContactForm trainerId={trainer.id} trainerName={trainer.full_name} />

          {/* Certifications */}
          {trainer.certifications?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#03243F] mb-3" style={{fontFamily:'Playfair Display'}}>Certifications</h3>
              <ul className="space-y-2">
                {trainer.certifications.map((cert: any) => (
                  <li key={cert.id} className="flex items-start gap-2">
                    <span className="text-[#18A96B] mt-0.5">✓</span>
                    <div>
                      <p className="text-sm font-medium text-[#03243F]">{cert.name}</p>
                      {cert.issuing_org && <p className="text-xs text-gray-500">{cert.issuing_org}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {(trainer.instagram || trainer.facebook || trainer.youtube || trainer.tiktok || trainer.website) && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#03243F] mb-3" style={{fontFamily:'Playfair Display'}}>Connect</h3>
              <div className="space-y-2">
                {trainer.website && (
                  <a href={trainer.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A96B]">
                    🌐 Website
                  </a>
                )}
                {trainer.instagram && (
                  <a href={`https://instagram.com/${trainer.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A96B]">
                    📸 Instagram
                  </a>
                )}
                {trainer.facebook && (
                  <a href={trainer.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#18A96B]">
                    👤 Facebook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}