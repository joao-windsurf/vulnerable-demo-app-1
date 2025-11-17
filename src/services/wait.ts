import fetch from 'node-fetch';

export const waitFor200 = (url: string | URL) =>
  new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        console.log('waiting for', url.toString());
        const { status } = await fetch(url.toString());
        if (status === 200) {
          clearInterval(interval);
          resolve(status);
        }
      } catch (err) {
        // ignore as we are not connected yet
      }
    }, 1000);
  });

export const checkEndpoint = (url: string) => {
    return waitFor200(url);
}

export const verifyEndpoint = async (url: string) => {
    return waitFor200(url);
}
