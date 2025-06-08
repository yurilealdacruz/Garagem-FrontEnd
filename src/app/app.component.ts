import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  contagemCimatec = 0;
  contagemVIP = 0;
  mensagemCimatec = '';
  mensagemVIP = '';
  loadingCimatec = false;
  loadingVIP = false;
  dataSelecionadaCimatec = '';
  dataSelecionadaVIP = '';
  historico: any[] = [];
  garageSelecionada = 'A';
  quantidade = 0;
  mensagem = '';

  // dados do login
  usuario = '';
  senha = '';
  senhaValida = false;

  private intervalo: any;
  private modalRef!: NgbModalRef;

  // Referências para os templates dos modais no HTML
  @ViewChild('loginModal') loginModal!: TemplateRef<any>;
  @ViewChild('editarModal') editarModal!: TemplateRef<any>;

  constructor(private http: HttpClient, private modalService: NgbModal) {}

  ngOnInit() {
    this.atualizarContagens();
    this.intervalo = setInterval(() => {
      this.atualizarContagens();
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
    let url = '';
    if (garagem === 'Cimatec Park') {
      url = 'https://obluda.pythonanywhere.com/api/carros_na_garagem/A/';
      this.loadingCimatec = true;
    } else if (garagem === 'VIP') {
      url = 'https://obluda.pythonanywhere.com/api/carros_na_garagem/B/';
      this.loadingVIP = true;
    }
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const contagem = res.carros_na_garagem ?? 0;
        if (garagem === 'Cimatec Park') {
          this.contagemCimatec = contagem;
          this.loadingCimatec = false;
        } else if (garagem === 'VIP') {
          this.contagemVIP = contagem;
          this.loadingVIP = false;
        }
      },
      error: () => {
        if (garagem === 'Cimatec Park') this.loadingCimatec = false;
        else if (garagem === 'VIP') this.loadingVIP = false;
      },
    });
  }

  buscarHistorico(garagem: string, data: string) {
    const url = `https://obluda.pythonanywhere.com/api/historico/${garagem}/${data}/`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.historico = res.historico;
      },
      error: (err) => {
        this.historico = [];
        alert('Erro ao buscar histórico: ' + (err.error?.error || err.message));
      },
    });
  }

  abrirModalLogin() {
    this.usuario = '';
    this.senha = '';
    this.senhaValida = false;
    this.modalRef = this.modalService.open(this.loginModal, { centered: true });
  }

  validarLogin() {
    // Aqui você pode validar contra um usuário e senha fixos (exemplo simples)
    if (this.usuario === 'ddd' && this.senha === 'ddd') {
      this.senhaValida = true;
      this.modalRef.close();
      this.abrirModalEditar();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  }

  abrirModalEditar() {
    this.modalRef = this.modalService.open(this.editarModal, { centered: true });
    this.mensagem = '';
    this.quantidade = 0;
    this.garageSelecionada = 'A';
  }

  ajustarQuantidade() {
  if (!this.senhaValida) {
    alert('Você precisa estar logado para ajustar a quantidade.');
    return;
  }

  const url = `https://obluda.pythonanywhere.com/api/ajustar_quantidade/${this.garageSelecionada}/`;

  this.http.post(url, {
    quantidade: this.quantidade,
    usuario: this.usuario,
    senha: this.senha
  }).subscribe({
    next: (res: any) => {
      this.mensagem = res.message || 'Quantidade ajustada com sucesso!';
      this.atualizarContagens();
      this.modalRef.close();
    },
    error: (err) => {
      this.mensagem = 'Erro: ' + (err.error?.error || err.message);
    },
  });
}

}
