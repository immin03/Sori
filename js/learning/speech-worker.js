// The runtime and multilingual Whisper Tiny weights are pinned. Only model files are fetched.
const runtime = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js';
const revision = '5332fcc35e32a33b86612b9a57a89be7906102b1';
let recognizer;
self.onmessage = async ({data:{id,samples}}) => {
  const report = message => self.postMessage({id,...message});
  try {
    if (!recognizer) {
      report({stage:'Preparing the speech model…'});
      const {env,pipeline} = await import(runtime);
      env.allowLocalModels = false;
      env.backends.onnx.wasm.numThreads = 1;
      const files = new Map();
      let lastStep = 0;
      recognizer = await pipeline('automatic-speech-recognition','Xenova/whisper-tiny',{
        revision, device:'wasm', dtype:'q8',
        progress_callback(event) {
          if (event.status !== 'progress' || !event.loaded) return;
          files.set(event.file,event.loaded);
          const mb = Math.floor([...files.values()].reduce((a,b) => a+b,0) / 1000000);
          if (mb >= lastStep + 5) { lastStep = mb; report({stage:'Preparing the speech model · ' + mb + ' MB loaded'}); }
        }
      });
    }
    if (!samples) { report({text:''}); return; }
    report({stage:'Checking your words on this device…'});
    const result = await recognizer(samples,{language:'korean',task:'transcribe',max_new_tokens:64});
    report({text:result.text.trim()});
  } catch {
    recognizer = null; report({error:true});
  }
};
