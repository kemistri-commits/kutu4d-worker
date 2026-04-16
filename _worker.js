// _worker.js - Letakkan di root folder project
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };
        
        // Handle preflight CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        // Endpoint untuk kirim notifikasi
        if (url.pathname === '/api/send' && request.method === 'POST') {
            try {
                const data = await request.json();
                const message = data.message;
                
                // Ambil dari Environment Variables (sudah di-set di Dashboard)
                const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
                const CHAT_ID = env.TELEGRAM_CHAT_ID;
                
                if (!BOT_TOKEN || !CHAT_ID) {
                    return new Response(JSON.stringify({ 
                        error: 'Environment variables not configured' 
                    }), { 
                        status: 500,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }
                
                // Kirim ke Telegram
                const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
                
                const tgData = await tgResponse.json();
                
                if (tgData.ok) {
                    return new Response(JSON.stringify({ success: true }), {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                } else {
                    return new Response(JSON.stringify({ error: tgData.description }), { 
                        status: 500,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }
                
            } catch(error) {
                return new Response(JSON.stringify({ error: error.message }), { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }
        
        // Untuk request file statis lainnya
        return env.ASSETS.fetch(request);
    }
};