/**
 * CloudFrontから渡されるはずのリファラを検証して、
 * CloudFrontを経由しないアクセスをブロックする
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (config.isDev) {
    // 開発環境では検証しない
    return;
  }
  if (event.req.headers.referer !== config.referer) {
    // refererヘッダが一致しないので、
    // CloudFrontを経由しないアクセスとみなしてエラーを返す
    throw createError({
      statusCode: 403,
      message: "Forbidden",
    });
  }
});
