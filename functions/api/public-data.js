// Cloudflare Pages Function for Edge Caching public data
// Path: functions/api/public-data.js

const DEFAULT_SUPABASE_URL = 'https://uuipvnitgjjlcysicsmy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXB2bml0Z2pqbGN5c2ljc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQzOTcsImV4cCI6MjA5NjA5MDM5N30.Vg61Ha66HZTlNgtpDFs1bI4UoV9P2BIX7EjjvMEkmto';

export async function onRequestGet(context) {
  const { env, request } = context;
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  // 1. Try to serve from Cloudflare Cache
  let response = await cache.match(cacheKey);
  if (response) {
    // Add debug header to confirm cache hit
    const cachedResponse = new Response(response.body, response);
    cachedResponse.headers.set('X-CF-Cache', 'HIT');
    return cachedResponse;
  }

  try {
    // 2. Fetch all public data from Supabase in parallel
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    const [contentRes, commentsRes, pollsRes, votesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/content?select=*&order=created_at.desc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/comments?select=*,profiles(tier)&order=created_at.asc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/polls?select=*&order=created_at.desc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/poll_votes?select=poll_id,option_id`, { headers }) // only fetch what's needed for counts
    ]);

    if (!contentRes.ok || !commentsRes.ok || !pollsRes.ok || !votesRes.ok) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch data from Supabase',
        details: {
          content: contentRes.statusText,
          comments: commentsRes.statusText,
          polls: pollsRes.statusText,
          votes: votesRes.statusText
        }
      }), { 
        status: 502, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const [content, rawComments, rawPolls, rawVotes] = await Promise.all([
      contentRes.json(),
      commentsRes.json(),
      pollsRes.json(),
      votesRes.json()
    ]);

    // 3. Process and aggregate data at the Edge to reduce client payload size
    
    // Group comments by content_id
    const commentsMap = {};
    rawComments.forEach(c => {
      if (!commentsMap[c.content_id]) {
        commentsMap[c.content_id] = [];
      }
      
      // Determine user tier safely
      let tier = 'free';
      if (c.profiles) {
        tier = Array.isArray(c.profiles) ? (c.profiles[0]?.tier || 'free') : (c.profiles.tier || 'free');
      }

      commentsMap[c.content_id].push({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name || 'Anonymous',
        tier: tier,
        text: c.text,
        createdAt: c.created_at,
        isCreator: c.user_name === 'Valyryes'
      });
    });

    // Count votes per option
    const voteCounts = {}; // key: pollId_optionId -> count
    rawVotes.forEach(v => {
      const key = `${v.poll_id}_${v.option_id}`;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    // Map polls with counts
    const polls = rawPolls.map(p => {
      const options = (p.options || []).map(opt => {
        const key = `${p.id}_${opt.id}`;
        return {
          ...opt,
          votes: voteCounts[key] || 0
        };
      });
      
      const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

      return {
        id: p.id,
        question: p.question,
        options: options,
        totalVotes: totalVotes,
        expiresAt: p.expires_at,
        createdAt: p.created_at
      };
    });

    const payload = {
      content,
      commentsMap,
      polls
    };

    // 4. Create response and cache it for 60 seconds
    response = new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache on browser and CDN for 60s
        'X-CF-Cache': 'MISS'
      }
    });

    // Cache the response asynchronously
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Edge processing error', 
      message: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
