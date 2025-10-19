export default () => ({
  cache: {
    ttlDefault: 60, // default 60 saniye
    ACCESS_TOKEN_TTL: 60 * 15, // 15 dakika
    REFRESH_TOKEN_TTL: 60 * 60 * 24 * 7 // 7 gün
  },
});
