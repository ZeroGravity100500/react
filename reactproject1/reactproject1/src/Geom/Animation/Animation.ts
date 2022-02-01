import * as Interpolators from './Interpolators/TimeInterpolator';

export interface IAnimator {
    getAnimationValue(time: number): any;
}

export interface IAnimatedValue {
    value: any;
}

export class Animation {
    /**
      * Repeat the animation indefinitely.
      */
    public static INFINITE = -1;
    /**
     * When the animation reaches the end and the repeat count is INFINTE_REPEAT
     * or a positive value, the animation restarts from the beginning.
     */
    public static RESTART = 1;
    /**
     * When the animation reaches the end and the repeat count is INFINTE_REPEAT
     * or a positive value, the animation plays backward (and then forward again).
     */
    public static REVERSE = 2;
    /**
     * Can be used as the start time to indicate the start time should be the current
     * time when {@link #getTransformation(long, Transformation)} is invoked for the
     * first animation frame. This can is useful for short animations.
     */
    public static START_ON_FIRST_FRAME = -1;

    private _ended: boolean = false;
    private _started: boolean = false;
    private _cycleFlip: boolean = false;
    private _initialized: boolean = false;
    
    private _startTime: number = -1;
    private _startOffset: number = 0;
    private _duration: number = 0;
    private _repeatCount: number = 0;
    private _repeated: number = 0;
    private _repeatMode: number = Animation.RESTART;
    private _interpolator: Interpolators.TimeInterpolator | undefined;
    private _scaleFactor: number = 1;
    private _animator: IAnimator | undefined;

    constructor() {
        this.ensureInterpolator();
    }

    protected ensureInterpolator() {
        if (!this._interpolator) {
            this._interpolator = new Interpolators.AccelerateDecelerateInterpolator();
        }
    }

    public reset() {
        this._initialized = false;
        this._cycleFlip = false;
        this._repeated = 0;
        //this._more = true;
        //mOneMoreTime = true;
    }

    public cancel() {
        if (this._started && !this._ended) {
            this._ended = true;
        }
        // Make sure we move the animation to the end
        this._startTime = Number.MIN_VALUE;
    }

    public isInitialized(): boolean {
        return this._initialized;
    }

    public initialize() {
        this.reset();
        this._initialized = true;
    }

    public setInterpolator(i: Interpolators.TimeInterpolator): void {
        this._interpolator = i;
    }

    public setAnimator(executor: IAnimator) {
        this._animator = executor;
    }

    public setStartOffset(startOffset: number): void {
        this._startOffset = startOffset;
    }

    public setDuration(durationMillis: number): void {
        if (durationMillis < 0) {
            throw new Error("Animation duration cannot be negative");
        }
        this._duration = durationMillis;
    }

    public restrictDuration(durationMillis: number): void {
        // If we start after the duration, then we just won't run.
        if (this._startOffset > durationMillis) {
            this._startOffset = durationMillis;
            this._duration = 0;
            this._repeatCount = 0;
            return;
        }
        let dur = this._duration + this._startOffset;
        if (dur > durationMillis) {
            this._duration = durationMillis - this._startOffset;
            dur = durationMillis;
        }
        // If the duration is 0 or less, then we won't run.
        if (this._duration <= 0) {
            this._duration = 0;
            this._repeatCount = 0;
            return;
        }
        // Reduce the number of repeats to keep below the maximum duration.
        // The comparison between mRepeatCount and duration is to catch
        // overflows after multiplying them.
        if (this._repeatCount < 0 || this._repeatCount > durationMillis
            || (dur * this._repeatCount) > durationMillis) {
            // Figure out how many times to do the animation.  Subtract 1 since
            // repeat count is the number of times to repeat so 0 runs once.
            this._repeatCount = Math.floor((durationMillis / dur) - 1);
            if (this._repeatCount < 0) {
                this._repeatCount = 0;
            }
        }
    }

    public scaleCurrentDuration(scale: number): void {
        this._duration = this._duration * scale;
        this._startOffset = this._startOffset * scale;
    }

    public setStartTime(startTimeMillis: number): void {
        this._startTime = startTimeMillis;
        this._started = this._ended = false;
        this._cycleFlip = false;
        this._repeated = 0;
    }

    public start(): void {
        this.setStartTime(-1);
    }

    public startNow(): void {
        this.setStartTime(Date.now());
    }
    public setRepeatMode(repeatMode: number): void {
        this._repeatMode = repeatMode;
    }
    public setRepeatCount(repeatCount: number): void {
        if (repeatCount < 0) {
            repeatCount = Animation.INFINITE;
        }
        this._repeatCount = repeatCount;
    }

    protected getScaleFactor(): number {
        return this._scaleFactor;
    }
    public getInterpolator(): Interpolators.TimeInterpolator | undefined {
        return this._interpolator;
    }
    public getAnimationExecutor(): IAnimator | undefined {
        return this._animator;
    }
    public getStartTime(): number {
        return this._startTime;
    }
    public getDuration(): number{
        return this._duration;
    }
    public getStartOffset(): number{
        return this._startOffset;
    }
    public getRepeatMode(): number {
        return this._repeatMode;
    }
    public getRepeatCount(): number{
        return this._repeatCount;
    }
    public computeDurationHint(): number {
        return (this.getStartOffset() + this.getDuration()) * (this.getRepeatCount() + 1);
    }
    private isCanceled(): boolean {
        return this._startTime === Number.MIN_VALUE;
    }
    public getTransformation(currentTime: number, outTransformation: IAnimatedValue) {
        if (this._startTime === -1) {
            this._startTime = currentTime;
        }
        let startOffset = this.getStartOffset();
        let duration = this._duration;
        let normalizedTime;
        if (duration !== 0) {
            normalizedTime = ((currentTime - (this._startTime + startOffset))) / duration;
        } else {
            // time is a step-change with a zero duration
            normalizedTime = currentTime < this._startTime ? 0: 1;
        }
        let expired = normalizedTime >= 1 || this.isCanceled();
        if (normalizedTime >= 1) {
            normalizedTime = 1;
        }
        if ((normalizedTime >= 0) && (normalizedTime <= 1)) {
            if (!this._started) {
                //fireAnimationStart();
                this._started = true;
            }
            if (this._cycleFlip) {
                normalizedTime = 1 - normalizedTime;
            }
            if (this._interpolator !== undefined) {
                const interpolatedTime = this._interpolator.getInterpolation(normalizedTime);
                this.applyTransformation(interpolatedTime, outTransformation);
            }
        }
        if (expired) {
            if (this._repeatCount === this._repeated || this.isCanceled()) {
                if (!this._ended) {
                    this._ended = true;
                    //fireAnimationEnd();
                }
            } else {
                if (this._repeatCount > 0) {
                    this._repeated++;
                }
                if (this._repeatMode === Animation.REVERSE) {
                    this._cycleFlip = !this._cycleFlip;
                }
                this._startTime = -1;
                //fireAnimationRepeat();
            }
        }
    }
    public getTransformationScaled(currentTime: number, outTransformation: IAnimatedValue, scale: number) {
        this._scaleFactor = scale;
        return this.getTransformation(currentTime, outTransformation);
    }

    public applyTransformation(currentTime: number, outTransformation: IAnimatedValue): void {
        outTransformation.value = this._animator?.getAnimationValue(currentTime);
    };
}