const createCodeCaptcha = async (url) => {
  try {
    const response = await fetch("https://www.codecaptcha.io/api/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    });
    const responsePayload = await response.json();
    return `https://codecaptcha.io/a/${responsePayload["linkId"]}`;
  } catch (e) {
    console.warn(e);
    console.warn("Failed to create a captcha.");
    return undefined;
  }
};

module.exports = {
  createCodeCaptcha,
};
