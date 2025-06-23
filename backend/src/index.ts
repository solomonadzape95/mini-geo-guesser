import { Errors, createClient } from '@farcaster/quick-auth'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types'
import { ethers } from "ethers";
import { NFT_ABI } from "./abi/nft";

const quickAuthClient = createClient()

interface User {
  fid: number
  primaryAddress?: string
  profileId?: number
  username?: string
  pfpUrl?: string
}

// Calculate streak based on consecutive days played
async function calculateStreak(supabase: any, profileId: number): Promise<number> {
  try {
    // Get user's game history ordered by date
    const { data: userGames } = await supabase
      .from('user_games')
      .select(`
        created_at,
        games (
          date
        )
      `)
      .eq('userID', profileId)
      .order('created_at', { ascending: false })

    if (!userGames || userGames.length === 0) {
      return 0
    }

    // Get unique dates when user played (using game date, not created_at)
    const playedDates = new Set<string>()
    userGames.forEach((game: any) => {
      if (game.games?.date) {
        playedDates.add(game.games.date)
      }
    })

    const sortedDates = Array.from(playedDates).sort().reverse()
    
    if (sortedDates.length === 0) {
      return 0
    }

    // Calculate consecutive days from most recent
    let streak = 1
    const today = new Date().toISOString().split('T')[0]
    
    // If most recent game is not today, start from yesterday
    let currentDate = sortedDates[0]
    if (currentDate !== today) {
      streak = 0
      currentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    // Count consecutive days
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i])
      const next = new Date(sortedDates[i + 1])
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

// Resolve information about the authenticated Farcaster user
async function resolveUser(fid: number): Promise<User> {
  const primaryAddressPromise = (async () => {
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

  const profileInfoPromise = (async () => {
    try {
      const res = await fetch(`https://app.icebreaker.xyz/api/v1/fid/${fid}`)
      if (res.ok) {
        const data: { profiles: { displayName: string; avatarUrl: string }[] } =
          await res.json()
        if (data.profiles && data.profiles.length > 0) {
          const profile = data.profiles[0]
          return {
            username: profile.displayName,
            pfpUrl: profile.avatarUrl,
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile info:', error)
    }
    return { username: undefined, pfpUrl: undefined }
  })()

  const [primaryAddress, profileInfo] = await Promise.all([
    primaryAddressPromise,
    profileInfoPromise,
  ])

  return {
    fid,
    primaryAddress,
    username: profileInfo.username,
    pfpUrl: profileInfo.pfpUrl,
  }
}

// Ensure user exists in profiles table and update lastSignIn
async function ensureUserProfile(user: User, supabase: any): Promise<User> {
  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, streak')
      .eq('fid', user.fid.toString())
      .single()

    if (existingProfile) {
      // Update lastSignIn
      await supabase
        .from('profiles')
        .update({ lastSignIn: new Date().toISOString() })
        .eq('id', existingProfile.id)

      return { ...user, profileId: existingProfile.id }
    }

    // Create new profile with default values
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({ 
        fid: user.fid.toString(),
        lastSignIn: new Date().toISOString(),
        streak: 0
      })
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
    NFT_CONTRACT_ADDRESS: string
    MINT_PRIVATE_KEY: string
    CELO_RPC_URL: string
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
    
    // Ensure user exists in profiles table and update lastSignIn
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
    NFT_CONTRACT_ADDRESS: string
    MINT_PRIVATE_KEY: string
    CELO_RPC_URL: string
  }
}>()

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://mini-geo-guesser-a8hd.vercel.app'],
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
    username: user.username,
    pfpUrl: user.pfpUrl,
  })
})

// Get all games for the current day
app.get('/games/today', quickAuthMiddleware, async (c) => {
  try {
    const user = c.get('user')
    
    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get user's game history for the current day
    const { data: userGames } = await supabase
      .from('user_games')
      .select(`
        id,
        created_at,
        score,
        games (
          id,
          name,
          coords,
          date
        )
      `)
      .eq('userID', user.profileId!)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })

    return c.json({ games: userGames || [] })
  } catch (error) {
    console.error('Error fetching today\'s games:', error)
    throw new HTTPException(500, { message: 'Failed to fetch today\'s games' })
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

// Get user's badges with claimed status
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
    
    // Get user's claimed badges
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
          category,
          locked
        )
      `)
      .eq('userID', user.profileId!)

    // Get all badges and mark claimed ones
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('id')

    // Mark badges as claimed if user has them
    const badgesWithClaimedStatus = allBadges?.map(badge => ({
      ...badge,
      claimed: userBadges?.some(userBadge => userBadge.badgeID === badge.id) || false
    })) || []

    return c.json({ badges: badgesWithClaimedStatus })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error fetching badges:', error)
    throw new HTTPException(500, { message: 'Failed to fetch badges' })
  }
})

// Mint a badge for the user
app.post('/badges/mint', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    const body = await c.req.json()
    const { badgeId } = body

    if (!badgeId || typeof badgeId !== 'number') {
      throw new HTTPException(400, { message: 'Invalid badge ID' })
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('userID', user.profileId!)
      .eq('badgeID', badgeId)
      .single()

    if (existingBadge) {
      throw new HTTPException(400, { message: 'Badge already claimed' })
    }

    // Check if badge exists and is unlocked
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single()

    if (badgeError || !badge) {
      throw new HTTPException(404, { message: 'Badge not found' })
    }

    if (badge.locked) {
      throw new HTTPException(400, { message: 'Badge is locked' })
    }

    // Mint the badge in DB as before
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        badgeID: badgeId,
        userID: user.profileId!,
      })
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
      .single()

    if (error) {
      console.error('Error minting badge:', error)
      throw new HTTPException(500, { message: 'Failed to mint badge' })
    }

    // In /badges/mint endpoint, capture all tx hashes
    let txHashes: string[] = [];
    // NFT minting logic (only if user has a primaryAddress)
    if (user.primaryAddress) {
      try {
        const contract = new ethers.Contract(
          c.env.NFT_CONTRACT_ADDRESS,
          NFT_ABI,
          new ethers.Wallet(
            c.env.MINT_PRIVATE_KEY,
            new ethers.JsonRpcProvider(c.env.CELO_RPC_URL)
          )
        );
        // Use the badge's metadata JSON as the tokenURI
        const badgeName = (badge && badge.name && typeof badge.name === 'string') ? badge.name : 'badge';
        const tokenURI = `https://mini-geo-guesser-a8hd.vercel.app/badges/${badgeName.toLowerCase().replace(/ /g, '-')}.json`;
        const tx = await contract.mint(user.primaryAddress, tokenURI);
        await tx.wait();
        txHashes.push(tx.hash);
        console.log(`NFT minted for badge ${badgeName} to ${user.primaryAddress}`);
      } catch (err) {
        console.error('NFT minting failed:', err);
      }
    }

    // Mint streak badge if streak is 1, 3, or 5 and not already claimed
    const streak = await calculateStreak(supabase, user.profileId!);
    const streakBadgeIds = { 1: 101, 3: 103, 5: 105 } as const; // Replace with actual badge IDs for streaks
    if ([1, 3, 5].includes(streak)) {
      const streakKey = streak as 1 | 3 | 5;
      const streakBadgeId = streakBadgeIds[streakKey];
      // Check if user already has this streak badge
      const { data: hasStreakBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('userID', user.profileId!)
        .eq('badgeID', streakBadgeId)
        .single();
      if (!hasStreakBadge) {
        // Mint the streak badge
        await supabase
          .from('user_badges')
          .insert({ badgeID: streakBadgeId, userID: user.profileId! });
        // In streak badge minting, if NFT is minted, also push tx.hash to txHashes
        if (user.primaryAddress) {
          try {
            const contract = new ethers.Contract(
              c.env.NFT_CONTRACT_ADDRESS,
              NFT_ABI,
              new ethers.Wallet(
                c.env.MINT_PRIVATE_KEY,
                new ethers.JsonRpcProvider(c.env.CELO_RPC_URL)
              )
            );
            const streakBadgeName = streak === 1 ? 'Noob Guesser' : streak === 3 ? "Three Time's the Charm" : 'Furious Five';
            const tokenURI = `https://mini-geo-guesser-a8hd.vercel.app/badges/${streakBadgeName.toLowerCase().replace(/ /g, '-').replace(/'/g, '')}.json`;
            const tx = await contract.mint(user.primaryAddress, tokenURI);
            await tx.wait();
            txHashes.push(tx.hash);
            console.log(`NFT minted for streak badge ${streakBadgeName} to ${user.primaryAddress}`);
          } catch (err) {
            console.error('NFT minting failed for streak badge:', err);
          }
        }
      }
    }

    return c.json({ 
      success: true, 
      badge: data,
      txHashes
    })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error minting badge:', error)
    throw new HTTPException(500, { message: 'Failed to mint badge' })
  }
})

