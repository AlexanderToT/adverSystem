// 生成R2预签名URL
export async function generateR2PresignedUrl(
  bucket: any,
  key: string,
  contentType: string,
  method: string = 'PUT',
  expirationSeconds: number = 3600
) {
  console.log('R2 bucket:', bucket);
  
  if (!bucket) {
    throw new Error('R2 bucket is undefined');
  }
  
  try {
    // 使用Cloudflare R2的put方法生成预签名URL
    const url = await bucket.createPresignedUrl(
      key,
      expirationSeconds,
      {
        method: method,
        contentType: contentType
      }
    );
    
    return url;
  } catch (error) {
    console.error('createPresignedUrl error:', error);
    throw error;
  }
}

// 获取文件访问URL
export async function getObjectSignedUrl(
  bucket: any,
  key: string,
  expirationSeconds: number = 86400
) {
  if (!bucket) {
    throw new Error('R2 bucket is undefined');
  }
  
  try {
    // 使用createPresignedUrl但指定HTTP方法为GET来获取文件读取URL
    const url = await bucket.createPresignedUrl(key, expirationSeconds);
    return url;
  } catch (error) {
    console.error('createSignedUrl error:', error);
    throw error;
  }
} 