// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
      });
    }

    // @ts-ignore
    const TRUORA_API_KEY = Deno.env.get('TRUORA_API_KEY');

    if (!TRUORA_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing TRUORA_API_KEY' }), {
        status: 500,
      });
    }

    const response = await fetch('https://api.account.truora.com/v1/api-keys', {
      method: 'POST',
      headers: {
        'Truora-API-Key': TRUORA_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key_type: 'web',
        grant: 'digital-identity',
        api_key_version: '1',
        country: 'ALL',
        flow_id: 'IPFad9432718a9a815302a19b438ac1a37a',
        account_id: user_id,
        redirect_url: 'https://meludi.cl/kyc-complete',
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});