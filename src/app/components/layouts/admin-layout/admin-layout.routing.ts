import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { ScoreBoardListComponent } from '../../score-board-list/score-board-list.component';
import { MatchListComponent } from '../../match/list/match-list/match-list.component';
import {ChartsComponent} from "../../charts/charts.component";

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'match',          component: MatchListComponent },
    { path: 'scoreboard',  component: ScoreBoardListComponent },
    { path: 'charts',  component: ChartsComponent },
];
