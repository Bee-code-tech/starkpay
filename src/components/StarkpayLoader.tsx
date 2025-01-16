import React from "react";

const StarkpayLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 h-screen w-screen">
      <div className=" animate-pulse">
        <svg width="42" height="42" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="512" height="512" rx="100" fill="#0D6EFD"/>
<path fillRule="evenodd" clipRule="evenodd" d="M285.461 160C303.554 178.953 316.463 191.916 326.151 200.872V217.174C302.559 213.381 283.322 207.958 256.235 193.739L232.561 221.29L356 248.697V276.596C326.312 303.24 308.768 322.523 285.461 351.472H229.1C214.014 329.395 201.989 316.399 187.704 306.3V292.177C212.321 295.537 231.465 300.985 256.235 315.656L282 286.72L156 259.483V234.296C178.448 214.552 197.688 195.047 229.086 160H285.461Z" fill="#F8F9FA"/>
</svg>

      </div>
    </div>
  );
};

export default StarkpayLoader;
