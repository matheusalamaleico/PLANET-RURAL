let mapa;
let mapaFazenda, mapaCidade;
let player;
let estado = "fazenda";

let sprites = {};
let direction = "down";
let isMoving = false;
let animFrame = 0;
let animTimer = 0;

let lastClick = { x: -1, y: -1 };
let hudMoney, hudCaixa;
let imgCasa01, imgCasa, imgloja, imgfeira, imgE, imgLojaMenu, imgVender, imgVenderBotao;
let imgInventarioVazio, imgSementeTrigo, imgSementeTomate, imgSementeMio;
let imgInventarioAtual;
let imgTrigoFase1, imgTrigoFase2, imgTrigoFase3;
let imgTomateFase1, imgTomateFase2, imgTomateFase3;
let imgMioFase1, imgMioFase2, imgMioFase3;

let mostrarLoja = false;
let mostrarVenderBotao = false;

let dinheiro = 30;
let colheita = 0;
let comprouSemente = false;

let plantações = [null, null, null];


let fadeAlpha = 0;
let fading = false;
let fadeDir = 1;
let proximoEstado = null;

let colheitaEfeitoAlpha = 0;
let colheitaEfeitoAtivo = false;

function preload() {
  mapaFazenda = loadImage("MAPA AGRINHO FAZENDA.png");
  mapaCidade = loadImage("cidade.png");
  mapa = mapaFazenda;

  hudMoney = loadImage("HUDmoney.png");
  hudCaixa = loadImage("HUDcaixa.png");

  imgInventarioVazio = loadImage("INVENTARIO VAZIO.png");
  imgSementeTrigo = loadImage("SEMENTE TRIGO.png");
  imgSementeTomate = loadImage("SEMENTE TOMATE.png");
  imgSementeMio = loadImage("SEMENTE MIO.png"); 
  imgInventarioAtual = imgInventarioVazio;

  imgTrigoFase1 = loadImage("TRIGO1.png");
  imgTrigoFase2 = loadImage("TRIGO02.png");
  imgTrigoFase3 = loadImage("TRIGO03.png");

  imgTomateFase1 = loadImage("tomate01.png");
  imgTomateFase2 = loadImage("tomate02.png");
  imgTomateFase3 = loadImage("tomate03.png");

  imgMioFase1 = loadImage("mio01.png");
  imgMioFase2 = loadImage("mio02.png");
  imgMioFase3 = loadImage("mio03.png");

  imgCasa01 = loadImage("casa01.png");
  imgCasa = loadImage("casa.png");
  imgloja = loadImage("loja.png");
  imgfeira = loadImage("FEIRA.png");
  imgE = loadImage("E.png");
  imgLojaMenu = loadImage("LOJA_MENU.png");
  imgVender = loadImage("Vender.png");
  imgVenderBotao = loadImage("Venderbotao.png");

  sprites["down_stand"] = loadImage("PARADO FRENTE.png");
  sprites["down_1"] = loadImage("CORRENDO FRENTE 01.png");
  sprites["down_2"] = loadImage("CORRENDO FRENTE 02.png");
  sprites["up_stand"] = loadImage("PARADO DE COSTAS.png");
  sprites["up_1"] = loadImage("CORRENDO DE COSTAS 01.png");
  sprites["up_2"] = loadImage("CORRENDO DE COSTAS 2.png");
  sprites["left_stand"] = loadImage("PARADO ESQUERDO.png");
  sprites["left_1"] = loadImage("CORRENDO ESQUERDA 01.png");
  sprites["left_2"] = loadImage("CORRENDO ESQUERDA 02.png");
  sprites["right_stand"] = loadImage("PARADO DIREITA.png");
  sprites["right_1"] = loadImage("CORRENDO DIREITA 01.png");
  sprites["right_2"] = loadImage("CORRENDO DIREITA 02.png");
}

function setup() {
  createCanvas(700, 500);
  player = createVector(350, 250);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);
}

