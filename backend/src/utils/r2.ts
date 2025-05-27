// 生成R2预签名URL
export async function generateR2PresignedUrl(
  bucket: any,
  key: string,
  contentType: string,
  method: string = 'PUT',
  expirationSeconds: number = 3600
) {
  // Cloudflare R2实现预签名URL的方法
  const url = await bucket.createPresignedPost({
    key,
    contentType,
    expirationSeconds,
  });
  
  return url;
}

// 获取文件访问URL
export async function getObjectSignedUrl(
  bucket: any,
  key: string,
  expirationSeconds: number = 86400
) {
  const url = await bucket.createSignedUrl(key, expirationSeconds);
  return url;
} 