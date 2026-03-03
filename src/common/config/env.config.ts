export const envConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
});