import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Competition, COMPETITIONS, DEFAULT_COMPETITION } from '../../domain/model/competition/competition';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

  filterFormGroup!: FormGroup;
  competitions = COMPETITIONS;
  chartUrls: SafeResourceUrl[] = [];

  private readonly BASE_URL = 'https://charts.mongodb.com/charts-g12-jngvndg/embed/charts';
  private readonly CHARTS = [
    { id: '088e8f27-ce1e-461c-9b1c-cba875895db1', theme: 'dark' },
    { id: 'a0f95b62-58dd-40bb-ad8c-77bc9c3b8181', theme: 'light' },
    { id: '0024a16e-5055-464f-aaa8-b9e63c0bdac1', theme: 'light' },
    { id: 'a77c30ab-3380-41c7-86f4-887f79ed3c19', theme: 'light' },
    { id: 'aa9b22d6-314b-4d4d-b02c-0edb8ccdd111', theme: 'light' },
    { id: '9ceba9c1-61ce-4a0b-bc2a-75ccca6233bd', theme: 'light' },
  ];

  get selectedCompetition(): Competition {
    return this.filterFormGroup.get('competitionCtrl')?.value ?? DEFAULT_COMPETITION;
  }

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.filterFormGroup = this.fb.group({
      competitionCtrl: [DEFAULT_COMPETITION]
    });
    this.buildChartUrls();
  }

  onCompetitionChange(): void {
    this.buildChartUrls();
  }

  compareCompetition(a: Competition, b: Competition): boolean {
    return a?.competitionId === b?.competitionId && a?.year === b?.year;
  }

  private buildChartUrls(): void {
    const { year, competitionId } = this.selectedCompetition;
    const filter = encodeURIComponent(JSON.stringify({ year, competitionId }));

    console.log(competitionId);
    console.log(year);
    this.chartUrls = this.CHARTS.map(chart => {
      const url = `${this.BASE_URL}?id=${chart.id}&maxDataAge=14400&theme=${chart.theme}&autoRefresh=true&filter=${filter}`;
      console.log(url);
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }
}
