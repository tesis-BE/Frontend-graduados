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
import { ConversationService } from '@core/services/api/conversation.service';
import { environment } from '@/environments/environment';

export type DetailTab = 'overview' | 'experience' | 'education' | 'skills' | 'projects';

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
  activeTab = signal<DetailTab>('overview');

  readonly tabs: { id: DetailTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Resumen', icon: 'mdi-account-details' },
    { id: 'experience', label: 'Experiencia', icon: 'mdi-briefcase' },
    { id: 'education', label: 'Educación', icon: 'mdi-book-open-page-variant' },
    { id: 'skills', label: 'Habilidades', icon: 'mdi-star-shooting' },
    { id: 'projects', label: 'Proyectos', icon: 'mdi-folder-multiple' },
  ];

  avatarUrl = computed(() => {
    const grad = this.graduate();
    if (!grad?.photoUrl) return 'assets/images/users/sin-foto-perfil.jpg';
    return grad.photoUrl.startsWith('http')
      ? grad.photoUrl
      : `${environment.assetsUrl}${grad.photoUrl}`;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private sweetAlert: SweetAlertService,
    private conversationService: ConversationService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadGraduate(parseInt(id, 10));
  }

  goBack(): void {
    this.router.navigate(['/graduates']);
  }

  setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  downloadCV(): void {
    const grad = this.graduate();
    if (grad?.cvUrl) {
      window.open(grad.cvUrl, '_blank');
    } else {
      this.sweetAlert.warning('Sin CV', 'Este graduado no ha subido su CV');
    }
  }

  openLinkedIn(): void {
    const grad = this.graduate();
    if (grad?.linkedinUrl) window.open(grad.linkedinUrl, '_blank');
  }

  openPortfolio(url: string): void {
    window.open(url, '_blank');
  }

  openChat(): void {
    const grad = this.graduate();
    if (!grad?.id) return;
    this.conversationService.findOrCreateDirect(grad.id).subscribe({
      next: (response: any) => {
        const conversation = response?.data;
        if (conversation?.id) {
          this.router.navigate(['/messages'], {
            queryParams: { conversationId: conversation.id },
          });
        } else {
          this.sweetAlert.error('Error', 'No se pudo abrir la conversación');
        }
      },
      error: () => this.sweetAlert.error('Error', 'No se pudo iniciar el chat'),
    });
  }

  getLevelBadgeClass(level: string): string {
    const map: Record<string, string> = {
      beginner: 'badge-beginner',
      intermediate: 'badge-intermediate',
      advanced: 'badge-advanced',
      expert: 'badge-expert',
    };
    return map[level] ?? 'badge-intermediate';
  }

  getLevelText(level: string): string {
    const map: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto',
    };
    return map[level] ?? 'Intermedio';
  }

  private loadGraduate(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        const data = response.data || response;
        const graduate: Graduate = {
          ...data,
          availableForWork: data.availableForWork === true || data.availableForWork === 1,
          facultyName: data.faculty?.name || data.facultyName || null,
          careerName:
            data.educations?.[0]?.fieldOfStudy || data.careerName || null,
          graduationYear:
            data.educations?.[0]?.graduationYear ||
            data.graduationYear ||
            null,
          photoUrl: this.resolveUrl(data.photoUrl),
          cvUrl: this.resolveUrl(data.cvUrl),
          skills:
            data.skills?.map((s: any) => ({
              id: s.id,
              name: s.skillName || s.name,
              level: this.normalizeLevel(s.proficiencyLevel || s.level),
              yearsExperience: s.yearsExperience,
            })) ?? [],
          portfolio: data.portfolios || data.portfolio || [],
          workExperiences: data.workExperiences || [],
          education: data.educations || data.education || [],
          certifications: data.certifications || [],
          projects: data.projects || [],
        };
        this.graduate.set(graduate);
        this.isLoading.set(false);
      },
      error: () => {
        this.sweetAlert.error('Error', 'No se pudo cargar el perfil del graduado');
        this.isLoading.set(false);
        this.goBack();
      },
    });
  }

  private resolveUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.assetsUrl}${url}`;
  }

  private normalizeLevel(level: string | undefined): string {
    const map: Record<string, string> = {
      principiante: 'beginner',
      intermedio: 'intermediate',
      avanzado: 'advanced',
      experto: 'expert',
      beginner: 'beginner',
      intermediate: 'intermediate',
      advanced: 'advanced',
      expert: 'expert',
    };
    return map[level?.toLowerCase() ?? ''] ?? 'intermediate';
  }
}