function draw() {
  background(0);

  
  image(mapa, width / 2, height / 2);

  if (estado === "cidade") {
    image(imgCasa01, 180, 120);
    image(imgCasa01, 350, 320);
    image(imgCasa, 350, 120);
    image(imgCasa, 180, 320);
    image(imgloja, 545, 317, imgCasa.width * 1.1, imgCasa.height * 1.1);
    image(imgfeira, width - 215, 130, imgfeira.width * 0.6, imgfeira.height * 0.6);
    image(imgVender, 590, 130, imgVender.width * 0.6, imgVender.height * 0.6);
  }

  let podeMostrarLoja = plantações.some(p => p === null || (p && p.fase === 3));

  if (mostrarLoja && podeMostrarLoja) {
    image(imgLojaMenu, width / 2, height / 2);
  } else {
    mostrarLoja = false;
  }

  if (mostrarVenderBotao) image(imgVenderBotao, width / 2, height / 2);

  if (!mostrarLoja && !mostrarVenderBotao) {
    updatePlayer();
    drawPlayer();
  }

  // --- HUD MONEY E CAIXA ---

  imageMode(CORNER);
  let escala = 0.75;

  // HUD dinheiro atrás do inventário (fica atrás)
  image(hudMoney, 10, 10, hudMoney.width * escala, hudMoney.height * escala);
  fill(0);
  text(dinheiro, 10 + (hudMoney.width * escala) / 2, 10 + (hudMoney.height * escala) / 2);

  // HUD caixa atrás do inventário
  image(hudCaixa, 10, 10 + hudMoney.height * escala + 5, hudCaixa.width * escala, hudCaixa.height * escala);
  fill(0);
  text(colheita, 10 + (hudCaixa.width * escala) / 2, 10 + hudMoney.height * escala + 5 + (hudCaixa.height * escala) / 2);

  // --- INVENTÁRIO NA FRENTE DE TUDO (menos HUD dinheiro/caixa) ---
  image(imgInventarioAtual, 10, 10 + hudMoney.height * escala + 5 + hudCaixa.height * escala + 5, imgInventarioAtual.width * escala, imgInventarioAtual.height * escala);

  imageMode(CENTER);

  // Mostrar ícone 'E' nas posições de interação
  if (estado === "cidade") {
    if (player.x >= 425 && player.x <= 535 && player.y >= 160 && player.y <= 190) image(imgE, width - 215, 60, 25, 25);
    if (player.x >= 570 && player.x <= 610 && player.y >= 160 && player.y <= 190) image(imgE, 590, 60, 25, 25);
  }

  if (estado === "fazenda") {
    let posicoes = [205, 340, 474];
    for (let i = 0; i < 3; i++) {
      if (player.x >= posicoes[i] - 70 && player.x <= posicoes[i] + 70 && player.y >= 90 && player.y <= 203) {
        image(imgE, posicoes[i], 65, 25, 25);
      }

      let p = plantações[i];
      if (p) {
        let posY;
        let escalaPlanta;

        if (p.tipo === "trigo") {
          posY = (p.fase === 3) ? p.y - 20 : p.y - 10;
          escalaPlanta = p.fase === 1 ? 0.25 : 0.35;
        } else if (p.tipo === "tomate") {
          posY = (p.fase === 3) ? p.y - 15 - 17 : p.y - 5 - 17;
          escalaPlanta = 0.50;
        } else if (p.tipo === "mio") {
          posY = (p.fase === 3) ? p.y - 15 - 15 : p.y - 5 - 15;
          escalaPlanta = 0.40;
        }

        let img;
        if (p.tipo === "trigo") {
          img = p.fase === 1 ? imgTrigoFase1 : (p.fase === 2 ? imgTrigoFase2 : imgTrigoFase3);
        } else if (p.tipo === "tomate") {
          img = p.fase === 1 ? imgTomateFase1 : (p.fase === 2 ? imgTomateFase2 : imgTomateFase3);
        } else if (p.tipo === "mio") {
          img = p.fase === 1 ? imgMioFase1 : (p.fase === 2 ? imgMioFase2 : imgMioFase3);
        }

        image(img, p.x, posY, img.width * escalaPlanta, img.height * escalaPlanta);
      }
    }
  }


  // Mostrar fade na troca de mapa
  if (fading) {
    fill(0, fadeAlpha);
    rect(0, 0, width, height);

    fadeAlpha += fadeDir * 10;
    fadeAlpha = constrain(fadeAlpha, 0, 255);

    if (fadeAlpha === 255 && fadeDir === 1) {
      // Quando estiver completamente preto, troca o mapa
      if (proximoEstado) {
        estado = proximoEstado;
        mapa = (estado === "fazenda") ? mapaFazenda : mapaCidade;

        // Ajustar posição inicial do player ao mudar mapa
        if (estado === "fazenda") {
          player.x = 663;
          player.y = 222;
        } else {
          player.x = 26;
          player.y = 221;
        }
      }

      fadeDir = -1; // Começar a clarear
    }

    if (fadeAlpha === 0 && fadeDir === -1) {
      fading = false;
      fadeDir = 1;
      proximoEstado = null;
    }
  }


}

