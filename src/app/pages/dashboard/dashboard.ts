// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Person } from '../../models/person.model';
import { ReforestationService } from '../../services/reforestation.service';
import { LatestReforestation, ReforestationCounting } from '../../models/reforestation.model';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { PlantationStatusByYear, SurvivalRate } from '../../models/plantation.model';
import { PlantationService } from '../../services/plantation.service';
import { SpeciesCarbon } from '../../models/speciesFilter.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    // ── Entrée générale (sections, header)
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('480ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    // ── Cascade pour les enfants créés dynamiquement (KPI strip, survival cards)
    trigger('staggerFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(14px)' }),
          stagger(90, [
            animate('360ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
    // NOTE : @pieRotate et @barGrow sont supprimés.
    // L'animation "tourte" est gérée par CSS @property --sweep (voir dashboard.css).
    // Les barres carbone et la courbe SVG sont déclenchées par IntersectionObserver.
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  currentUser: Person | null = null;

  reforestationData$: Observable<ReforestationCounting[]> = of([]);
  totalLastPlanted$: Observable<number> = of(0);
  totalLatestPlanted$: Observable<LatestReforestation> = of({ quantity: 0, zone_name: '' });
  plantationStatusByYear$: Observable<PlantationStatusByYear[]> = of([]);
  speciesCarbon$: Observable<SpeciesCarbon[]> = of([]);
  survivalRate$: Observable<SurvivalRate[]> = of([]);
  survivalRateGlobal$: Observable<SurvivalRate | null> = of(null);

  private selectedYear$ = new BehaviorSubject<number | null>(null);
  selectedSurvival$: Observable<SurvivalRate | null> = of(null);
  selectedStatus$: Observable<PlantationStatusByYear | null> = of(null);

  // Conservé pour compatibilité si tu l'utilises ailleurs
  pieAnimationTrigger$ = this.selectedYear$.pipe(map(y => y ?? 0));

  years$: Observable<number[]> = of([]);

  // ── Contrôle de l'animation CSS "tourte" ──────────────────────
  // true  → classe .pie-animate présente → animation sweepPie active
  // false → classe absente → pas d'animation
  pieAnimating = false;

  isLoading = true;
  isLoadingTotal = true;
  isLoadingLatestPlanted = true;
  isLoadingStatusByYear = true;
  isLoadingSpeciesCarbon = true;
  isLoadingSurvivalRate = true;
  isLoadingSurvivalRateGlobal = true;

  errorMessage = '';
  errorMessageTotal = '';
  errorMessageLatestPlanted = '';
  errorMessageStatusByYear = '';
  errorMessageSpeciesCarbon = '';
  errorMessageSurvivalRate = '';
  errorMessageSurvivalRateGlobal = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private reforestationService: ReforestationService,
    private plantationService: PlantationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadReforestationData();
    this.loadTotalPlanted();
    this.loadTotalLastPlanted();
    this.loadPlantationStatusByYear();
    this.prepareYearSelection();
    this.loadSpeciesCarbonSequestered();
    this.loadSurvivalRate();
    this.loadSurvivalRateGlobal();

    // Déclenche l'animation pie après un court délai (laisse les données arriver)
    setTimeout(() => { this.pieAnimating = true; }, 300);
  }

  ngAfterViewInit(): void {
    // Déclenche les animations des graphiques seulement quand ils entrent en vue
    this.initScrollAnimations();
  }

  /**
   * IntersectionObserver : ajoute la classe .in-view aux éléments .scroll-reveal
   * dès qu'ils atteignent le seuil de visibilité. Les animations CSS
   * (barres carbone, courbe SVG, dots) ne s'activent qu'à ce moment-là.
   */
  private initScrollAnimations(): void {
    // Délai court pour s'assurer que Angular a rendu le DOM
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target); // s'anime une seule fois
            }
          });
        },
        {
          threshold: 0.15,           // 15 % de l'élément visible
          rootMargin: '0px 0px -40px 0px' // déclenche un peu avant le bas de l'écran
        }
      );

      document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
      });
    }, 150);
  }

  // ── Sélection d'année — redéclenche l'animation pie ─────────────
  setSelectedYear(yearStr: string): void {
    // 1. Retire la classe .pie-animate pour stopper l'animation CSS
    this.pieAnimating = false;

    // 2. Après un frame, change l'année et relance l'animation
    setTimeout(() => {
      const y = yearStr ? Number(yearStr) : null;
      this.selectedYear$.next(y);
      this.pieAnimating = true; // remet la classe → relance sweepPie
    }, 80);
  }

  // ──────────────────────────────────────────────────────────────────
  // Chargement des données (inchangé)
  // ──────────────────────────────────────────────────────────────────

  private prepareYearSelection(): void {
    this.years$ = this.plantationStatusByYear$.pipe(
      map(list => (list || []).map(r => r.year).filter(y => y != null).sort((a, b) => b - a))
    );

    this.selectedStatus$ = combineLatest([this.plantationStatusByYear$, this.selectedYear$]).pipe(
      map(([list, selYear]) => {
        const arr = list || [];
        if (arr.length === 0) return null;
        if (!selYear) {
          const sorted = arr.slice().sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
          return sorted[0] ?? null;
        }
        return arr.find(r => r.year === selYear) ?? { year: selYear, aliveCount: 0, deadCount: 0, totalCount: 0 };
      })
    );
  }

  loadReforestationData(): void {
    this.errorMessage = '';
    this.reforestationData$ = this.reforestationService.getQuantityByTypeZone().pipe(
      tap(data => console.log('Reforestation data:', data)),
      catchError(err => {
        console.error('Erreur reforestation', err);
        this.errorMessage = 'Impossible de charger les données. Vérifiez la connexion.';
        return of([] as ReforestationCounting[]);
      })
    );
  }

  loadTotalPlanted(): void {
    this.isLoadingTotal = true;
    this.errorMessageTotal = '';
    this.totalLastPlanted$ = this.reforestationService.getTotalPlanted().pipe(
      tap(total => console.debug('[Dashboard] total received:', total)),
      catchError(err => {
        console.error('[Dashboard] error fetching total', err);
        this.errorMessageTotal = 'Impossible de charger le total des plantés.';
        return of(0);
      }),
      finalize(() => { this.isLoadingTotal = false; })
    );
  }

  loadTotalLastPlanted(): void {
    this.isLoadingLatestPlanted = true;
    this.errorMessageLatestPlanted = '';
    this.totalLatestPlanted$ = this.reforestationService.getTotalLatestPlanted().pipe(
      tap(latest => console.debug('[Dashboard] latest received:', latest)),
      catchError(err => {
        console.error('[Dashboard] error fetching latest planted', err);
        this.errorMessageLatestPlanted = 'Impossible de charger le dernier lot planté.';
        return of({ quantity: 0, zone_name: '' } as LatestReforestation);
      }),
      finalize(() => { this.isLoadingLatestPlanted = false; })
    );
  }

  loadPlantationStatusByYear(): void {
    this.isLoadingStatusByYear = true;
    this.errorMessageStatusByYear = '';
    this.plantationStatusByYear$ = this.plantationService.plantationStatusByYear().pipe(
      tap(s => console.debug('[Dashboard] status by year received:', s)),
      catchError(err => {
        console.error('[Dashboard] error fetching status by year', err);
        this.errorMessageStatusByYear = 'Impossible de charger les nombres de survie.';
        return of([] as PlantationStatusByYear[]);
      }),
      finalize(() => { this.isLoadingStatusByYear = false; })
    );
    this.prepareYearSelection();
  }

  loadSurvivalRate(): void {
    this.isLoadingSurvivalRate = true;
    this.errorMessageSurvivalRate = '';
    this.survivalRate$ = this.plantationService.getSurvivalRate().pipe(
      tap(s => console.debug('[Dashboard] survival received:', s)),
      catchError(err => {
        console.error('[Dashboard] error fetching survival', err);
        this.errorMessageSurvivalRate = 'Impossible de charger le pourcentage de survie des plantes.';
        return of([] as SurvivalRate[]);
      }),
      finalize(() => { this.isLoadingSurvivalRate = false; }),
      shareReplay(1)
    );

    this.selectedSurvival$ = combineLatest([this.survivalRate$, this.selectedYear$]).pipe(
      map(([list, selYear]) => {
        const arr = list || [];
        if (arr.length === 0) return null;
        if (!selYear) {
          const sorted = arr.slice().sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
          return sorted[0] ?? null;
        }
        return arr.find(r => r.year === selYear) ?? null;
      }),
      shareReplay(1)
    );

    this.survivalRate$.subscribe();
  }

  loadSurvivalRateGlobal(): void {
    this.isLoadingSurvivalRateGlobal = true;
    this.errorMessageSurvivalRateGlobal = '';
    this.survivalRateGlobal$ = this.plantationService.getSurvivalRateGlobal().pipe(
      tap(sg => console.debug('[Dashboard] survival global received', sg)),
      catchError(err => {
        console.error('[Dashboard] error fetching survival global', err);
        this.errorMessageSurvivalRateGlobal = 'Impossible de charger le pourcentage de survie global.';
        return of(null);
      }),
      finalize(() => { this.isLoadingSurvivalRateGlobal = false; }),
      shareReplay(1)
    );
    this.survivalRateGlobal$.subscribe({ next: () => {}, error: () => {} });
  }

  loadSpeciesCarbonSequestered(): void {
    this.isLoadingSpeciesCarbon = true;
    this.errorMessageSpeciesCarbon = '';
    this.speciesCarbon$ = this.plantationService.getCarbonSequesteredBySpecies().pipe(
      tap(c => console.debug('[Dashboard] carbon sequestered by species received:', c)),
      catchError(err => {
        console.error('[Dashboard] error fetching carbon sequestered by species', err);
        this.errorMessageSpeciesCarbon = 'Impossible de charger les totaux de carbone séquestré.';
        return of([] as SpeciesCarbon[]);
      }),
      finalize(() => { this.isLoadingSpeciesCarbon = false; }),
      shareReplay(1)
    );
    this.speciesCarbon$.subscribe();
  }

  // ──────────────────────────────────────────────────────────────────
  // Helpers graphiques (inchangés)
  // ──────────────────────────────────────────────────────────────────

  getSurvivalPieBackground(ss: SurvivalRate | null): string {
    if (!ss) return '';
    const a = Number(ss.alivePercentage ?? 0);
    const d = Number(ss.deadPercentage ?? 0);
    let ag = Number(ss.autoGenerationPercentage ?? NaN);
    if (!isFinite(ag)) ag = Math.max(0, 100 - a - d);
    const sum = a + d + ag;
    if (sum <= 0) return '';
    const scale = 100 / sum;
    const aEnd  = +(a * scale).toFixed(2);
    const adEnd = +((a + d) * scale).toFixed(2);
    return `conic-gradient(#38a169 0% ${aEnd}%, #92400e ${aEnd}% ${adEnd}%, #d97706 ${adEnd}% 100%)`;
  }

  getStatusPieBackground(s: PlantationStatusByYear): string {
    if (!s || !s.totalCount) return '#e2e8f0';
    const alivePct = (s.aliveCount / s.totalCount) * 100;
    return `conic-gradient(#38a169 0% ${alivePct.toFixed(2)}%, #92400e ${alivePct.toFixed(2)}% 100%)`;
  }

  readonly lineChartPadding = { left: 60, right: 20, top: 24, bottom: 56 };
  readonly lineChartWidth   = 600;
  readonly lineChartHeight  = 220;

  getLinePoints(data: ReforestationCounting[]): Array<{x:number;y:number;label:string;value:number}> {
    if (!data || data.length === 0) return [];
    const { left, right, top, bottom } = this.lineChartPadding;
    const w = this.lineChartWidth  - left - right;
    const h = this.lineChartHeight - top  - bottom;
    const maxVal = Math.max(...data.map(d => d.total_quantity), 1);
    return data.map((d, i) => ({
      x: left + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w),
      y: top + h - (d.total_quantity / maxVal) * h,
      label: d.type_zone_name,
      value: d.total_quantity
    }));
  }

  getLinePath(pts: Array<{x:number;y:number}>): string {
    if (!pts || pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  getAreaPath(pts: Array<{x:number;y:number}>): string {
    if (!pts || pts.length === 0) return '';
    const baseline = this.lineChartHeight - this.lineChartPadding.bottom;
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return `${line} L${pts[pts.length-1].x.toFixed(1)},${baseline} L${pts[0].x.toFixed(1)},${baseline} Z`;
  }

  getYAxisTicks(data: ReforestationCounting[]): Array<{y:number;label:string}> {
    if (!data || data.length === 0) return [];
    const { top, bottom } = this.lineChartPadding;
    const h = this.lineChartHeight - top - bottom;
    const maxV = Math.max(...data.map(d => d.total_quantity), 1);
    return Array.from({ length: 5 }, (_, i) => ({
      y: top + h - (i / 4) * h,
      label: Math.round((maxV * i) / 4).toLocaleString()
    }));
  }

  getMaxCarbon(data: SpeciesCarbon[]): number {
    return Math.max(...data.map(d => d.totalCarbon), 0);
  }

  trackById(index: number, item: ReforestationCounting) {
    return item.id_type_zone;
  }

  retryAll(): void {
    this.loadReforestationData();
    this.loadTotalPlanted();
    this.loadTotalLastPlanted();
  }
}
