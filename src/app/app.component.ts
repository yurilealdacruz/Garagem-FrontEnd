import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Evento {
  tipo: 'entrada' | 'saida';
  createdAt: string; // ISO date string
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  contagemCimatec = 0;
  contagemVIP = 0;
  mensagemCimatec = '';
  mensagemVIP = '';

  historicoCimatec: Evento[] = [];
  historicoVIP: Evento[] = [];

  private intervalo: any;

  // Data para consulta do histórico (pode ser dinâmica, aqui fixamos para hoje)
  dataConsulta: string = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  loadingCimatec = false;
  loadingVIP = false;

  // Flag para controlar se é atualização automática ou manual
  atualizacaoAutomatica = false;

  // Controle visibilidade histórico para cada garagem
  historicoVisivelCimatec = false;
  historicoVisivelVIP = false;

  // Flags para carregamento e erro do histórico
  historicoCarregandoCimatec = false;
  historicoCarregandoVIP = false;

  historicoErroCimatec: string | null = null;
  historicoErroVIP: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.atualizacaoAutomatica = true;
    this.atualizarContagens();
    this.carregarHistorico('Cimatec Park', this.dataConsulta);
    this.carregarHistorico('VIP', this.dataConsulta);

    this.intervalo = setInterval(() => {
      this.atualizacaoAutomatica = true;
      this.atualizarContagens();
      this.carregarHistorico('Cimatec Park', this.dataConsulta);
      this.carregarHistorico('VIP', this.dataConsulta);
    }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  atualizarContagens() {
    this.getContagem('Cimatec Park');
    this.getContagem('VIP');
  }

  getContagem(garagem: string) {
    if (!this.atualizacaoAutomatica) {
      if (garagem === 'Cimatec Park') this.loadingCimatec = true;
      else if (garagem === 'VIP') this.loadingVIP = true;
    }

    this.http.get<any>(`https://garagem-backend-stia.onrender.com/garagem/contagem?garagem=${encodeURIComponent(garagem)}`)
      .subscribe(res => {
        if (garagem === 'Cimatec Park') {
          this.contagemCimatec = res.contagemAtual;
          if (!this.atualizacaoAutomatica) this.loadingCimatec = false;
        } else if (garagem === 'VIP') {
          this.contagemVIP = res.contagemAtual;
          if (!this.atualizacaoAutomatica) this.loadingVIP = false;
        }
      }, () => {
        if (!this.atualizacaoAutomatica) {
          if (garagem === 'Cimatec Park') this.loadingCimatec = false;
          else if (garagem === 'VIP') this.loadingVIP = false;
        }
      });

    this.atualizacaoAutomatica = false;
  }

  carregarHistorico(garagem: string, data: string) {
    if (garagem === 'Cimatec Park') {
      this.historicoCarregandoCimatec = true;
      this.historicoErroCimatec = null;
    } else if (garagem === 'VIP') {
      this.historicoCarregandoVIP = true;
      this.historicoErroVIP = null;
    }

    this.http.get<Evento[]>(`https://garagem-backend-stia.onrender.com/garagem/historico?garagem=${encodeURIComponent(garagem)}&data=${encodeURIComponent(data)}`)
      .subscribe({
        next: (res) => {
          if (garagem === 'Cimatec Park') {
            this.historicoCimatec = res;
            this.historicoCarregandoCimatec = false;
          } else if (garagem === 'VIP') {
            this.historicoVIP = res;
            this.historicoCarregandoVIP = false;
          }
        },
        error: () => {
          if (garagem === 'Cimatec Park') {
            this.historicoErroCimatec = 'Erro ao carregar histórico';
            this.historicoCarregandoCimatec = false;
          } else if (garagem === 'VIP') {
            this.historicoErroVIP = 'Erro ao carregar histórico';
            this.historicoCarregandoVIP = false;
          }
        }
      });
  }

  toggleHistorico(garagem: string) {
    if (garagem === 'Cimatec Park') {
      this.historicoVisivelCimatec = !this.historicoVisivelCimatec;
      if (this.historicoVisivelCimatec) {
        this.carregarHistorico('Cimatec Park', this.dataConsulta);
      }
    } else if (garagem === 'VIP') {
      this.historicoVisivelVIP = !this.historicoVisivelVIP;
      if (this.historicoVisivelVIP) {
        this.carregarHistorico('VIP', this.dataConsulta);
      }
    }
  }

  registrarEvento(tipo: 'entrada' | 'saida', garagem: string) {
    if (garagem === 'Cimatec Park') this.loadingCimatec = true;
    else if (garagem === 'VIP') this.loadingVIP = true;

    this.http.post<any>('https://garagem-backend-stia.onrender.com/garagem/evento', { evento: tipo, garagem })
      .subscribe(res => {
        if (garagem === 'Cimatec Park') {
          this.mensagemCimatec = res.mensagem;
          this.contagemCimatec = res.contagemAtual;
          this.loadingCimatec = false;
          this.carregarHistorico('Cimatec Park', this.dataConsulta);
        } else if (garagem === 'VIP') {
          this.mensagemVIP = res.mensagem;
          this.contagemVIP = res.contagemAtual;
          this.loadingVIP = false;
          this.carregarHistorico('VIP', this.dataConsulta);
        }
      }, () => {
        if (garagem === 'Cimatec Park') this.loadingCimatec = false;
        else if (garagem === 'VIP') this.loadingVIP = false;
      });
  }
}