function updatePlayer() {
  if (fading || mostrarLoja || mostrarVenderBotao) return; // Bloqueia movimento durante fade ou menus abertos

  let speed = 3.5;
  isMoving = false;
  let nextX = player.x;
  let nextY = player.y;

  if (keyIsDown(87)) { nextY -= speed; direction = "up"; isMoving = true; }
  else if (keyIsDown(83)) { nextY += speed; direction = "down"; isMoving = true; }
  else if (keyIsDown(65)) { nextX -= speed; direction = "left"; isMoving = true; }
  else if (keyIsDown(68)) { nextX += speed; direction = "right"; isMoving = true; }

  // Colisões da fazenda
  if (estado === "fazenda") {
    if (nextX < 110 && nextY >= 51 && nextY <= 390 && player.x >= 100) nextX = 110;
    if (nextY < 51 && nextX >= 100 && nextX <= 572 && player.y >= 51) nextY = 51;
    if (nextY > 368 && nextX >= 90 && nextX <= 570 && player.y <= 368) nextY = 368;
    if (nextX > 553 && nextY >= 225 && nextY <= 381 && player.x <= 562) nextX = 553;
    if (nextX > 553 && nextY >= 52 && nextY <= 183 && player.x <= 553) nextX = 553;
    if (keyIsDown(83) && player.y < 225 && nextY >= 225 && nextX >= 562 && nextX <= 580) nextY = player.y;
    if (nextX < 590 && nextY >= 225 && nextY <= 258 && player.x >= 590) nextX = 590;
    if (keyIsDown(83) && player.y < 237 && nextY >= 237 && nextX >= 581 && nextX <= 705) nextY = player.y;
    if (keyIsDown(87) && player.y > 175 && nextY <= 175 && nextX >= 554 && nextX <= 705) nextY = player.y;
  }

  // Colisões da cidade
  if (estado === "cidade") {
    if (keyIsDown(87) && player.y > 180 && nextY <= 180 && nextX >= 1 && nextX <= 92) nextY = player.y;
    if (keyIsDown(83) && player.y < 237 && nextY >= 237 && nextX >= 0 && nextX <= 83) nextY = player.y;
    if (keyIsDown(68) && player.x < 74 && nextX >= 74 && nextY >= 234 && nextY <= 257) nextX = player.x;
    if (keyIsDown(83) && player.y < 220 && nextY >= 220 && nextX >= 65 && nextX <= 92) nextY = player.y;
    if (keyIsDown(65) && player.x > 91 && nextX <= 91 && nextY >= 241 && nextY <= 408) nextX = player.x;
    if (keyIsDown(83) && player.y < 390 && nextY >= 390 && nextX >= 91 && nextX <= 649) nextY = player.y;
    if (keyIsDown(68) && player.x < 650 && nextX >= 650 && nextY >= 39 && nextY <= 390) nextX = player.x;
    if (keyIsDown(65) && player.x > 91 && nextX <= 91 && nextY >= 81 && nextY <= 186) nextX = player.x;
    if (keyIsDown(87) && player.y > 167 && nextY <= 167 && nextX >= 0 && nextX <= 700) nextY = player.y;
    if (keyIsDown(65) && player.x > 462 && nextX <= 462 && nextY >= 30 && nextY <= 167) nextX = player.x;
    if (keyIsDown(87) && player.y > 30 && nextY <= 30 && nextX >= 462 && nextX <= 644) nextY = player.y;
    if (keyIsDown(83) && player.y < 245 && nextY >= 245 && nextX >= 86 && nextX <= 653) nextY = player.y;
    if (keyIsDown(83) && player.y < 170 && nextY >= 170 && nextX >= 395 && nextX <= 635) nextY = player.y;
  }

  // Troca de mapa com fade
  if (estado === "fazenda" && player.x >= 690 && player.x <= 705 && player.y >= 150 && player.y <= 255 && !fading) {
    proximoEstado = "cidade";
    fading = true;
    fadeAlpha = 0;
    fadeDir = 1;
  }

  if (estado === "cidade" && player.x >= 0 && player.x <= 10 && player.y >= 150 && player.y <= 255 && !fading) {
    proximoEstado = "fazenda";
    fading = true;
    fadeAlpha = 0;
    fadeDir = 1;
  }

  player.x = nextX;
  player.y = nextY;

  if (isMoving) {
    animTimer++;
    if (animTimer > 10) {
      animFrame = (animFrame + 1) % 2;
      animTimer = 0;
    }
  } else {
    animFrame = 0;
    animTimer = 0;
  }
}

