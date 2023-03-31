export default defineNuxtConfig({
  nitro: {
    // Nuxt3（のサーバサイド）をLambdaとしてビルド
    preset: "aws-lambda",
  },
  typescript: {
    strict: true,
  },
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    // CloudFront経由のrefererと照合するための環境変数
    referer: process.env.REFERER,
    // 開発環境かどうか
    isDev: process.env.NODE_ENV === "development",
  },
});
