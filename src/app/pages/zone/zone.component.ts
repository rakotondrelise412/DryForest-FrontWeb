// src/app/pages/zone/zone.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { ZoneService } from '../../services/zone.service';
import { PlantationBlockService } from '../../services/plantationBlock.service';
import { SubPlotService } from '../../services/subPlot.service';

import { ZoneWeb } from '../../models/zone.model';
import { PlantationBlocks } from '../../models/plantationBlock.model';
import { SubPlot } from '../../models/subPlotWebFilter.model';
import { CountByType } from '../../models/countByType.model';
import { IncidentPatrolService } from '../../services/incidentPatrol.service';
import { ObservationService } from '../../services/observationPatrol.service';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.css']
})
export class ZoneComponent implements OnInit, AfterViewInit, OnDestroy {
  private map?: L.Map;
  private layerGroup?: L.FeatureGroup;
  private sub?: Subscription;

  zones: ZoneWeb[] = [];
  plantationBlocks: PlantationBlocks[] = [];
  subPlots: SubPlot[] = [];

  totalAreaProtected$: Observable<number> = of(0);
  incidentPatCountByType$: Observable<CountByType[]> = of([]);
  observationPatCountByType$: Observable<CountByType[]> = of([]);

  isLoading = true;
  isTotalAreaProtectedLoading = true;
  isIncidentPatCountByTypeLoading = true;
  isObservationPatCountByTypeLoading = true;
  errorMessage = '';
  totalAreaProtectedErrorMessage = '';
  errorIncidentPatCountByTypeMessage = '';
  errorObservationPatCountByTypeMessage = '';

