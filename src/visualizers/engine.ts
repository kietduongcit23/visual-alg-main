

export interface Frame {
  data: any;
  highlights: Map<number, string>; // index -> class (e.g., 'active', 'compare')
  line: number;
  explanation: string;
}

export class VisualizerEngine {
  private frames: Frame[] = [];
  private currentFrameIndex = 0;
  private isPlaying = false;
  private speed = 50;
  private timer: any = null;

  private onFrameChange: (frame: Frame) => void;
  private onPlaybackStateChange: (isPlaying: boolean) => void;

  constructor(
    onFrameChange: (frame: Frame) => void,
    onPlaybackStateChange: (isPlaying: boolean) => void
  ) {
    this.onFrameChange = onFrameChange;
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  setFrames(frames: Frame[]) {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.renderCurrentFrame();
  }

  setSpeed(value: number) {
    this.speed = value;
  }

  getIsPlaying() { return this.isPlaying; }
  getCurrentIndex() { return this.currentFrameIndex; }
  getTotalFrames() { return this.frames.length; }

  play() {
    if (this.isPlaying || this.currentFrameIndex >= this.frames.length - 1) return;
    this.isPlaying = true;
    this.onPlaybackStateChange(true);
    this.run();
  }

  pause() {
    this.isPlaying = false;
    this.onPlaybackStateChange(false);
    if (this.timer) clearTimeout(this.timer);
  }

  next() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.renderCurrentFrame();
    }
  }

  prev() {
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      this.renderCurrentFrame();
    }
  }

  jumpTo(index: number) {
    if (index >= 0 && index < this.frames.length) {
      this.currentFrameIndex = index;
      this.renderCurrentFrame();
    }
  }

  private async run() {
    if (!this.isPlaying) return;
    
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.next();
      this.timer = setTimeout(() => this.run(), 1000 - this.speed * 9);
    } else {
      this.pause();
    }
  }

  private renderCurrentFrame() {
    const frame = this.frames[this.currentFrameIndex];
    if (frame) {
      this.onFrameChange(frame);
    }
  }
}