// Get All-Time Leaderboard
app.get('/leaderboard/all-time', async (c) => {
  try {
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('user_games')
      .select('score, profiles(fid)')
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;

    const leaderboard = data.reduce((acc, game) => {
      const fid = game.profiles?.fid;
      if (fid) {
        if (!acc[fid]) {
          acc[fid] = { fid: fid, totalScore: 0, gameCount: 0 };
        }
        acc[fid].totalScore += game.score || 0;
        acc[fid].gameCount += 1;
      }
      return acc;
    }, {} as Record<string, { fid: string, totalScore: number, gameCount: number }>);

    const sortedLeaderboard = Object.values(leaderboard)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 100);

    return c.json(sortedLeaderboard);
  } catch (error) {
    console.error('Error fetching all-time leaderboard:', error);
    throw new HTTPException(500, { message: 'Failed to fetch all-time leaderboard' });
  }
});

// Get Daily Leaderboard
app.get('/leaderboard/daily', async (c) => {
  try {
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('user_games')
      .select('score, profiles(fid)')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    const leaderboard = data.map(game => ({
        fid: game.profiles?.fid,
        score: game.score,
    }));

    return c.json(leaderboard);
  } catch (error) {
    console.error('Error fetching daily leaderboard:', error);
    throw new HTTPException(500, { message: 'Failed to fetch daily leaderboard' });
  }
});

