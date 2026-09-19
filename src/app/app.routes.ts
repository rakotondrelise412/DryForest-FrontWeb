// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PersonListComponent } from './pages/person/person-list/person-list';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PlantationListComponent } from './pages/plantation/plantation.component';
import { ZoneComponent } from './pages/zone/zone.component';
import { SurvivalRateDetailComponent } from './pages/survivalRateDetail/survival-rate-detail.component';
import { ObservationPatrolComponent } from './pages/observationPatrol/observationPatrol.component';
import { IncidentPatrolComponent } from './pages/incidentPatrol/incidentPatrol.component';
import { SpeciesStatComponent } from './pages/speciesStat/speciesStat.component';
import { AnimalTrackingComponent } from './pages/animalTracking/animalTracking.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion - Dry Forest'
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Tableau de bord - Dry Forest'
      },
      {
        path: 'persons',
        component: PersonListComponent,
        title: 'Personnel - Dry Forest'
      },
      {
        path: 'plantation',
        component: PlantationListComponent,
        title: 'Liste des plantations éffectuées'
      },
      {
        path: 'zones',
        component: ZoneComponent,
        title: 'Les zones'
      },
      {
        path: 'detail',
        component: SurvivalRateDetailComponent,
        title: 'Detaille du survis des especes'
      },
      {
        path: 'observation-patrol',
        component: ObservationPatrolComponent,
        title: 'Liste des obervations dans les zones'
      },
      {
        path: 'incident-patrol',
        component: IncidentPatrolComponent,
        title: 'Liste des incidents dans les zones'
      },
      {
        path: 'species-stat',
        component: SpeciesStatComponent,
        title: 'Statistiques de chaque espèces'
      },
      {
        path: 'animal-tracking',
        component: AnimalTrackingComponent,
        title: 'Les animaux observés pour chaque zone'
      },
      {
        path: '',  // Redirection depuis la racine
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',  // Page non trouvée
    redirectTo: '/login'
  }
];
