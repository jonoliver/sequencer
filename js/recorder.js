import { Master } from 'tone';
import Recorder from './recorderjs/recorder';

const worker = new Worker('recorderjs/recorderWorker.js');

export const recorder = new Recorder(Master, null, worker);

export const record = () => {
  recorder.record();

}

const createDownloadUrl = (blob) =>
  (window.URL || window.webkitURL).createObjectURL(blob);

export const stop = (callback) => {
  recorder.stop();
  // recorder.exportWAV(Recorder.forceDownload);
  return recorder.exportWAV(blob => {
    callback(createDownloadUrl(blob))
    // Recorder.forceDownload(blob);
  });
}
