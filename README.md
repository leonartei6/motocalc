# 🛵 MotoCalc

> Calculadora financeira inteligente para motoboys, entregadores e motoristas de aplicativo.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 📸 Preview

![MotoCalc Screenshot](./assets/screenshot.png)

---

## 💡 Sobre o projeto

O **MotoCalc** nasceu pra resolver um problema real de quem trabalha com moto:
**saber exatamente quanto cobrar por corrida pra NÃO sair no prejuízo.**

Diferente de outros apps do mercado, o MotoCalc:

- ✅ **Não pede informações que o motoboy não sabe** (tipo "quanto você ganha por km?")
- ✅ **Calcula sozinho** o valor mínimo a cobrar com base nos gastos reais
- ✅ **Organiza os vencimentos** e mostra o que precisa pagar primeiro
- ✅ Funciona **100% offline** no navegador, sem instalação
- ✅ Salva tudo localmente (privacidade total)

---

## ✨ Funcionalidades

### 💰 Gestão de Gastos
- Adicionar, editar e excluir gastos ilimitados
- Categorias visuais: 🛵 Moto / 👤 Pessoal
- Recorrência: 🔁 Mensal, 📅 Anual (auto-divide por 12) ou 1️⃣ Única
- 🚨 Marcação de prioridade com alertas

### 📅 Controle de Vencimentos
- Lista ordenada por urgência
- Cores automáticas (vermelho ≤ 7 dias prioritários, amarelo ≤ 15 dias)
- Cálculo automático: "precisa rodar X km nos próximos 7 dias"

### 🧮 Cálculos Inteligentes
- **Valor mínimo por km** auto-calculado com base nos gastos
- **3 cenários de rotina**: todo dia / dias úteis / só segunda a sexta
- Diluição automática de gastos anuais (IPVA, seguro)

### 🎯 Modo de Trabalho
- 🍔 **Delivery** — calcula só pela distância
- 🧍 **Passageiro** — considera distância + tempo
- 🔄 **Ambos** — libera as duas calculadoras

### 📱 PWA (Progressive Web App)
- Instalável no celular como app nativo (ícone na tela inicial)
- Funciona 100% offline depois da primeira visita
- Service Worker com cache inteligente
- Atualização automática quando uma nova versão é publicada

### 📊 Outros recursos
- 📈 Gráfico interativo de gastos (Chart.js)
- 📄 Exportação de relatório em PDF (jsPDF + html2canvas)
- 💾 Salvamento automático no navegador (localStorage)
- 📱 Layout 100% responsivo

---

## 🚀 Como rodar

Não precisa de instalação. Basta:

```bash
# 1. Clone o repositório
git clone https://github.com/leonartei6/motocalc.git

# 2. Entre na pasta
cd motocalc

# 3. Abra o index.html com um servidor local
# (recomendado: extensão Live Server do VS Code)
```

> ⚠️ **Importante:** o Service Worker (PWA offline) só funciona via `localhost` ou `https://`. Abrir o arquivo direto com duplo clique (`file://`) não ativa o modo offline.

---

## 🧮 A matemática por trás

O cálculo do valor mínimo por km é:

```
custo combustível/km = preço do litro ÷ km por litro

gastos fixos/km = total mensal ÷ (km por dia × dias trabalhados)

VALOR MÍNIMO/KM = custo combustível/km + gastos fixos/km
```

Para gastos anuais (IPVA, seguro), o sistema divide automaticamente por 12 para mostrar quanto guardar mensalmente.

---

## 🛠️ Tecnologias

- **HTML5** — estrutura semântica
- **CSS3** — design responsivo com Grid e Flexbox
- **JavaScript (Vanilla)** — toda a lógica e interatividade
- **Chart.js** — gráficos de gastos
- **jsPDF + html2canvas** — exportação de relatórios em PDF
- **localStorage** — persistência local
- **PWA** — instalável e funciona offline
- **Service Worker** — cache e suporte offline

---

## 📋 Roadmap

- [ ] Versão React + Vite com componentização
- [ ] Histórico de corridas reais (não só simulação)
- [ ] Dark mode 🌙
- [ ] Integração com Google Maps para distância automática
- [ ] Backend com Node.js + autenticação
- [ ] Notificações push pra alertas de vencimento

---

## 👨‍💻 Autor

Feito com 💛 por **Leonardo Teixeira**

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/leonartei)
[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/leonartei6)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para detalhes.