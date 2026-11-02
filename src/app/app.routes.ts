import { Routes } from '@angular/router';
import { IdentityForm } from './identity-form/identity-form';
import { EgoForm } from './ego-form/ego-form';
import { BannerForm } from './banner-form/banner-form';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'identities' },
  { path: 'identities', component: IdentityForm, title: 'Identities · Limbus Admin' },
  { path: 'egos', component: EgoForm, title: 'E.G.O. · Limbus Admin' },
  { path: 'banners', component: BannerForm, title: 'Banners · Limbus Admin' },
  { path: '**', redirectTo: 'identities' },
];
