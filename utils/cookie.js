const getDomainFromUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (e) {
      console.error("Invalid FRONTEND_URL:", e);
      return null;
    }
  };

const cookifyRes = (res, accessToken, refreshToken, domain) => {
  res.cookie('jwt_access_token', accessToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 Hour: 60 * 60 * 1000
  });

  res.cookie('jwt_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 Days: 3 * 24 * 60 * 60 * 1000
  });
};

  module.exports = {
    getDomainFromUrl,
    cookifyRes
  }