  constructor(
    private zoneService: ZoneService,
    private plantationBlockService: PlantationBlockService,
    private subPlotService: SubPlotService,
    private incidentPatrolService: IncidentPatrolService,
    private observationPatrolService: ObservationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadAllData();
    this.loadTotalAreaProtected();
    this.loadIncidentPatCountByType();
    this.loadObservationPatCountByType();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    this.map = L.map('zoneMap', {
      center: [-18.9, 47.5],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.layerGroup = L.featureGroup().addTo(this.map);
  }

  private loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sub = forkJoin({
      zones: this.zoneService.getZoneWeb().pipe(
        catchError(err => {
          console.error('Erreur chargement zones', err);
          return of([] as ZoneWeb[]);
        })
      ),
      blocks: this.plantationBlockService.getAll().pipe(
        catchError(err => {
          console.error('Erreur chargement plantation_block', err);
          return of([] as PlantationBlocks[]);
        })
      ),
      subPlots: this.subPlotService.getAllSubPlot().pipe(
        catchError(err => {
          console.error('Erreur chargement sub_plot', err);
          return of([] as SubPlot[]);
        })
      )
    }).subscribe({
      next: ({ zones, blocks, subPlots }) => {
        this.zones = zones || [];
        this.plantationBlocks = blocks || [];
        this.subPlots = subPlots || [];
        this.drawAll();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erreur chargement carte', err);
        this.errorMessage = 'Impossible de charger les données de la carte';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTotalAreaProtected(): void {
    this.isTotalAreaProtectedLoading = true;
    this.totalAreaProtectedErrorMessage = '';
    this.totalAreaProtected$ = this.zoneService.getTotalAreaProtected().pipe(
      tap(area => console.debug('Latest received:', area)),
      catchError(err => {
        console.error('Error fetching totalAreaProtected', err);
        this.totalAreaProtectedErrorMessage = 'Impossible de charger le total d\'hectare protégé.';
        return of(0);
      }),
      finalize(() => {this.isTotalAreaProtectedLoading = false; })
    )
  }

  loadIncidentPatCountByType(): void {
    this.isIncidentPatCountByTypeLoading = true;
    this.errorIncidentPatCountByTypeMessage = '';
    this.incidentPatCountByType$ = this.incidentPatrolService.getIncidentPatCountByType().pipe(
      catchError(err => {
        this.errorIncidentPatCountByTypeMessage = this.getErrorMessage(err);
        return of([] as CountByType[]);
      }),
      finalize(() => {
        this.isIncidentPatCountByTypeLoading = false;
      })
    )
  }

  loadObservationPatCountByType(): void {
    this.isObservationPatCountByTypeLoading = true;
    this.errorObservationPatCountByTypeMessage = '';
    this.observationPatCountByType$ = this.observationPatrolService.getObservationPatCountByType().pipe(
      catchError(err => {
        this.errorObservationPatCountByTypeMessage = this.getErrorMessage(err);
        return of([] as CountByType[]);
      }),
      finalize(() => {
        this.isObservationPatCountByTypeLoading = false;
      })
    )
  }

  private drawAll(): void {
    if (!this.map || !this.layerGroup) return;

    this.layerGroup.clearLayers();

    for (const z of this.zones) {
      if (!z?.geom?.coordinates) continue;

      try {
        if (z.geom.type === 'Polygon') {
          const latlngRings = this.polygonCoordsToLatLngs(z.geom.coordinates);
          const poly = L.polygon(latlngRings, {
            color: '#955138',
            weight: 2,
            fillOpacity: 0.18
          }).addTo(this.layerGroup);

          this.decoratePolygon(poly, z.name, `Area: ${z.area?.toLocaleString() ?? '—'}`, 'zone');
        } else if (z.geom.type === 'MultiPolygon') {
          const multi = (z.geom.coordinates as any[]).map(polyCoords => this.polygonCoordsToLatLngs(polyCoords));
          const poly = L.polygon(multi as any, {
            color: '#955138',
            weight: 2,
            fillOpacity: 0.18
          }).addTo(this.layerGroup);

          this.decoratePolygon(poly, z.name, `Area: ${z.area?.toLocaleString() ?? '—'}`, 'zone');
        }
      } catch (e) {
        console.error('Erreur dessin zone', z.id_zone, e);
      }
    }

    for (const b of this.plantationBlocks) {
      if (!b?.geom?.coordinates) continue;

      try {
        if (b.geom.type === 'Polygon') {
          const latlngRings = this.polygonCoordsToLatLngs(b.geom.coordinates);
          const poly = L.polygon(latlngRings, {
            color: '#1d4ed8',
            weight: 2,
            dashArray: '5 5',
            fillOpacity: 0.12
          }).addTo(this.layerGroup);

          this.decoratePolygon(poly, b.name, `Sous-parcelles: ${b.nb_sub_plot ?? '—'}`, 'block');
        } else if (b.geom.type === 'MultiPolygon') {
          const multi = (b.geom.coordinates as any[]).map(polyCoords => this.polygonCoordsToLatLngs(polyCoords));
          const poly = L.polygon(multi as any, {
            color: '#1d4ed8',
            weight: 2,
            dashArray: '5 5',
            fillOpacity: 0.12
          }).addTo(this.layerGroup);

          this.decoratePolygon(poly, b.name, `Sous-parcelles: ${b.nb_sub_plot ?? '—'}`, 'block');
        }
      } catch (e) {
        console.error('Erreur dessin plantation_block', b.id_plantation_block, e);
      }
    }

    for (const sp of this.subPlots) {
      if (!sp?.location?.coordinates) continue;

      try {
        const markerPosition = this.pointCoordsToLatLng(sp.location.coordinates);
        if (!markerPosition) continue;

        const marker = L.marker(markerPosition, {
          icon: L.divIcon({
            className: 'subplot-pin',
            html: `<div class="subplot-pin-dot"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        }).addTo(this.layerGroup);

        marker.bindPopup(`
          <strong>${sp.name}</strong><br/>
          Placette<br/>
          Bloc ID: ${sp.plantation_block_id ?? '—'}
        `);

        marker.bindTooltip(sp.name, {
          permanent: true,
          direction: 'top',
          offset: [0, -10],
          className: 'subplot-label'
        });
      } catch (e) {
        console.error('Erreur dessin sub_plot', sp.id_sub_plot, e);
      }
    }

    if (this.layerGroup.getLayers().length > 0) {
      this.map.fitBounds(this.layerGroup.getBounds(), { padding: [20, 20] });
    }
  }

  private polygonCoordsToLatLngs(polygonCoords: any): L.LatLngExpression[][] {
    return polygonCoords.map((ring: number[][]) =>
      ring.map(coord => {
        const lng = Number(coord[0]);
        const lat = Number(coord[1]);
        return [lat, lng] as L.LatLngExpression;
      })
    );
  }

  private pointCoordsToLatLng(coords: any): L.LatLngExpression | null {
    if (!Array.isArray(coords) || coords.length < 2) return null;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return [lat, lng];
  }

  private decoratePolygon(layer: L.Layer, name: string, extraText: string, kind: 'zone' | 'block'): void {
    if (!(layer instanceof L.Polygon)) return;

    const poly = layer as L.Polygon;
    const center = poly.getBounds().getCenter();

    poly.bindPopup(`<strong>${name}</strong><br/>${extraText}`);

    const marker = L.marker(center).addTo(this.layerGroup!);
    marker.bindPopup(`<strong>${name}</strong>`);
    marker.bindTooltip(name, {
      permanent: true,
      direction: 'top',
      offset: [0, -10],
      className: kind === 'zone' ? 'zone-label' : 'block-label'
    });

    marker.on('click', () => poly.openPopup());
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le backend est démarré.';
    }

    if (error.status === 403 || error.status === 401) {
      return 'Erreur CORS / autorisation. Vérifiez la configuration du backend.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${error.message || 'Problème de connexion'}`;
  }

  trackByZone(_: number, z: ZoneWeb) {
    return z.id_zone;
  }

  trackByBlock(_: number, b: PlantationBlocks) {
    return b.id_plantation_block;
  }

  trackBySubPlot(_: number, sp: SubPlot) {
    return sp.id_sub_plot;
  }
}
