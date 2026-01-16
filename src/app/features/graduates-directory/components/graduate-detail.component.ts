import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Graduate } from '@core/services/api/user.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-graduate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graduate-detail.component.html',
  styleUrls: ['./graduate-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduateDetailComponent implements OnInit {
  graduate = signal<Graduate | null>(null);
  isLoading = signal(true);
  
  avatarUrl = computed(() => {
    const grad = this.graduate();
    if (!grad?.photoUrl) return null;
    return grad.photoUrl.startsWith('http')
      ? grad.photoUrl
      : `${environment.assetsUrl}${grad.photoUrl}`;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private sweetAlert: SweetAlertService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadGraduate(parseInt(id));
    }
  }

  loadGraduate(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        const userData = response.data || response;
        
        // Normalizar datos
        const graduate: Graduate = {
          ...userData,
          isAvailable: userData.availableForWork,
          photoUrl: userData.photoUrl?.startsWith('http')
            ? userData.photoUrl
            : userData.photoUrl
              ? `${environment.assetsUrl}${userData.photoUrl}`
              : null,
          cvUrl: userData.cvUrl?.startsWith('http')
            ? userData.cvUrl
            : userData.cvUrl
              ? `${environment.assetsUrl}${userData.cvUrl}`
              : null,
          skills: userData.skills?.map((skill: any) => ({
            id: skill.id,
            name: skill.skillName || skill.name,
            level: this.normalizeProficiencyLevel(skill.proficiencyLevel || skill.level),
            yearsExperience: skill.yearsExperience,
          })) || [],
          portfolio: userData.portfolios || userData.portfolio || [],
          workExperiences: userData.workExperiences || [],
        };

        this.graduate.set(graduate);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo cargar el perfil del graduado');
        this.isLoading.set(false);
        this.goBack();
      },
    });
  }

  private normalizeProficiencyLevel(level: string | undefined): string {
    if (!level) return 'intermediate';
    
    const levelMap: { [key: string]: string } = {
      'principiante': 'beginner',
      'intermedio': 'intermediate',
      'avanzado': 'advanced',
      'experto': 'expert',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'expert',
    };

    return levelMap[level.toLowerCase()] || 'intermediate';
  }

  goBack(): void {
    this.router.navigate(['/graduates']);
  }

  downloadCV(): void {
    const grad = this.graduate();
    if (grad?.cvUrl) {
      window.open(grad.cvUrl, '_blank');
    } else {
      this.sweetAlert.warning('Sin CV', 'Este graduado no ha subido su CV');
    }
  }

  openPortfolio(url: string): void {
    window.open(url, '_blank');
  }

  openLinkedIn(): void {
    const grad = this.graduate();
    if (grad?.linkedinUrl) {
      window.open(grad.linkedinUrl, '_blank');
    }
  }

  contactGraduate(): void {
    const grad = this.graduate();
    if (grad?.email) {
      window.location.href = `mailto:${grad.email}`;
    }
  }

  getLevelBadgeClass(level: string): string {
    const levelMap: { [key: string]: string } = {
      'beginner': 'badge-beginner',
      'intermediate': 'badge-intermediate',
      'advanced': 'badge-advanced',
      'expert': 'badge-expert',
    };
    return levelMap[level] || 'badge-intermediate';
  }

  getLevelText(level: string): string {
    const levelMap: { [key: string]: string } = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado',
      'expert': 'Experto',
    };
    return levelMap[level] || 'Intermedio';
  }
}
