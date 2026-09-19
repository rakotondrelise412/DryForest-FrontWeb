import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges {
  @Input() appCountUp: number = 0;
  @Input() duration: number = 1500; // ms

  private currentValue = 0;
  private startTime: number | null = null;
  private animationFrame: any;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCountUp'] && !isNaN(this.appCountUp)) {
      this.startCountUp();
    }
  }

  private startCountUp(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.currentValue = 0;
    this.startTime = performance.now();
    this.animate(performance.now());
  }

  private animate = (timestamp: number) => {
    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    this.currentValue = progress * this.appCountUp;
    this.el.nativeElement.innerText = Math.round(this.currentValue).toLocaleString();

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      this.el.nativeElement.innerText = this.appCountUp.toLocaleString();
    }
  };
}
