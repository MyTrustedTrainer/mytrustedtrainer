import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
          const { email } = await request.json()
          if (!email) {
                  return NextResponse.json({ exists: false })
          }

      // Use service role key to check if user exists
      const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
            )

      const emailLower = email.trim().toLowerCase()

      // listUsers returns paginated result — use type assertion to avoid TS narrowing issues
      const result = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
          if (result.error) {
                  return NextResponse.json({ exists: false })
          }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (result as any).data.users as Array<{ email?: string }>
          const exists = users.some((u) => u.email?.toLowerCase() === emailLower)
          return NextResponse.json({ exists })
    } catch {
          return NextResponse.json({ exists: false })
    }
}
