// 七牛云上传凭证 API
export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await context.request.json();
    const { fileName } = body;

    // 七牛云配置
    const accessKey = 'PbDhewYpuotNmXL8uWEPm4WmAQ8s-X48CmWwSIXC';
    const secretKey = '_GEKPAbnPDOo5PaFhIYtSA9sMcPTA6tadw_R74jT';
    const bucket = 'gyfish';

    // 生成上传策略
    const putPolicy = {
      scope: bucket,
      deadline: Math.floor(Date.now() / 1000) + 3600,
      saveKey: `uploads/${Date.now()}_${fileName}`,
    };

    const putPolicyJson = JSON.stringify(putPolicy);
    const encodedPutPolicy = btoa(putPolicyJson)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // 使用 Web Crypto API 进行 HMAC-SHA1
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(encodedPutPolicy);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signStr = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const uploadToken = `${accessKey}:${signStr}:${encodedPutPolicy}`;

    return new Response(JSON.stringify({
      success: true,
      token: uploadToken,
      uploadUrl: 'https://upload.qiniup.com',
      cdnDomain: 'gyfish.clouddn.com'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
