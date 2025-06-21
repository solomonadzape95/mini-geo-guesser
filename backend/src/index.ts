import { Errors, createClient } from '@farcaster/quick-auth'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types'

const quickAuthClient = createClient()

interface User {
  fid: number
  primaryAddress?: string
  profileId?: number
}

// Resolve information about the authenticated Farcaster user
async function resolveUser(fid: number): Promise<User> {
  const primaryAddress = await (async () => {
    try {
      const res = await fetch(
        `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`,
      )
      if (res.ok) {
        const { result } = await res.json<{
          result: {
            address: {
              fid: number
              protocol: 'ethereum' | 'solana'
              address: string
            }
          }
        }>()

        return result.address.address
      }
    } catch (error) {
      console.error('Error fetching primary address:', error)
    }
    return undefined
  })()

  return {
    fid,
    primaryAddress,
  }
}

// Ensure user exists in profiles table
async function ensureUserProfile(user: User, supabase: any): Promise<User> {
  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('fid', user.fid.toString())
      .single()

    if (existingProfile) {
      return { ...user, profileId: existingProfile.id }
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({ fid: user.fid.toString() })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw new Error('Failed to create user profile')
    }

    return { ...user, profileId: newProfile.id }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    throw error
  }
}

// Set user context for RLS policies
async function setUserContext(profileId: number, supabase: any) {
  await supabase.rpc('set_user_context', { profile_id: profileId })
}

const quickAuthMiddleware = createMiddleware<{
  Bindings: {
    HOSTNAME: string
    SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
  }
  Variables: {
    user: User
  }
}>(async (c, next) => {
  const authorization = c.req.header('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing token' })
  }

  try {
    const payload = await quickAuthClient.verifyJwt({
      token: authorization.split(' ')[1] as string,
      domain: c.env.HOSTNAME,
    })

    // Initialize Supabase client with environment variables
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Resolve user information
    const user = await resolveUser(Number(payload.sub))
    
    // Ensure user exists in profiles table
    const userWithProfile = await ensureUserProfile(user, supabase)
    c.set('user', userWithProfile)
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.info('Invalid token:', e.message)
      throw new HTTPException(401, { message: 'Invalid token' })
    }

    console.error('Auth error:', e)
    throw new HTTPException(500, { message: 'Authentication failed' })
  }

  await next()
})

const app = new Hono<{
  Bindings: {
    HOSTNAME: string
    SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
  }
}>()

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://mini-geo-guesser-a8hd.vercel.app/'],
  credentials: true,
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get current user
app.get('/me', quickAuthMiddleware, (c) => {
  const user = c.get('user')
  return c.json({
    fid: user.fid,
    primaryAddress: user.primaryAddress,
    profileId: user.profileId,
  })
})

// Get user profile with additional data
app.get('/profile', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)
    
    // Get user's game history
    const { data: userGames } = await supabase
      .from('user_games')
      .select(`
        id,
        score,
        created_at,
        gameID
      `)
      .eq('userID', user.profileId!)
      .order('created_at', { ascending: false })

    // Get user's badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        id,
        created_at,
        badgeID,
        badges (
          id,
          name,
          description,
          category
        )
      `)
      .eq('userID', user.profileId!)

    return c.json({
      fid: user.fid,
      primaryAddress: user.primaryAddress,
      profileId: user.profileId,
      games: userGames || [],
      badges: userBadges || [],
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw new HTTPException(500, { message: 'Failed to fetch profile' })
  }
})

// Save game result
app.post('/games/save', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    const body = await c.req.json()
    const { gameId, score } = body

    if (!gameId || typeof score !== 'number') {
      throw new HTTPException(400, { message: 'Invalid request body' })
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)

    const { data, error } = await supabase
      .from('user_games')
      .insert({
        gameID: gameId,
        score: score,
        userID: user.profileId!,
        lastSignIn: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving game:', error)
      throw new HTTPException(500, { message: 'Failed to save game' })
    }

    return c.json({ success: true, gameResult: data })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error saving game:', error)
    throw new HTTPException(500, { message: 'Failed to save game' })
  }
})

// Get user's game history
app.get('/games/history', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)
    
    const { data, error } = await supabase
      .from('user_games')
      .select(`
        id,
        score,
        created_at,
        gameID,
        games (
          id,
          name,
          coords,
          date
        )
      `)
      .eq('userID', user.profileId!)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching game history:', error)
      throw new HTTPException(500, { message: 'Failed to fetch game history' })
    }

    return c.json({ games: data || [] })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error fetching game history:', error)
    throw new HTTPException(500, { message: 'Failed to fetch game history' })
  }
})

// Get user's badges
app.get('/badges', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)
    
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        created_at,
        badgeID,
        badges (
          id,
          name,
          description,
          category,
          locked
        )
      `)
      .eq('userID', user.profileId!)

    if (error) {
      console.error('Error fetching badges:', error)
      throw new HTTPException(500, { message: 'Failed to fetch badges' })
    }

    return c.json({ badges: data || [] })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error fetching badges:', error)
    throw new HTTPException(500, { message: 'Failed to fetch badges' })
  }
})

export default app 