// Save game result
app.post('/games/save', quickAuthMiddleware, async (c) => {
  const user = c.get('user')
  
  try {
    const body = await c.req.json()
    const { gameId, score, guessResult, quizResult } = body

    if (!gameId || typeof gameId !== 'number' || !score || typeof score !== 'number') {
      throw new HTTPException(400, { message: 'Invalid game ID or score' })
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient<Database>(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Set user context for RLS
    await setUserContext(user.profileId!, supabase)

    // Save game result
    const insertObj: any = {
      gameID: gameId,
      score: score,
      userID: user.profileId!,
    };
    if (guessResult !== undefined) insertObj.guessResult = guessResult;
    if (quizResult !== undefined) insertObj.quizResult = quizResult;

    const { data, error } = await supabase
      .from('user_games')
      .insert(insertObj)
      .select(`
        id,
        score,
        created_at,
        gameID,
        guessResult,
        quizResult,
        games (
          id,
          name,
          coords,
          date
        )
      `)
      .single()

    if (error) {
      console.error('Error saving game result:', error)
      throw new HTTPException(500, { message: 'Failed to save game result' })
    }

    // Recalculate and update streak
    const newStreak = await calculateStreak(supabase, user.profileId!);
    await supabase
      .from('profiles')
      .update({ streak: newStreak })
      .eq('id', user.profileId!);

    return c.json({ 
      success: true, 
      game: data,
      streak: newStreak
    })
  } catch (error) {
    if (error instanceof HTTPException) throw error
    console.error('Error saving game result:', error)
    throw new HTTPException(500, { message: 'Failed to save game result' })
  }
})

export default app 