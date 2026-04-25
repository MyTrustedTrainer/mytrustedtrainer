import { redirect } from 'next/navigation'

// Redirect /trainers to /search for backwards compatibility
export default function TrainersPage() {
  redirect('/search')
}