function drawPlayer() {
  let spriteKey = direction + "_stand";
  if (isMoving) spriteKey = direction + "_" + (animFrame + 1);
  let sprite = sprites[spriteKey];
  if (sprite) image(sprite, player.x, player.y, 48, 48);
}

function keyPressed() {
  if (estado === "cidade" && (key === 'e' || key === 'E')) {
    if (player.x >= 425 && player.x <= 535 && player.y >= 170 && player.y <= 200) mostrarLoja = true;
    else if (player.x >= 570 && player.x <= 610 && player.y >= 160 && player.y <= 190) mostrarVenderBotao = true;
  }

  if (estado === "fazenda" && (key === 'e' || key === 'E')) {
    let posicoes = [205, 340, 474];
    for (let i = 0; i < 3; i++) {
      let p = plantações[i];

      if (p) {
        if (p.fase === 3 && player.x >= p.x - 70 && player.x <= p.x + 70 && player.y >= 90 && player.y <= 203) {
          if (p.tipo === "trigo") {
            colheita += 9;
          } else if (p.tipo === "tomate") {
            colheita += 12;
          } else if (p.tipo === "mio") {
            colheita += 18;
          }
          plantações[i] = null;

          // Ativa efeito visual na colheita
          colheitaEfeitoAtivo = true;
          colheitaEfeitoAlpha = 255;

          return;
        }
      } else {
        if (player.x >= posicoes[i] - 70 && player.x <= posicoes[i] + 70 && player.y >= 90 && player.y <= 203) {
          if (imgInventarioAtual === imgSementeTrigo) {
            plantações[i] = { x: posicoes[i], y: 140, fase: 1, tipo: "trigo" };
            comprouSemente = false;
            imgInventarioAtual = imgInventarioVazio;
            evoluirPlanta(i);
          } else if (imgInventarioAtual === imgSementeTomate) {
            plantações[i] = { x: posicoes[i], y: 140, fase: 1, tipo: "tomate" };
            comprouSemente = false;
            imgInventarioAtual = imgInventarioVazio;
            evoluirPlanta(i);
          } else if (imgInventarioAtual === imgSementeMio) {
            plantações[i] = { x: posicoes[i], y: 140, fase: 1, tipo: "mio" };
            comprouSemente = false;
            imgInventarioAtual = imgInventarioVazio;
            evoluirPlanta(i);
          }
        }
      }
    }
  }

  if (keyCode === ESCAPE) {
    mostrarLoja = false;
    mostrarVenderBotao = false;
  }
}

function evoluirPlanta(i) {
  setTimeout(() => {
    if (plantações[i]) plantações[i].fase = 2;
  }, 10000);
  setTimeout(() => {
    if (plantações[i]) plantações[i].fase = 3;
  }, 20000);
}

function mousePressed() {
  lastClick.x = mouseX;
  lastClick.y = mouseY;

  let podeComprar = plantações.some(p => p === null || (p && p.fase === 3));

  if (mostrarLoja && podeComprar) {
    if (mouseX >= 464 && mouseX <= 504 && mouseY >= 69 && mouseY <= 202) mostrarLoja = false;

    if (!comprouSemente && mouseX >= 384 && mouseX <= 450 && mouseY >= 158 && mouseY <= 186 && dinheiro >= 10) {
      dinheiro -= 10;
      imgInventarioAtual = imgSementeTrigo;
      comprouSemente = true;
    } else if (!comprouSemente && mouseX >= 382 && mouseX <= 450 && mouseY >= 250 && mouseY <= 277 && dinheiro >= 20) {
      dinheiro -= 20;
      imgInventarioAtual = imgSementeTomate;
      comprouSemente = true;
    } else if (!comprouSemente && mouseX >= 382 && mouseX <= 450 && mouseY >= 335 && mouseY <= 370 && dinheiro >= 30) {
      // Hitbox abaixada do Mio (antes era 310 a 340)
      dinheiro -= 30;
      imgInventarioAtual = imgSementeMio;
      comprouSemente = true;
    }
  }

  if (mostrarVenderBotao && mouseX >= 222 && mouseX <= 476 && mouseY >= 177 && mouseY <= 317) {
    dinheiro += colheita * 10;
    colheita = 0;
    mostrarVenderBotao = false;
  }
}
