import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  loadingCimatec = false;
  loadingVIP = false;
  idParaEditar: number = 1;
  novaAcao: string = 'entrada';
  novaGaragem: string = 'A';
  mostrarEditor = false;


  private intervalo: any;

  constructor(private http: HttpClient) {}


  

  ngOnInit() {
    this.atualizarContagens();
    this.intervalo = setInterval(() => {
      this.atualizarContagens();
    }, 5000); // Atualiza a cada 5 segundos
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  atualizarContagens() {
    this.getContagem('Cimatec Park');
    this.getContagem('VIP');
  }

  garageSelecionada = 'A';
quantidade = 0;
mensagem = '';

ajustarQuantidade() {
  const url = `https://obluda.pythonanywhere.com/api/ajustar_quantidade/${this.garageSelecionada}/`;

  this.http.post(url, { quantidade: this.quantidade }).subscribe({
    next: (res: any) => {
      this.mensagem = res.message || 'Quantidade ajustada com sucesso!';
      this.atualizarContagens(); // Atualiza os números na tela
    },
    error: (err) => {
      this.mensagem = 'Erro ao ajustar quantidade: ' + (err.error?.error || err.message);
    }
  });
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
    }


    
  });

  

  
}






}
