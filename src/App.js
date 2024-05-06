import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import CryptoJS from 'crypto-js';

const App = () => {
  const videoRef = useRef(null);
  var key = '30980f98296b77f00a55f3c92b35322d898ae2ffcdb906de40336d2cf3d556a0';
  key = CryptoJS.enc.Hex.parse(key);
  const iv = CryptoJS.enc.Hex.parse('e5889166bb98ba01e1a6bc9b32dbf3e6');

  useEffect(() => {
    fetch('/download/encrypt_1G.mp4')
      .then(response => {
        console.log(response);
        response.arrayBuffer()
      })
      .then((arrayBuffer) => {
        console.log(1111,arrayBuffer);
        const temp = modifyChunk(arrayBuffer)
        console.log(22222,temp);
        const mimeType = "video/mp4"
        let blob = createVideoBlob(temp, mimeType)
        console.log(33333,blob);

        const player = videojs(videoRef);
        player.src({ src: URL.createObjectURL(blob), type: mimeType });
      })
      .then()
  }, []);

  function modifyChunk(chunk) {
    console.log(chunk);
    const decryptedPart = chunk.slice(1024, 2064)
    const retainPart = chunk.slice(2064)
    const wordArray = ArrayBufferToWordArray(decryptedPart)
    const decryptedData = CryptoJS.AES.decrypt({ ciphertext: wordArray }, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const newU8 = WordArrayToArrayBuffer(decryptedData)
    const mergedArray = new Uint8Array(1024 + retainPart.length)
    mergedArray.set(newU8, 0)
    mergedArray.set(retainPart, 1024)
    return mergedArray
  }

  // 创建视频文件Blob
  function createVideoBlob(decryptedData, mimeType) {
    var blob = new Blob([decryptedData], { type: mimeType });
    return blob;
  }



  const ArrayBufferToWordArray = arrayBuffer => {
    const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
    const len = u8.length;
    const words = [];
    for (let i = 0; i < len; i += 1) {
      words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
  }

  const WordArrayToArrayBuffer = (wordArray) => {
    const { words, sigBytes } = wordArray;
    const u8 = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      u8[i] = byte;
    }
    return u8.buffer;
  };
  // ref={videoRef}
  return (
    <div data-vjs-player style={{ height: 600, width: 1200 }}>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};

export default App;
