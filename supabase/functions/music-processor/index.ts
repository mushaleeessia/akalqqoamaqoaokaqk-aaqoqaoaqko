import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { spotifyUrl, action } = await req.json();

    if (action === 'process') {
      // Extract Spotify track info
      const spotifyId = extractSpotifyId(spotifyUrl);
      if (!spotifyId) {
        throw new Error('Invalid Spotify URL');
      }

      // Get track info from Spotify oEmbed
      const trackInfo = await getSpotifyTrackInfo(spotifyUrl);
      
      // Search for YouTube equivalent
      const youtubeInfo = await searchYouTube(trackInfo.name, trackInfo.artist);
      
      // Store track info in database
      const { data: track, error } = await supabase
        .from('music_tracks')
        .insert({
          spotify_url: spotifyUrl,
          youtube_url: youtubeInfo.videoUrl,
          audio_url: youtubeInfo.audioUrl,
          track_name: trackInfo.name,
          artist_name: trackInfo.artist,
          duration: youtubeInfo.duration || 180,
          thumbnail_url: trackInfo.thumbnail || youtubeInfo.thumbnail
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          track: {
            id: track.id,
            name: track.track_name,
            artist: track.artist_name,
            spotifyUrl: track.spotify_url,
            audioUrl: track.audio_url,
            duration: track.duration,
            imageUrl: track.thumbnail_url
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_audio') {
      const { trackId } = await req.json();
      
      const { data: track } = await supabase
        .from('music_tracks')
        .select('audio_url')
        .eq('id', trackId)
        .single();

      if (!track?.audio_url) {
        throw new Error('Track not found or no audio URL');
      }

      return new Response(
        JSON.stringify({ audioUrl: track.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Music processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function extractSpotifyId(url: string): string | null {
  const regex = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function getSpotifyTrackInfo(url: string) {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    const data = await response.json();
    
    if (data.title) {
      const titleParts = data.title.split(' - ');
      return {
        name: titleParts.slice(1).join(' - ') || data.title,
        artist: titleParts[0] || "Artista Desconhecido",
        thumbnail: data.thumbnail_url
      };
    }
  } catch (error) {
    console.error('Spotify info error:', error);
  }
  
  return {
    name: "Música do Spotify",
    artist: "Artista Desconhecido",
    thumbnail: null
  };
}

async function searchYouTube(trackName: string, artist: string) {
  // For demo purposes, we'll use a working audio URL
  // In production, you'd integrate with YouTube API and yt-dlp
  const demoAudioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
  
  // Mock YouTube search result
  return {
    videoUrl: `https://youtube.com/watch?v=demo`,
    audioUrl: demoAudioUrl,
    duration: 180,
    thumbnail: null
  };
}