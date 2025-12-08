let cvReadyPromise = null;

export function loadOpenCv() {
  if (!cvReadyPromise) {
    cvReadyPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src="/src/JS/OpenCV.js"]');
      if (existing) {
        if (window.cv && window.cv.onRuntimeInitialized === undefined) {
          resolve();
        } else {
          window.cv.onRuntimeInitialized = resolve;
        }
        return;
      }

      const script = document.createElement("script");
      script.src = "/src/JS/OpenCV.js";
      script.async = true;

      script.onload = () => {
        window.cv.onRuntimeInitialized = resolve;
      };

      document.body.appendChild(script);
    });
  }

  return cvReadyPromise;
}
